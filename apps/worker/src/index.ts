import "dotenv/config";
import { Worker } from "bullmq";
import { getDb } from "@steward/db";
import { applyLedgerJob } from "./processors/settlement.js";
import { connection, QUEUE_NAME, type LedgerJob } from "./queue.js";

/**
 * Ledger-sync worker. Web API routes enqueue raw webhook payloads (Helius / Bridge /
 * Stripe); this long-running process applies them to the Postgres mirror idempotently,
 * with BullMQ retries + a dead-letter (failed) queue. It is intentionally a SEPARATE
 * process from the Next.js app (the reason the repo is a monorepo).
 */
const db = getDb();

const worker = new Worker<LedgerJob>(
  QUEUE_NAME,
  async (job) => {
    const result = await applyLedgerJob(db, job.data);
    return { result };
  },
  { connection, concurrency: 8 },
);

worker.on("completed", (job, ret) => {
  console.log(`[worker] ${job.id} ${job.data.kind} -> ${JSON.stringify(ret)}`);
});
worker.on("failed", (job, err) => {
  console.error(`[worker] ${job?.id} ${job?.data.kind} FAILED:`, err.message);
});

console.log(`[worker] listening on "${QUEUE_NAME}"`);

const shutdown = async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
