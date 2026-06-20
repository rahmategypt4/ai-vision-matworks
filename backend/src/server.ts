import Fastify from "fastify";
import cors from "@fastify/cors";
import { testConnection } from "./db/connection.js";
import { identifyRoute } from "./routes/identify.route.js";
import { historyRoute } from "./routes/history.route.js";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? "info",
    transport:
      process.env.NODE_ENV !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

// CORS — allow Next.js frontend
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  methods: ["GET", "POST", "DELETE"],
});

// Health check
fastify.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
await fastify.register(identifyRoute, { prefix: "/api/v1" });
await fastify.register(historyRoute, { prefix: "/api/v1" });

// Boot
async function start(): Promise<void> {
  try {
    fastify.log.info("Testing MySQL connection...");
    await testConnection();
    fastify.log.info("MySQL connected.");
  } catch (err) {
    // Non-fatal: history/persistence features will be unavailable, but
    // the core identify flow (OpenAI Vision) does not require a database.
    fastify.log.warn(
      { err },
      "MySQL unavailable — starting without database. History features will be disabled."
    );
  }

  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Backend running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
