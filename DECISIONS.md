# Decision Log — Steward

Architecture Decision Records (ADRs) for decisions that were *open* after the PRD v2 review. Each records a **proposed default** (my recommendation) with rationale, the alternatives, the consequences, and **what would flip it**. Status legend:

- 🟡 **Proposed** — recommended default, pending your sign-off
- 🟢 **Accepted** — confirmed; build to this
- 🔴 **Superseded** — replaced by a later ADR

Locked stack decisions (chain, Squads-as-treasury, Privy, fee-payer, Helius, USDC, two-rail ramp) live in `CLAUDE.md` and PRD §10/§16 — this log only tracks the ones that were genuinely undecided.

---

## ADR-0001 — Squads V4 over the v5 Smart Account Program / Grid

**Status:** 🟡 Proposed (recommend Accept for pilot)
**Relates to:** PRD §10, §15 Q8

### Context
Squads is the org treasury (on-chain 2-of-N). Two product lines exist as of mid-2026: **V4** (`@sqds/multisig`) — audited, immutable since Nov 2024, $10B+ secured — and the newer **v5 Smart Account Program / Grid** (live on mainnet Apr 2026; adds programmable wallets, hooks, adaptive timelocks, and an API/stablecoin-rails layer).

### Decision
Build the pilot on **Squads V4** (`@sqds/multisig`).

### Rationale
- Immutability + multi-firm audits (OtterSec, Neodyme, Certora formal verification, Trail of Bits) is exactly the credibility we need to put in front of a diocesan finance office. "Newer" is a liability, not an asset, in this sales context.
- V4 already supports everything the MVP needs: M-of-N, roles/permissions, spending limits, time locks, sub-accounts (the per-fund-vault option in ADR-0002).
- v5's headline features (programmable hooks, adaptive timelocks) map to *future* roadmap, not P0/P1.

### Alternatives rejected
- **v5 Smart Account Program / Grid** — defer. Re-evaluate only if a v5-only feature becomes a hard requirement.
- **Legacy `@sqds/sdk` (V3)** — do not use.

### Consequences
- Pin `@sqds/multisig` (v4 line) and guard the multisig `config_authority` carefully (see CLAUDE.md cross-cutting rule).
- If we later want hooks/programmable policy, migration to v5 is a deliberate, separate project — not a casual upgrade.

### What would flip this
A diocesan or compliance requirement that V4 can't express (e.g., a conditional/programmable spending policy) and that v5 hooks solve cleanly.

---

## ADR-0002 — Fund accounting: single vault + off-chain tags now, on-chain per-fund vaults later

**Status:** 🟡 Proposed (recommend Accept; **decide before the week-5 dashboard build**)
**Relates to:** PRD §8 (Treasury & fund accounting), §15 Q7

### Context
Designated funds (Offertory, Building Fund, St. Vincent de Paul, School Annual Fund, second collections) must each track an independent balance with zero manual reconciliation (G3). Two on-chain shapes are possible:
- **(a)** One Squads vault holds all USDC; each gift is *tagged* to a fund in the off-chain Postgres ledger.
- **(b)** One Squads vault *index per designated fund* — real on-chain segregation; funds physically cannot be commingled.

### Decision
Ship **(a)** for the pilot, but **design the ledger schema and fund abstraction so (b) is a drop-in upgrade** (i.e., a `fund` has a nullable `vault_index`; the app addresses funds through an interface, not a hardcoded single vault).

### Rationale
- (a) is the fastest path to G3 and matches incumbent mental models (one bank account + designated-fund ledger), so it's easy to explain to the bookkeeper.
- (b) is a genuinely stronger *story* ("the building fund and the offertory are different on-chain accounts — they cannot be accidentally mixed"), which resonates with the anti-embezzlement pitch. But it adds per-fund setup, more transactions, and more surface area for the pilot.
- Designing the abstraction up front makes (b) an additive feature, not a rewrite — we get the option value without paying for it now.

### Alternatives rejected
- **(b) for the pilot** — premature; adds setup/ops cost before we've proven the core.
- **Off-chain-only fund accounting with no on-chain notion of funds** — forecloses the (b) upgrade and weakens the differentiator.

### Consequences
- Ledger reconciliation logic must attribute each inbound USDC transfer to a fund. With (a) this relies on the giving-page context (which fund the donor selected) joined to the settlement event — **not** on-chain data alone. Capture the fund selection at gift time and correlate it to the Helius-observed settlement.
- Revisit (b) when a pilot org or the diocese explicitly asks for hard segregation, or for the v2 small-org "member-facing ledger" feature where on-chain verifiability is a selling point.

### What would flip this
A diocesan requirement for provable, non-commingled fund custody, or a security/audit argument that off-chain tagging is insufficient.

---

