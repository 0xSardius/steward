import { enqueueLedgerJob } from "@/app/lib/queue";
import { NextResponse } from "next/server";

/**
 * Stripe Crypto Onramp webhook (card / Apple Pay -> USDC on Solana).
 *
 * TODO: verify the Stripe signature with STRIPE_WEBHOOK_SECRET before trusting the body.
 * We enqueue and return 200 fast; the worker applies effects idempotently.
 */
export async function POST(req: Request) {
  const event = (await req.json()) as { id?: string };
  if (!event.id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  await enqueueLedgerJob({ kind: "stripe.event", eventId: event.id, raw: event }, `stripe:${event.id}`);
  return NextResponse.json({ received: true });
}
