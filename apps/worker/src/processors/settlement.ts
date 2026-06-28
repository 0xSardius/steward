import { schema } from "@steward/db";
import type { Database } from "@steward/db";
import type { LedgerJob } from "../queue.js";

/**
 * Apply a ledger job IDEMPOTENTLY (CLAUDE.md rule #2).
 *
 * Every job carries a stable external id (tx signature or provider event id). We insert
 * a `processed_events` row keyed by that id FIRST; if it already exists, the delivery is a
 * duplicate and we return without re-applying effects. High-value credits should only be
 * applied once the chain reports `finalized` commitment.
 */
export async function applyLedgerJob(db: Database, job: LedgerJob): Promise<"applied" | "duplicate"> {
  const eventKey = eventKeyFor(job);

  // Claim the event; ON CONFLICT DO NOTHING makes the claim atomic + idempotent.
  const inserted = await db
    .insert(schema.processedEvents)
    .values({ eventKey, source: job.kind, payload: job.raw as object })
    .onConflictDoNothing({ target: schema.processedEvents.eventKey })
    .returning({ eventKey: schema.processedEvents.eventKey });

  if (inserted.length === 0) return "duplicate";

  switch (job.kind) {
    case "helius.settlement":
      // TODO: parse the transfer, match it to (org, fund) via the gift's rampReference,
      // mark the gift settled, and increment the cached fund balance. Validate account
      // owner/amount before trusting the parsed data (CLAUDE.md untrusted-data rule).
      break;
    case "bridge.event":
      // TODO: on-ramp credited / off-ramp settled -> update gift or payout status.
      break;
    case "stripe.event":
      // TODO: onramp session completed -> create/settle the corresponding gift.
      break;
  }

  return "applied";
}

function eventKeyFor(job: LedgerJob): string {
  switch (job.kind) {
    case "helius.settlement":
      return `helius:${job.signature}`;
    case "bridge.event":
      return `bridge:${job.eventId}`;
    case "stripe.event":
      return `stripe:${job.eventId}`;
  }
}
