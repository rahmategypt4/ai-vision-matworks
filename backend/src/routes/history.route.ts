import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getHistory, deleteIdentification } from "../db/repository.js";

const QuerySchema = z.object({
  sessionId: z.string().min(1),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export async function historyRoute(fastify: FastifyInstance): Promise<void> {
  // GET /history?sessionId=xxx&page=1&pageSize=20
  fastify.get("/history", async (request, reply) => {
    const parseResult = QuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation error",
        details: parseResult.error.flatten(),
      });
    }

    const { sessionId, page, pageSize } = parseResult.data;
    const history = await getHistory(sessionId, page, pageSize);
    return reply.status(200).send(history);
  });

  // DELETE /history/:id
  fastify.delete("/history/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    if (!id) return reply.status(400).send({ error: "id is required" });

    const deleted = await deleteIdentification(id);
    if (!deleted) return reply.status(404).send({ error: "Record not found" });

    return reply.status(200).send({ success: true });
  });
}
