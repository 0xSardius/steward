import { enqueueLedgerJob } from "@/app/lib/queue";
import { NextResponse } from "next/server";

/**
 * Bridge webhook (ACH/wire on-ramp credited; off-ramp/payout settled).
 *
 * TODO: verify the Bridge signature with BRIDGE_WEBHOOK_SECRET before trusting the body.
 */
export async function POST(req: Request) {
  const event = (await req.json()) as { id?: string };
  if (!event.id) return NextResponse.json({ error: "missing id" }, { status: 400 });

  await enqueueLedgerJob({ kind: "bridge.event", eventId: event.id, raw: event }, `bridge:${event.id}`);
  return NextResponse.json({ received: true });
}
