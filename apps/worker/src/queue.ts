import { LEDGER_QUEUE_NAME, type LedgerJob } from "@steward/core";
import { Queue } from "bullmq";
import IORedis from "ioredis";

export const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const QUEUE_NAME = LEDGER_QUEUE_NAME;
export type { LedgerJob };

export const ledgerQueue = new Queue<LedgerJob>(QUEUE_NAME, { connection });