## ADR-0003 — Compliance posture: KYB the org, donors remain payors (no individual KYC)

**Status:** 🟡 Proposed (recommend Accept; **two items to confirm with Bridge/Stripe before week 1**)
**Relates to:** PRD §11.5, §15 Q6 (resolved)

### Context
Bridge requires KYB for the org. The open question was whether *donors* need individual KYC, which would add fatal friction to a ≤3-tap give flow (and threaten G1's ≥50 donors).

### Decision
Architect so the **parish completes KYB as the account-holding entity**, and **donors are payors into the parish's account** — the same legal posture as paying a merchant — so individual donors are not money-services customers and are not KYC'd for normal gift sizes. Concretely: use the Stripe-onramp / hosted-checkout shape where the donor pays *to* the org, **not** a model that provisions a Bridge customer/wallet per donor.

### Rationale
- Payor-model compliance sits at the merchant/processor level; the giver doesn't become a regulated customer. This preserves the frictionless give flow that G1/G5 depend on.
- Storing a card on file for recurring offertory (P1) is payment-method tokenization, still payor-model — it does not drag donors into KYC.

### Open confirmations (action items — owner: founder, before week 1)
1. **Escalation threshold** — the per-gift / cumulative dollar amount above which Stripe/Bridge collect donor identity (card-network + AML rules). Get it in writing; cap or flag gifts above it. (Pilot median gifts are likely well under it.)
2. **Excluded geographies** — confirm donor-side state exclusions (NY/Alaska/OFAC were flagged on the Squads/Bridge off-ramp; USDC-Solana is unavailable in the EU on Stripe onramp). Screen excluded states on the giving page.

### Alternatives rejected
- **KYC every donor** — kills conversion; unacceptable.
- **Per-donor Bridge wallet/customer** — turns payors into regulated customers for no benefit.

### Consequences
- The giving page must enforce geo screening and the gift-size cap.
- This posture reinforces the §11 non-custodial / "software, not a money transmitter" position (confirm in the counsel memo).

### What would flip this
Bridge/Stripe requiring donor KYC at gift sizes typical for this pilot, or a state-availability gap that forces a different ramp for the pilot region.

---

## ADR-0004 — Give-flow steering: default to ACH, offer card/Apple Pay as convenience

**Status:** 🟡 Proposed (recommend Accept)
**Relates to:** PRD §4 G2, §8, §9 F1

### Context
The two ramp rails have very different economics: **ACH via Bridge** can hit ≤1.5% (G2), while **card/Apple Pay via Stripe onramp (~1.5% + $0.30)** exceeds target on small gifts (a $0.30 flat fee = 3% on a $10 gift) and can never go truly sub-1.5% (interchange). This is a *product/UX* decision that directly determines whether we hit G2.

### Decision
- **Recurring gifts (esp. offertory): default to ACH.** Recurring donors set up once; the ACH friction is paid a single time and the fee savings compound.
- **One-time gifts: present card/Apple Pay as the prominent one-tap option,** with ACH offered alongside; accept that small one-time card gifts run hotter than 1.5%.
- **Surface the trade honestly in UX copy where appropriate** (e.g., "Use bank transfer to send 100% further" framing) without shaming card users.
- **Instrument the rail mix** during the pilot so G2 is measured on the ACH cohort and we can report blended effective fee.

### Rationale
- Mobile conversion is highest with Apple/Google Pay — we don't want to suppress one-time impulse gifts (the pew/QR moment) by forcing ACH.
- The biggest fee leakage is recurring volume; steering *that* to ACH captures most of the savings while keeping one-time conversion high.

### Alternatives rejected
- **ACH-only** — wrecks one-time/mobile conversion (the QR-in-the-pew flow).
- **Card-default everywhere** — misses G2 and bleeds fees on recurring volume.

### Consequences
- Giving page needs rail-aware UX: smart defaulting by gift type (recurring vs one-time), with both rails available.
- Metrics dashboard must break out effective fee **by rail** so G2 is reported credibly.

### What would flip this
Pilot data showing ACH setup friction materially suppresses recurring enrollment — in which case re-weight toward card and renegotiate Stripe tiers, or pursue a lower-cost ACH-funded card-like flow.

---

## Summary table

| ADR | Decision | Default | Decide by |
|-----|----------|---------|-----------|
| 0001 | Squads V4 vs v5/Grid | **V4** | Now (build start) |
| 0002 | Fund accounting model | **Single vault + off-chain tags; design for per-fund vaults** | Before week-5 dashboard |
| 0003 | KYB/KYC posture | **KYB org, donors as payors** | Confirm 2 items w/ Bridge+Stripe before week 1 |
| 0004 | Give-flow rail steering | **ACH-default recurring, card-convenience one-time** | Now (informs giving-page build) |
