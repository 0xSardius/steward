# Build Context — Steward

Phase 2 (Build) handoff. Written by `scaffold-project`.

## Stack

- **Repo shape:** pnpm monorepo (pnpm@10.18.3, Node 22). Apps + shared packages.
- **No Anchor / no custom program** — integrate-only MVP (Squads V4 + SPL USDC + off-chain services).
- **Frontend:** Next.js 15 (App Router) + Tailwind v4 + `@solana/kit`.
- **Auth/keys:** Privy embedded wallets (`@privy-io/react-auth`, `@privy-io/server-auth`).
- **Treasury:** Squads V4 (`@sqds/multisig`) — ADR-0001.
- **Ledger:** Drizzle ORM + Postgres (`@steward/db`) — the on-chain mirror.
- **Sync:** Helius webhooks → BullMQ (Redis) → worker (idempotent) — `apps/worker`.
- **Email:** Resend. **Ramps:** Stripe Crypto Onramp (card) + Bridge (ACH/wire).

## Workspace layout

```
apps/web        Next.js — giving pages, dashboard, webhook + action API routes
apps/worker     BullMQ consumer — applies webhook events to the Postgres mirror idempotently
packages/core   Domain types + zod schemas + the shared ledger-queue contract
packages/db     Drizzle schema (orgs, funds, members, donors, gifts, payouts, processed_events, audit_log) + client
packages/solana Squads V4 helpers (typed stubs) + @solana/kit RPC
```

## Architecture

- **Pattern:** Integrate-first dApp + data-pipeline hybrid (Frontend & dApps + Infrastructure & Data).
- **Key invariants** (enforced in code + CLAUDE.md): funds live on-chain / Postgres mirrors; idempotent webhook sync (dedupe on signature/event id via `processed_events` + BullMQ jobId); payouts are Squads proposals (2-of-N on-chain); non-custodial; invisible-crypto (donors have no wallet).
- **Decisions:** see `DECISIONS.md` ADR-0001..0004.

## Commands

```bash
pnpm install
pnpm dev            # web (Next.js)
pnpm dev:worker     # ledger-sync worker (needs Redis)
pnpm typecheck      # all packages — currently GREEN
pnpm db:generate    # drizzle migrations from schema
pnpm db:migrate
```

## build_status

- mvp_complete: false
- tests_passing: false   (no tests yet)
- devnet_deployed: false
- typecheck_passing: true

## Verification done at scaffold time

- `pnpm install` clean (peer warnings only: React 19 vs libs pinned to 18 — non-fatal).
- `pnpm -r typecheck` GREEN across all 5 projects.
- `next build` NOT run (route handlers open Redis connections at import; needs a running Redis). Run locally with infra up.

## Integration points still stubbed (where engineering goes next)

- `packages/solana/src/squads.ts` — createOrgMultisig / proposePayout / approvePayout / executePayout (throw "not implemented").
- `apps/worker/src/processors/settlement.ts` — parse + attribute settlements; verify untrusted on-chain data before trusting.
- Webhook routes — signature verification (Stripe/Bridge/Helius) is TODO before trusting bodies.
- Privy provider + session-signer wiring; fee-payer sponsorship (Kora optional).

## MCP / infra setup needed before running

- **Helius:** set `HELIUS_API_KEY` (RPC + webhooks). Optionally add the Helius MCP server with a key.
- **Solana MCP** already registered for this project (`mcp.solana.com/mcp`, HTTP, no key).
- Local **Postgres** + **Redis** for `pnpm dev:worker` and the dashboard.
- Copy `.env.example` → `apps/web/.env.local` and `apps/worker/.env`.

## Next phase

Proceed to **build-with-claude** for guided MVP implementation, starting with: Privy auth + org/Squads multisig creation (ADR-0001), then the giving flow (F1), then the ledger sync worker (F2), then dual-control payouts (F3).
