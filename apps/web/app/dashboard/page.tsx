/**
 * Staff dashboard (PRD F2). USD-denominated: balances by fund, recent activity, donor
 * list, CSV export. Reads from the Postgres mirror (never the chain directly in the hot
 * path). Payout initiation (F3) lives here behind the Admin/Approver roles.
 *
 * Stub — wire to @steward/db queries scoped by the signed-in member's org + role.
 */
const DEMO_FUNDS = [
  { name: "Offertory", balanceUsd: 0 },
  { name: "Building Fund", balanceUsd: 0 },
  { name: "School Annual Fund", balanceUsd: 0 },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Treasury</h1>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {DEMO_FUNDS.map((f) => (
          <div key={f.name} className="rounded-lg border p-4">
            <div className="text-sm opacity-70">{f.name}</div>
            <div className="text-2xl font-semibold">${f.balanceUsd.toLocaleString()}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Recent activity</h2>
        <p className="text-sm opacity-60">No activity yet. Gifts appear here once the ledger sync is live.</p>
      </section>

      <p className="text-xs opacity-50">
        Payouts require 2-of-N approval, enforced on-chain by the Squads multisig (PRD G4).
      </p>
    </main>
  );
}
