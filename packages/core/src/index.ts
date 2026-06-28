/**
 * @steward/core — shared domain types for the Steward platform.
 *
 * These types model the *org-facing* layer (the proprietary build): organizations,
 * designated funds, roles, gifts, and dual-control payouts. On-chain truth lives in
 * the Squads multisig + USDC token accounts; these types describe how the app and the
 * Postgres mirror reason about that truth.
 */
import { z } from "zod";

// ─── Roles (map onto Squads member permissions for any role that signs) ─────────
export const Role = {
  /** Pastor — accountable owner. */
  Owner: "owner",
  /** Bookkeeper / secretary — daily operator. */
  Admin: "admin",
  /** Finance council member — co-approves payouts (canon-law oversight). */
  Approver: "approver",
  /** Auditor / diocese — read-only. */
  Viewer: "viewer",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

/** Roles that are Squads multisig members (i.e. can sign on-chain). */
export const SIGNING_ROLES: ReadonlySet<Role> = new Set([Role.Owner, Role.Admin, Role.Approver]);

// ─── Ramp rails (see PRD §10, ADR-0004) ─────────────────────────────────────────
export const RampRail = {
  /** Card / Apple Pay / Google Pay -> USDC on Solana, via Stripe Crypto Onramp. */
  StripeOnramp: "stripe_onramp",
  /** ACH / wire -> USDC on Solana, via a Bridge virtual account. */
  BridgeVirtualAccount: "bridge_virtual_account",
} as const;
export type RampRail = (typeof RampRail)[keyof typeof RampRail];

export const GiftFrequency = { OneTime: "one_time", Monthly: "monthly", Weekly: "weekly" } as const;
export type GiftFrequency = (typeof GiftFrequency)[keyof typeof GiftFrequency];

export const PayoutStatus = {
  Proposed: "proposed", // Squads transaction proposal created
  Approved: "approved", // 2-of-N threshold met on-chain
  Executing: "executing", // off-ramp in flight (Bridge)
  Settled: "settled", // ACH/wire reached the parish bank
  Rejected: "rejected",
  Failed: "failed",
} as const;
export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

// ─── Money. Store integer minor units (USDC has 6 decimals) — never floats. ─────
export const USDC_DECIMALS = 6;
/** A USDC amount in base units (1 USDC = 1_000_000). */
export type UsdcBaseUnits = bigint;

export const usdToBaseUnits = (usd: number): UsdcBaseUnits =>
  BigInt(Math.round(usd * 10 ** USDC_DECIMALS));
export const baseUnitsToUsd = (units: UsdcBaseUnits): number => Number(units) / 10 ** USDC_DECIMALS;

// ─── Zod schemas (validate at API + webhook boundaries) ─────────────────────────
export const giveRequestSchema = z.object({
  orgId: z.string().uuid(),
  fundId: z.string().uuid(),
  amountUsd: z.number().positive(),
  frequency: z.enum([GiftFrequency.OneTime, GiftFrequency.Monthly, GiftFrequency.Weekly]),
  rail: z.enum([RampRail.StripeOnramp, RampRail.BridgeVirtualAccount]),
  donor: z.object({ name: z.string().min(1), email: z.string().email() }),
});
export type GiveRequest = z.infer<typeof giveRequestSchema>;

// ─── Ledger-sync queue contract (shared by web producer + worker consumer) ──────
/** BullMQ queue name for the idempotent ledger-sync pipeline. */
export const LEDGER_QUEUE_NAME = "steward-ledger-sync";

export type LedgerJob =
  | { kind: "helius.settlement"; signature: string; raw: unknown }
  | { kind: "bridge.event"; eventId: string; raw: unknown }
  | { kind: "stripe.event"; eventId: string; raw: unknown };

export const payoutRequestSchema = z.object({
  orgId: z.string().uuid(),
  fundId: z.string().uuid(),
  amountUsd: z.number().positive(),
  /** Verified parish bank destination (a Bridge external account id). */
  destinationId: z.string().min(1),
  memo: z.string().max(280).optional(),
});
export type PayoutRequest = z.infer<typeof payoutRequestSchema>;
