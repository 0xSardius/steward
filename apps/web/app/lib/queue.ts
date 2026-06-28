import "server-only";
import { LEDGER_QUEUE_NAME, type LedgerJob } from "@steward/core";
import { Queue } from "bullmq";
import IORedis from "ioredis";

// Producer side of the ledger-sync queue. The worker (apps/worker) is the consumer.
const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const ledgerQueue = new Queue<LedgerJob>(LEDGER_QUEUE_NAME, { connection });

/** Enqueue with the event id as the jobId so BullMQ drops duplicate enqueues too. */
export async function enqueueLedgerJob(job: LedgerJob, dedupeId: string) {
  await ledgerQueue.add("ledger-job", job, { jobId: dedupeId, removeOnComplete: 1000, attempts: 5 });
}
