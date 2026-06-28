/**
 * Donor giving page (PRD F1). Donor never sees crypto and never needs a wallet — they
 * pay fiat and a ramp converts to USDC into the org's Squads vault.
 *
 * Rail steering (ADR-0004): recurring defaults to ACH (Bridge); one-time prominently
 * offers card/Apple Pay (Stripe Onramp) for conversion, with ACH alongside.
 *
 * Stub UI — fund list + amounts come from the org config; submit -> /api/give.
 */
export default async function GivePage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-8">
      <header>
        <h1 className="text-2xl font-semibold">Give to {decodeURIComponent(org)}</h1>
        <p className="text-sm opacity-70">Secure giving. You&apos;ll receive a receipt by email.</p>
      </header>

      <form className="flex flex-col gap-4" action="/api/give" method="post">
        <label className="flex flex-col gap-1 text-sm">
          Fund
          <select name="fund" className="rounded border p-2">
            <option>Offertory</option>
            <option>Building Fund</option>
            <option>School Annual Fund</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Amount (USD)
          <input name="amount" type="number" min="1" step="1" defaultValue={25} className="rounded border p-2" />
        </label>

        <fieldset className="flex gap-4 text-sm">
          <label className="flex items-center gap-1">
            <input type="radio" name="frequency" value="one_time" defaultChecked /> One-time
          </label>
          <label className="flex items-center gap-1">
            <input type="radio" name="frequency" value="monthly" /> Monthly
          </label>
        </fieldset>

        <button type="submit" className="rounded bg-foreground p-3 font-medium text-background">
          Continue
        </button>
        <p className="text-center text-xs opacity-60">
          Tip: bank transfer (ACH) sends ~1.5% more of your gift to {decodeURIComponent(org)} than card.
        </p>
      </form>
    </main>
  );
}
