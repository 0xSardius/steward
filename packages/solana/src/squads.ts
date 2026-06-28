/**
 * Squads V4 treasury helpers (ADR-0001).
 *
 * The org account IS a Squads V4 multisig. Dual control (2-of-N) is enforced ON-CHAIN
 * by the Squads program via the proposal -> vote -> execute lifecycle — never reimplement
 * approval as app-layer-only logic (CLAUDE.md rule #3).
 *
 * These are typed integration stubs. Implement against `@sqds/multisig` (v4) — see
 * https://docs.squads.so and github.com/Squads-Protocol/v4. Human signers sign with their
 * Privy embedded wallets; the transaction fee payer is the sponsor key so users hold no SOL.
 */
import type { UsdcBaseUnits } from "@steward/core";

export interface CreateOrgMultisigParams {
  /** Member wallet pubkeys (base58) — the pastor, bookkeeper, finance council. */
  memberPubkeys: string[];
  /** Approval threshold (e.g. 2 for 2-of-N). */
  threshold: number;
  /** Fee-payer / creator pubkey (sponsor). */
  feePayerPubkey: string;
}

export interface MultisigRef {
  multisigAddress: string;
  /** Vault index -> vault PDA. Index 0 is the default shared vault (ADR-0002). */
  vaultIndex: number;
}

export interface ProposePayoutParams {
  multisigAddress: string;
  /** Vault holding the funds (per-fund index later; 0 for the shared vault now). */
  vaultIndex: number;
  /** USDC destination token account (e.g. a Bridge liquidation address ATA). */
  destinationTokenAccount: string;
  amount: UsdcBaseUnits;
  feePayerPubkey: string;
  memo?: string;
}

const notImplemented = (what: string): never => {
  throw new Error(`Squads V4 integration not implemented yet: ${what}`);
};

/** Create the org's multisig with role-based members and an M-of-N threshold. */
export async function createOrgMultisig(_params: CreateOrgMultisigParams): Promise<MultisigRef> {
  return notImplemented("createOrgMultisig");
}

/** Create a payout proposal (does NOT move funds until the threshold is met). */
export async function proposePayout(
  _params: ProposePayoutParams,
): Promise<{ transactionIndex: number }> {
  return notImplemented("proposePayout");
}

/** Record an approver's vote (signed by their Privy wallet, fee sponsored). */
export async function approvePayout(_params: {
  multisigAddress: string;
  transactionIndex: number;
  memberPubkey: string;
}): Promise<{ signature: string }> {
  return notImplemented("approvePayout");
}

/** Execute once the on-chain threshold is reached. */
export async function executePayout(_params: {
  multisigAddress: string;
  transactionIndex: number;
  feePayerPubkey: string;
}): Promise<{ signature: string }> {
  return notImplemented("executePayout");
}
