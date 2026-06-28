import { createSolanaRpc } from "@solana/kit";

export type Cluster = "devnet" | "mainnet-beta" | "localnet";

/** Build a Solana RPC client from env. Defaults to devnet (CLAUDE.md guardrail). */
export function getRpc(url = process.env.SOLANA_RPC_URL) {
  if (!url) throw new Error("SOLANA_RPC_URL is not set");
  return createSolanaRpc(url);
}

export function getCluster(): Cluster {
  return (process.env.SOLANA_CLUSTER as Cluster) ?? "devnet";
}
