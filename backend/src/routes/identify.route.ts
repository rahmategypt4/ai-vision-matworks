import type { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { identifyItemWithGPT4, AI_MODEL } from "../services/openai.service.js";
import { searchGoogleShopping, buildMarketQuery } from "../services/serpapi.service.js";
import { uploadImageToS3 } from "../services/s3.service.js";
import { insertIdentification } from "../db/repository.js";

const BodySchema = z.object({
  imageBase64: z.string().min(1, "imageBase64 is required"),
  mimeType: z.string().regex(/^image\/(png|jpe?g|webp|gif|heic|heif)$/i, "Invalid mime type"),
  fileSizeBytes: z.number().int().positive(),
  sessionId: z.string().min(1),
});

export async function identifyRoute(fastify: FastifyInstance): Promise<void> {
  fastify.post("/identify", async (request, reply) => {
    const parseResult = BodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation error",
        details: parseResult.error.flatten(),
      });
    }

    const { imageBase64, mimeType, fileSizeBytes, sessionId } = parseResult.data;

    const MAX_BYTES = 8 * 1024 * 1024; // 8MB base64 ≈ ~6MB actual
    if (imageBase64.length > MAX_BYTES) {
      return reply.status(413).send({ error: "Gambar terlalu besar. Maksimum sekitar 6MB." });
    }

    // Call OpenAI GPT-4o
    let result;
    try {
      result = await identifyItemWithGPT4(imageBase64, mimeType);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      fastify.log.error({ err }, "OpenAI error");

      if (msg.includes("429"))
        return reply.status(429).send({ error: "Terlalu banyak permintaan. Coba lagi sebentar." });
      if (msg.includes("insufficient_quota"))
        return reply.status(402).send({ error: "Kredit OpenAI habis." });

      return reply.status(500).send({
        error: "AI tidak dapat mengenali gambar. Coba foto lain dengan pencahayaan lebih baik.",
      });
    }

    // Optional S3 upload
    const id = uuidv4();
    let imageUrl: string | null = null;
    try {
      const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
      imageUrl = await uploadImageToS3(
        Buffer.from(imageBase64, "base64"),
        `identifications/${sessionId}/${id}.${ext}`,
        mimeType
      );
    } catch (err) {
      fastify.log.warn({ err }, "S3 upload failed — continuing without image URL");
    }

    // Fetch real-time market listings from Google Shopping (best-effort, never blocks)
    const marketQuery = buildMarketQuery(result);
    let marketListings: Awaited<ReturnType<typeof searchGoogleShopping>> = [];
    try {
      marketListings = await searchGoogleShopping(marketQuery);
    } catch (err) {
      fastify.log.warn({ err }, "Google Shopping lookup failed — continuing without market data");
    }

    // Save to MySQL (best-effort — identify still works without a database)
    try {
      await insertIdentification({
        id,
        sessionId,
        imageUrl,
        mimeType,
        fileSizeBytes,
        ...result,
        aiModel: AI_MODEL,
      });
    } catch (err) {
      fastify.log.warn({ err }, "Failed to save identification to database — continuing without persistence");
    }

    return reply.status(200).send({ id, ...result, imageUrl, marketQuery, marketListings });
  });
}
