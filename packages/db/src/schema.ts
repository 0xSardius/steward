/**
 * Postgres schema — the off-chain MIRROR of on-chain state (CLAUDE.md rule #1).
 *
 * This database is never authoritative for funds and can never move money. It records
 * what the chain (Squads vault + USDC accounts) and the ramps (Bridge/Stripe) tell us,
 * so the dashboard, fund accounting, and statements can be fast and queryable.
 *
 * Idempotency (rule #2): every external event (Helius webhook, Bridge/Stripe webhook)
 * is recorded in `processed_events` keyed by a unique external id (e.g. tx signature)
 * BEFORE its effects are applied, so duplicate deliveries are no-ops.
 */
import { sql } from "drizzle-orm";
import {
  bigint,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

// ─── Organizations (parishes / schools) ────────────────────────────────────────
export const orgs = pgTable("orgs", {
  id: id(),
  name: text("name").notNull(),
  /** Squads V4 multisig public key (base58). The org treasury. */
  multisigAddress: text("multisig_address").unique(),
  /** Bridge KYB customer id (the org is the account-holding entity — ADR-0003). */
  bridgeCustomerId: text("bridge_customer_id"),
  createdAt: createdAt(),
});

// ─── Designated funds (Offertory, Building Fund, ...) ───────────────────────────
// ADR-0002: pilot uses a single vault + off-chain tags. `vaultIndex` is nullable now;
// when on-chain per-fund segregation is adopted, populate it — no schema change.
export const funds = pgTable(
  "funds",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id),
    name: text("name").notNull(),
    /** Squads vault index for future on-chain segregation; null = shared vault. */
    vaultIndex: bigint("vault_index", { mode: "number" }),
    /** Cached balance in USDC base units (mirror; chain is source of truth). */
    balanceBaseUnits: bigint("balance_base_units", { mode: "bigint" }).default(0n).notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("funds_org_idx").on(t.orgId)],
);

// ─── Members (humans who sign / view) ───────────────────────────────────────────
export const members = pgTable(
  "members",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id),
    email: text("email").notNull(),
    role: text("role").notNull(), // see @steward/core Role
    /** Privy user id + embedded wallet pubkey (the Squads member key). */
    privyUserId: text("privy_user_id"),
    walletAddress: text("wallet_address"),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("members_org_email_idx").on(t.orgId, t.email)],
);

// ─── Donors ─────────────────────────────────────────────────────────────────────
export const donors = pgTable(
  "donors",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("donors_org_email_idx").on(t.orgId, t.email)],
);

// ─── Gifts (inbound) ─────────────────────────────────────────────────────────────
export const gifts = pgTable(
  "gifts",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id),
    fundId: uuid("fund_id")
      .notNull()
      .references(() => funds.id),
    donorId: uuid("donor_id").references(() => donors.id),
    amountBaseUnits: bigint("amount_base_units", { mode: "bigint" }).notNull(),
    rail: text("rail").notNull(), // see @steward/core RampRail
    frequency: text("frequency").notNull(),
    /** Solana tx signature of the settlement transfer into the vault (mirror key). */
    settlementSignature: text("settlement_signature").unique(),
    /** Ramp provider's payment/transfer id (Stripe/Bridge). */
    rampReference: text("ramp_reference"),
    settledAt: timestamp("settled_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("gifts_fund_idx").on(t.fundId), index("gifts_donor_idx").on(t.donorId)],
);

// ─── Payouts (outbound, dual-control) ────────────────────────────────────────────
export const payouts = pgTable(
  "payouts",
  {
    id: id(),
    orgId: uuid("org_id")
      .notNull()
      .references(() => orgs.id),
    fundId: uuid("fund_id")
      .notNull()
      .references(() => funds.id),
    amountBaseUnits: bigint("amount_base_units", { mode: "bigint" }).notNull(),
    status: text("status").notNull().default("proposed"), // see @steward/core PayoutStatus
    /** Squads transaction index / proposal PDA the approvals attach to. */
    squadsTransactionIndex: bigint("squads_transaction_index", { mode: "number" }),
    /** Bridge payout / liquidation reference once executing. */
    bridgePayoutId: text("bridge_payout_id"),
    initiatedByMemberId: uuid("initiated_by_member_id").references(() => members.id),
    memo: text("memo"),
    createdAt: createdAt(),
  },
  (t) => [index("payouts_org_idx").on(t.orgId)],
);

// ─── Payout approvals (the 2-of-N signatures, mirrored from on-chain votes) ──────
export const payoutApprovals = pgTable(
  "payout_approvals",
  {
    id: id(),
    payoutId: uuid("payout_id")
      .notNull()
      .references(() => payouts.id),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id),
    /** Signature of the on-chain Squads vote tx. */
    voteSignature: text("vote_signature"),
    approvedAt: createdAt(),
  },
  (t) => [uniqueIndex("payout_approval_unique").on(t.payoutId, t.memberId)],
);

// ─── Idempotency ledger (rule #2): dedupe every external event ───────────────────
export const processedEvents = pgTable(
  "processed_events",
  {
    /** Source + external id, e.g. "helius:<txSig>" or "stripe:<eventId>". */
    eventKey: text("event_key").primaryKey(),
    source: text("source").notNull(),
    payload: jsonb("payload"),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  (t) => [index("processed_events_source_idx").on(t.source)],
);

// ─── Immutable-ish audit log (mirrors on-chain proposal/vote/execute trail) ──────
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    orgId: uuid("org_id").references(() => orgs.id),
    actor: text("actor"), // member id, "system", or a wallet address
    action: text("action").notNull(),
    detail: jsonb("detail"),
    /** On-chain signature backing this entry, where applicable. */
    signature: text("signature"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_org_idx").on(t.orgId)],
);
