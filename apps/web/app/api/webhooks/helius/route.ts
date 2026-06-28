import { enqueueLedgerJob } from "@/app/lib/queue";
import { NextResponse } from "next/server";

/**
 * Helius webhook — on-chain settlement of USDC into an org's Squads vault.
 *
 * Helius may deliver an array of enhanced transactions, and deliveries can DUPLICATE,
 * so we enqueue each by its signature as the dedupe id; the worker dedupes again at the
 * DB layer (CLAUDE.md rule #2). TODO: verify the Helius auth header before trusting.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as Array<{ signature?: string }> | { signature?: string };
  const txns = Array.isArray(body) ? body : [body];

  for (const tx of txns) {
    if (!tx.signature) continue;
    await enqueueLedgerJob(
      { kind: "helius.settlement", signature: tx.signature, raw: tx },
      `helius:${tx.signature}`,
    );
  }
  return NextResponse.json({ received: txns.length });
}
