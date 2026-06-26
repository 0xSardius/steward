# PRD — "Steward" (working title)
### Stablecoin-powered giving & treasury platform for parishes, schools, and small nonprofits
**Version:** 2.0 (Draft) · **Date:** June 2026 · **Status:** Pre-build, pilot partner identified (St. Bernadette's parish & school)
**Change from v1:** Settlement layer retargeted from Base/EVM to **Solana**. Business model, personas, compliance posture, and roadmap are unchanged — they are chain-agnostic. This revision rewrites the technical stack (§10), the affected flows (§9), and the architecture-dependent risks (§12). See [§16 — Why Solana, and what changed from v1](#16-why-solana-and-what-changed-from-v1) for the migration rationale and a side-by-side stack map.

---

## 1. One-liner

A giving and treasury platform for churches and small nonprofits that settles on stablecoin rails (**Solana**) under the hood — cutting payment fees, automating fund accounting and tax receipts, and adding board-grade spending controls — while looking and feeling like ordinary dollar-denominated software to every user.

## 2. Problem

Parishes and parochial schools run meaningful money through bad tooling:

1. **Giving is expensive.** Online giving platforms (Tithe.ly, Pushpay, Vanco) charge roughly 2–3% plus per-transaction fees on donations. For a parish processing $500K/year in offertory and campaigns, that is $10–15K lost annually.
2. **Fund accounting is manual.** Designated funds (building fund, St. Vincent de Paul, second collections, mission support) are tracked in spreadsheets layered over a single bank account. Misallocation is common and reconciliation eats volunteer/staff hours.
3. **Spending controls are weak.** Canon law requires a parish finance council, but in practice one person often controls the checkbook. Small-org embezzlement is a well-documented, recurring problem precisely because dual control doesn't exist in their tools.
4. **Year-end statements are painful.** Generating IRS-compliant annual giving statements for every donor each January is a dreaded manual task for parish staff.
5. **Cross-border support is costly.** Missionary support and sister-parish transfers go out via $40+ international wires with multi-day settlement.

The incumbent products solve only #1 (partially, at high fees). None solve #2–#5 together.

## 3. Why now / why this works

- The crypto rails (embedded wallets, fiat ramps, fee sponsorship, on-chain multisig) are commoditized on Solana. Every component below is a managed integration with a production track record — most notably **Squads + Bridge already ship a live USDC→USD off-ramp on Solana**, which is the exact dual-control-treasury-to-bank path this product needs. The product value is the **org-facing layer**: roles, funds, approvals, statements.
- Stablecoin settlement makes the cost structure structurally cheaper than card-rail incumbents, especially for ACH-funded gifts and any cross-border movement. On Solana the on-chain leg is effectively free (~$0.0002–0.001 per transfer), so the entire donor-facing cost reduces to the fiat-ramp spread. **Honest framing: the chain is not the primary fee lever — the ramp is** (see G2 in §4).
- The dual-control story is *stronger* on Solana than on a generic EVM smart-account design: **Squads V4** is an audited (OtterSec, Neodyme, Certora formal verification, Trail of Bits), immutable-since-Nov-2024 on-chain multisig securing $10B+. "2-of-N enforced on-chain" is not custom contract work — it is the protocol's core function.
- Distribution is networked: parishes belong to dioceses. One successful pilot + diocesan finance office approval unlocks dozens to hundreds of parishes with near-identical needs.
- The crypto is invisible. Donors give in dollars; bookkeepers see dollars. No user education required.

## 4. Goals (MVP)

| # | Goal | Success metric |
|---|------|----------------|
| G1 | Run one real fundraising campaign end-to-end at St. Bernadette's | ≥ 1 completed campaign (second collection or school fundraiser) with ≥ 50 donors |
| G2 | Beat incumbent all-in cost | Effective fee ≤ 1.5% on ACH gifts (vs ~2.9% incumbent card rails). **Note:** this is achieved by routing gifts through ACH-funded ramp deposits (Bridge virtual accounts) — the Solana on-chain leg is ~$0.001 and not a material cost driver either way. |
| G3 | Prove the fund-accounting value prop | 100% of pilot donations auto-allocated to the correct designated fund, zero manual reconciliation |
| G4 | Prove dual-control payouts | All outbound transfers in pilot require 2-of-N approval, **enforced on-chain by the Squads multisig** (not merely app-layer) |
| G5 | Zero crypto exposure for end users | No donor or staff member needs to see a wallet address, gas, SOL, or token name to complete any core flow |

## 5. Non-goals (explicitly out of scope for v1)

- **Yield / DeFi deployment of reserves.** Highest legal and political sensitivity; deferred to v2 after diocesan trust is established. (Solana candidate infra noted in §8 P2.)
- **Tuition billing.** FACTS replacement is a larger sales motion; enter via fundraisers first.
- **Debit cards.** Not needed for pilot; payouts go to the parish bank account.
- **Native mobile app for donors.** Donor flows are web-first (link/QR from the pew, bulletin, or email). Staff dashboard is responsive web.
- **Direct crypto donations (donor sends their own USDC/BTC).** Valuable later (The Giving Block model); adds tax-receipt complexity (fair-market-value reporting) not needed for pilot.
- **Confidential / private on-chain donation amounts (Token-2022 confidential transfers).** Conceptually a strong fit (see §16), but the ZK ElGamal proof program is disabled on mainnet pending audit completion as of mid-2026. No hard dependency in v1.
- **Multi-parish / diocese admin console.** v2, after pilot.

## 6. Users & personas

| Persona | Role | Primary needs |
|---|---|---|
| **Donor / Parishioner** | Gives one-time or recurring | 30-second give flow, choose a fund, instant receipt, annual statement. *No wallet required — pays fiat.* |
| **Parish bookkeeper / secretary** | Daily operator | Dashboard in USD, fund balances, donor records, export to QuickBooks/CSV, one-click year-end statements |
| **Pastor** | Accountable owner | Top-line visibility, approve spending, defensibility to the diocese |
| **Finance council member** | Oversight (canon law-mandated) | Co-approval of payouts, read-only audit view |
| **School admin / fundraiser chair** | Campaign operator | Spin up a campaign page (gala, auction, annual fund) with a goal thermometer and shareable link |

## 7. Pilot plan — St. Bernadette's

**Phase 0 — Buy-in (before/while building):**
1. Informal pitch to pastor (founder's existing relationship).
2. Present to parish finance council: lead with fee savings, dual control, and statement automation. Position settlement rails as an implementation detail ("modern payment infrastructure"), answer honestly if asked.
3. Identify the diocesan finance office's policies early (approved depositories, any requirement to hold reserves in a diocesan deposit & loan fund). Design payout flows so funds can sweep to wherever the diocese requires — this neutralizes the most likely objection.

**Phase 1 — Contained pilot:** One school fundraiser **or** one designated second collection. Bounded amount, bounded duration, easy to evaluate.

**Phase 2 — Expansion at St. Bernadette's:** Recurring offertory giving + all designated funds.

**Phase 3 — Diocese:** Take pilot results (fees saved, hours saved, audit trail) to the diocesan finance office as a distribution channel.

## 8. Feature scope

### P0 — must ship for pilot

**Giving**
- Hosted giving page per organization with fund selector (e.g., Offertory, Building Fund, School Annual Fund)
- One-time and recurring gifts; card and ACH funded via **Bridge** (virtual account / hosted onramp); settlement to the org's **USDC balance held in its Squads multisig vault on Solana**
- Apple Pay / Google Pay if supported by the ramp/hosted-checkout provider (large mobile conversion lift)
- QR code generation for bulletins/pews; shareable campaign links (Solana Pay QR optional, but donor pays fiat — see §9 F1)
- Instant email receipt to donor (Resend), 501(c)(3) compliant language

**Treasury & fund accounting**
- Org account = **Squads V4 multisig** on Solana; every gift auto-tagged to a designated fund in the off-chain ledger (with an option for on-chain fund segregation via per-fund Squads vault indices — see §16)
- USD-denominated dashboard: balances by fund, recent activity, donor list (off-chain Postgres ledger kept in sync with chain state via **Helius** webhooks)
- Off-ramp payout to the parish's existing bank account (**Bridge** liquidation address + payout API), with **2-of-N approval enforced on-chain by Squads** before any outbound transfer executes
- CSV export (QuickBooks-friendly)

**Roles & access**
- Owner (pastor), Admin (bookkeeper), Approver (finance council), Viewer (auditor/diocese) — mapped to **Squads member permissions** (Proposer / Voter / Executor) for any role that signs
- Email-based auth via **Privy embedded wallets** (Solana) — users never see keys or seed phrases; each human signer's Privy wallet pubkey is a Squads member
- **Fee sponsorship is native:** the app sets the transaction fee payer to a sponsor key (optionally fronted by a **Kora** relayer for guardrails/rate-limits). No user holds or sees SOL; no ERC-4337/paymaster stack and no EIP-7702 needed

**Compliance plumbing**
- Org KYB and (where applicable) donor-side KYC handled by **Bridge** as the licensed money services partner. Note: some Bridge Solana paths are KYB-only — confirm which legs require donor KYC for the pilot's flow
- Receipt and record retention suitable for annual statements

### P1 — fast follow (within pilot window if possible)

- Campaign pages with goal thermometer and end dates (gala/auction/annual fund)
- One-click **year-end giving statements** (batch PDF + email to all donors) — ship before January regardless
- Text-to-give (number → link)
- Donor self-serve portal (update card, view history) — Privy email auth; no wallet exposed to the donor

### P2 — post-pilot roadmap (informs architecture, not built now)

- **Reserve yield**, framed as org-directed treasury management; gated on legal review and diocesan comfort. **Candidate infra: Kamino Lend V2 curated/Prime USDC vaults, with the position owned by the org's Squads multisig via the SquadsX integration** (structural twin of v1's Blend + Gnosis Safe SMA model: per-org isolated, non-custodial, curated conservative allocations, org retains direct multisig access independent of us). Diligence required: confirm the multisig (not a single key) is the position authority, plus audit/track-record and fee review. Avoid leveraged/first-loss strategies (e.g., JLP, IF vaults); treat Drift/marginfi as caution-flagged.
- **Confidential donation amounts (Token-2022 confidential transfers).** Hide individual gift sizes on-chain while granting the diocese/finance council a mint-level **auditor key** that can decrypt amounts for oversight. Blocked until the ZK ElGamal proof program is re-enabled on mainnet (disabled mid-2025 pending audit). Caveat: hides amounts only, not addresses/that-a-tx-occurred; and major stablecoins have not activated the extension.
- Cross-border missionary / sister-parish transfers (Solana stablecoin payout corridors via Bridge)
- Diocese-level console (multi-parish reporting and policy controls)
- Direct on-chain crypto donations with FMV receipts
- Tuition invoicing; scrip program replacement

## 9. Core user flows (P0)

**F1. Donor gives:** Scan QR / tap link → giving page → choose fund + amount + frequency → pay via card/ACH/Apple Pay (Bridge-hosted or embedded checkout) → Bridge converts fiat to USDC and delivers it to the org's **Squads vault on Solana**, tagged to the chosen fund in the ledger → donor receives email receipt. *Donor never sees crypto and never needs a wallet.*

**F2. Bookkeeper reconciles:** Dashboard shows gifts in USD by fund in near-real-time (Helius webhooks → idempotent queue → Postgres, deduped on transaction signature, credited at `finalized` commitment) → exports CSV to QuickBooks. No manual fund allocation.

**F3. Payout with dual control:** Admin initiates a payout (amount, fund, destination = verified parish bank account) → a **Squads transaction proposal** is created → approvers receive an email-link approval request → each approver signs the proposal **vote** with their **Privy** embedded wallet (fee-sponsored, no SOL, no popup friction for the approval) → once the 2-of-N threshold is met on-chain, the transaction executes: USDC moves from the Squads vault to a **Bridge liquidation address**, Bridge off-ramps to ACH/wire to the parish bank → the on-chain proposal + approvals + execution form an **immutable audit trail**, mirrored to the app's audit log.

**F4. Year-end statements (P1):** Admin clicks "Generate 2026 statements" → batch PDFs per donor with IRS-required language → emailed via Resend + downloadable archive.

## 10. Architecture & stack

| Layer | Choice | Notes |
|---|---|---|
| Chain | **Solana** | Sub-cent fees (~$0.0002–0.001/txn), ~400ms slot / fast finality, native (Circle-issued) USDC, deep stablecoin liquidity |
| Org treasury / "smart account" | **Squads V4 multisig** (`@sqds/multisig`) | On-chain M-of-N; roles/permissions, spending limits, time locks, sub-accounts; audited + immutable since Nov 2024; secures $10B+. This is the audit-grade dual-control core. (Evaluate Squads v5 Smart Account Program / Grid only if newer smart-account features are needed; V4 is the stable base.) |
| Wallets (human signers) | **Privy embedded wallets (Solana)** | Email/OTP auth; non-custodial EOA-style keys; `useSignTransaction` / `useSessionSigner`. Each signer's pubkey is a Squads member. *Note: Privy's ERC-4337 smart wallets are EVM-only — on Solana, on-chain policy lives in Squads, not Privy.* Alternatives: Crossmint (only true Solana smart-contract wallets + card rails), Turnkey (backend/agent signing), Para (MPC, multichain) |
| Fee sponsorship | **Native fee-payer + optional Kora relayer** | Set the tx fee payer to a sponsor key; both sponsor and user sign. Kora (Solana Foundation; successor to the now-archived Octane) adds allowlists/rate-limits and pay-in-SPL-token reimbursement, and supports Privy/Turnkey external signers. No paymaster/bundler, no EIP-7702. |
| Onchain infra | **Helius** | RPC + webhooks (enhanced/parsed + raw) + Enhanced Transactions API for backfill + LaserStream gRPC. Keeps the Postgres ledger in sync with chain state. (QuickNode Streams / Alchemy Solana are alternatives.) Webhook deliveries can duplicate → consumers must be idempotent. |
| Fiat ramps | **Bridge (a Stripe company)** | On-ramp (ACH/wire virtual accounts; card via Stripe hosted onramp) and off-ramp (liquidation address + payout API) — both support **Solana USDC** as settlement. Squads' production Bridge off-ramp is the reference. Bridge carries MSB licensing + KYC/KYB; received conditional OCC trust charter (Feb 2026). |
| Approvals | **2-of-N enforced at the Squads program level** | On-chain enforcement via proposal → vote → execute, not just app-layer. This is the audit-grade differentiator. |
| Stablecoin | **USDC (native, Circle)** | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. Dominant Solana stablecoin (~half of ~$15B supply), primary DEX quote asset. (PYUSD / USDG exist natively but on Token-2022 and far less liquid — not for v1.) |
| Email | **Resend** | Receipts, approval requests, statements |
| Backend | **Node.js + Postgres** | Org/fund/donor ledger mirrors on-chain state; webhooks from Bridge + Helius; queue (Redis/BullMQ) with retries + DLQ between webhooks and DB writes |
| Frontend | **Web (Next.js), responsive** | Donor pages + staff dashboard; no native app in v1. Client uses `@solana/kit` + framework-kit hooks; web3.js only at integration boundaries via `@solana/web3-compat` |
| Swaps (if needed) | **Jupiter** | Only if multi-stable support is required; v1 is USDC-only |

**Build-vs-reuse note:** Wallets (Privy), the multisig treasury (Squads), ramps (Bridge), fee sponsorship (native/Kora), indexing (Helius), and email (Resend) are integrations. The proprietary build is: org/role model on top of Squads, the fund ledger and its chain-sync/reconciliation, the approval-request UX wrapping Squads proposals, giving pages, and receipts/statements. That is where engineering time should go.

## 11. Legal & compliance guardrails

1. **Non-custodial architecture.** Org funds sit in the org's own **Squads multisig vault** (a program-derived account the org controls via its members); the platform holds no key that can unilaterally move funds. Combined with Bridge as the licensed transmitter for fiat legs, the platform positions as software, not a money transmitter. **Confirm with fintech counsel before launch** (state-by-state money transmission analysis, ~1–2 hours of counsel time for a memo).
2. **Naming.** Never "bank," "banking," or "deposits" in product copy. Use "giving," "treasury," "funds."
3. **No yield in v1.** Avoids securities/BlockFi-pattern risk entirely at pilot stage. When introduced, structure as org-directed, self-custodied deployment (Squads-owned position) — not a platform-offered interest rate.
4. **Tax receipts.** Cash-equivalent gift receipts with standard 501(c)(3) language ("no goods or services were provided..."). Parish (not platform) is the donee of record.
5. **KYC/KYB.** Performed by Bridge; platform stores minimal PII (donor name, email, gift history for statements). Confirm KYB-only vs donor-KYC requirements for the specific Solana ramp legs used.
6. **Diocesan policy.** Treat the diocese as a quasi-regulator: support sweeping balances to diocesan-approved depositories; offer read-only auditor access (Squads Viewer role + read-only dashboard).
7. **Key recovery / staff turnover.** Org treasury is multisig — never a single signer. Member set is rotatable on-chain via Squads config (guard the config authority carefully); document a diocesan recovery path.

## 12. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Diocese blocks anything crypto-adjacent | Medium | Lead with fees/controls/statements; crypto framed as settlement infrastructure; support sweep-to-approved-bank; engage diocesan finance office early, not after launch |
| Bridge pricing/coverage changes, or card-on-ramp-to-Solana path differs from bank rails | Medium | Abstract the ramp layer behind an interface; confirm Bridge card-onramp settlement to Solana early; evaluate backup ramp providers |
| Donor conversion drops vs incumbents | Medium | Apple Pay/Google Pay support; keep give flow ≤ 3 taps; A/B against existing flow during pilot |
| Stablecoin depeg / headline risk | Low | USDC-only (native Circle); near-immediate off-ramp option for orgs that want daily sweeps |
| Webhook gaps / double-credit in ledger sync | Medium | Idempotent consumers (dedupe on tx signature), queue with DLQ, reconcile at `finalized` commitment, backfill via Helius Enhanced Transactions API |
| Squads config-authority compromise (settings/threshold change) | Low-Med | Configure config authority deliberately (ideally none/locked or a separate governance multisig); never expose it to the app's hot path |
| Privy AA gap (no on-chain policy on Solana) | Low | Intentional design — on-chain policy lives in Squads, Privy is only the per-human signer; off-chain Privy policies used only for non-custodial UX, not fund control |
| Key-person/account recovery (staff turnover) | Medium | Org-level multisig with N-of-M signers + documented diocesan recovery path; never single-signer orgs |
| Regulatory shift on stablecoin apps | Low-Med | Non-custodial posture; monitor; counsel review pre-launch and pre-yield |

## 13. Milestones (8-week target to pilot)

| Week | Milestone |
|---|---|
| 1 | Finalize scope; pastor verbal buy-in; Bridge + Privy + Helius accounts/sandbox (devnet); legal memo commissioned |
| 2–3 | Org model on **Squads V4** (create multisig, map roles to member permissions); Privy email auth + Solana embedded wallets; **fee-payer sponsorship** wired (Kora optional); Bridge on-ramp → USDC settlement to the org's Squads vault on devnet |
| 4 | Giving page (funds, one-time + recurring, receipts); QR/link generation |
| 5 | Dashboard (balances by fund, activity, donor list, CSV export) backed by Helius-synced Postgres ledger |
| 6 | Payout flow: Squads proposal → 2-of-N approval (email-link, Privy-signed, sponsored) → Bridge off-ramp to bank; audit log mirrors on-chain proposal/votes |
| 7 | End-to-end testing with real small dollars on mainnet; finance council demo; pilot campaign selected |
| 8 | **Pilot launch** (one fundraiser / second collection); instrumented metrics (G1–G5) |
| Post | Year-end statements (must ship before Jan); campaign thermometer pages; diocese conversation with pilot data |

## 14. v2 Segment expansion — small-org treasury (PTAs, boosters, HOAs, mutual aid funds)

The parish product generalizes to any small volunteer-run organization with a treasurer, a board, and weak financial controls. Same codebase, ~15% delta.

**Why this segment:** these orgs run on a checkbook + one volunteer treasurer + a spreadsheet. Treasurer embezzlement is a chronically recurring problem in PTAs and booster clubs precisely because no dual control exists. The pitch is identical to Steward's core: dual-approval spending (Squads), fund segregation, member-auditable transparency, automated records — plus the things that vary by org type below.

**What changes vs. the parish product:**

| Area | Parish (v1) | Small-org (v2) |
|---|---|---|
| Onboarding | High-touch, founder-led, diocesan politics | Self-serve signup with KYB flow |
| Entity complexity | Parish under diocese, predictable | Messy: PTAs are often 501(c)(3) under a state PTA umbrella; booster clubs range from incorporated nonprofits to informal associations; HOAs are corporations. KYB flow must branch by entity type, and Bridge's KYB requirements determine who can onboard self-serve |
| Inbound money | Donations | Donations **plus dues** (HOA assessments, membership fees) and lightweight event payments — requires invoicing/dues-tracking, the largest net-new feature |
| Approvers | Pastor + finance council | Treasurer + board officers (2-of-N identical mechanically, same Squads model) |
| Transparency | Auditor/diocese view | **Member-facing** read-only ledger — a selling point for orgs whose members demand visibility (and a natural fit for on-chain verifiability) |
| Distribution | Diocese as channel | State PTA associations, HOA management companies, booster/league networks; also bottoms-up self-serve |
| Pricing | Decided post-pilot | Self-serve SaaS ($20–50/org/mo) and/or ramp spread; these orgs are price-sensitive but currently lose more to fraud risk and card fees |

**Sequencing:** ship only after the St. Bernadette's pilot proves the core. The self-serve KYB branching and dues/invoicing are the two real engineering lifts; everything else is reuse.

## 15. Open questions

1. Which diocese is St. Bernadette's under, and does it mandate a deposit & loan fund or approved depository list? (Determines payout/sweep design.)
2. What does the parish currently use for online giving, and what are its actual all-in fees and volumes? (Sets the concrete savings number for the pitch.)
3. Pilot vehicle: school fundraiser vs. second collection? (Fundraiser = lower stakes, natural end date; collection = closer to core offertory.)
4. Entity setup for the platform itself (LLC/C-corp) and who signs the Bridge platform agreement.
5. Pricing model: flat SaaS fee, per-transaction spread, or free pilot → diocese-level licensing? (Recommend free pilot; decide pricing with real cost data.)
6. **(Solana-specific)** Does Bridge's **card** on-ramp settle directly to Solana USDC, or only its bank-rail (ACH/wire) virtual accounts? (Affects mobile conversion and the Apple/Google Pay story.)
7. **(Solana-specific)** Fund accounting model: single Squads vault + off-chain fund tags (simplest), or one Squads vault index per designated fund for on-chain segregation? (Decide before the dashboard/ledger build in week 5.)
8. **(Solana-specific)** Squads V4 vs the new v5 Smart Account Program / Grid — does the pilot need any v5-only feature, or is immutable V4 the right stable base? (Recommend V4 for the pilot.)

## 16. Why Solana, and what changed from v1

v1 targeted Base + Privy smart accounts + EIP-7702 + Alchemy. v2 targets Solana. The business case, personas, compliance posture, and roadmap did not change — those are chain-agnostic. What changed is the settlement stack, and on balance the migration **strengthens the two features the product is actually sold on** (dual control and invisible crypto).

**Stack map (v1 → v2):**

| Concern | v1 (Base/EVM) | v2 (Solana) | Why it's at least as good |
|---|---|---|---|
| Org "smart account" + 2-of-N | EIP-7702 / smart account with role signers (custom-ish) | **Squads V4 multisig** | Squads is a mature, audited, immutable, $10B+ on-chain multisig; M-of-N is its core function, not bespoke contract work |
| Per-human key / email auth | Privy embedded + smart wallet | **Privy embedded (Solana)** for signers; on-chain policy in Squads | Same email-auth UX; cleaner separation of identity (Privy) from treasury policy (Squads) |
| Gas / no-visible-signing | EIP-7702 sponsorship + batched approvals + paymaster | **Native fee-payer** (+ optional **Kora** relayer) | One transaction field, not a bundler/paymaster stack; SOL is never user-visible |
| Fiat ramp | Bridge | **Bridge (Solana)** | Same vendor; Solana is first-class; Squads+Bridge off-ramp is a live reference |
| Indexing / ledger sync | Alchemy RPC + webhooks | **Helius** webhooks + DAS + backfill | Solana-native leader; same sync pattern (webhook → idempotent queue → Postgres) |
| On-chain fee per gift/payout | cents | **~$0.0002–0.001** | Marginally cheaper; not the dominant cost (the ramp spread is) |
| Stablecoin | USDC on Base | **USDC native on Solana** | Native Circle issuance; dominant liquidity |
| Reserve yield (P2) | Blend + Gnosis Safe SMA | **Kamino Lend V2 + Squads (SquadsX)** | Same isolated, non-custodial, curated-vault structure, owned by the org's multisig |
| Donation privacy (P2) | n/a | **Token-2022 confidential transfers w/ auditor key** | Genuinely novel fit (hide amounts, diocese keeps decrypt) — *but disabled on mainnet pending audit; no v1 dependency* |

**Two honest caveats carried into this version:**
1. **The chain is not the fee lever.** Whether Base or Solana, the donor-facing cost is dominated by the fiat-ramp spread, not on-chain gas. Solana helps at the margin and removes any gas-volatility concern, but G2 (≤1.5%) is won by ACH funding through Bridge, not by the chain choice.
2. **Confidential transfers are not ready.** The auditor-key model is the most exciting Solana-specific feature for this exact use case, but the ZK ElGamal proof program was disabled on mainnet in mid-2025 pending audit completion. Treat it as a roadmap bet, not a pilot feature, and re-verify its live status before committing.
