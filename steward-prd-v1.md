# PRD — "Steward" (working title)
### Stablecoin-powered giving & treasury platform for parishes, schools, and small nonprofits
**Version:** 1.0 (Draft) · **Date:** June 2026 · **Status:** Pre-build, pilot partner identified (St. Bernadette's parish & school)

---

## 1. One-liner

A giving and treasury platform for churches and small nonprofits that settles on stablecoin rails (Base) under the hood — cutting payment fees, automating fund accounting and tax receipts, and adding board-grade spending controls — while looking and feeling like ordinary dollar-denominated software to every user.

## 2. Problem

Parishes and parochial schools run meaningful money through bad tooling:

1. **Giving is expensive.** Online giving platforms (Tithe.ly, Pushpay, Vanco) charge roughly 2–3% plus per-transaction fees on donations. For a parish processing $500K/year in offertory and campaigns, that is $10–15K lost annually.
2. **Fund accounting is manual.** Designated funds (building fund, St. Vincent de Paul, second collections, mission support) are tracked in spreadsheets layered over a single bank account. Misallocation is common and reconciliation eats volunteer/staff hours.
3. **Spending controls are weak.** Canon law requires a parish finance council, but in practice one person often controls the checkbook. Small-org embezzlement is a well-documented, recurring problem precisely because dual control doesn't exist in their tools.
4. **Year-end statements are painful.** Generating IRS-compliant annual giving statements for every donor each January is a dreaded manual task for parish staff.
5. **Cross-border support is costly.** Missionary support and sister-parish transfers go out via $40+ international wires with multi-day settlement.

The incumbent products solve only #1 (partially, at high fees). None solve #2–#5 together.

## 3. Why now / why this works

- The crypto rails (embedded wallets, fiat ramps, gas sponsorship) are commoditized — the stack from a solo developer's week-long prototype (Privy + Bridge + Base + EIP-7702) is reusable nearly wholesale. The product value is the **org-facing layer**: roles, funds, approvals, statements.
- Stablecoin settlement makes the cost structure structurally cheaper than card-rail incumbents, especially for ACH-funded gifts and any cross-border movement.
- Distribution is networked: parishes belong to dioceses. One successful pilot + diocesan finance office approval unlocks dozens to hundreds of parishes with near-identical needs.
- The crypto is invisible. Donors give in dollars; bookkeepers see dollars. No user education required.

## 4. Goals (MVP)

| # | Goal | Success metric |
|---|------|----------------|
| G1 | Run one real fundraising campaign end-to-end at St. Bernadette's | ≥ 1 completed campaign (second collection or school fundraiser) with ≥ 50 donors |
| G2 | Beat incumbent all-in cost | Effective fee ≤ 1.5% on ACH gifts (vs ~2.9% incumbent card rails) |
| G3 | Prove the fund-accounting value prop | 100% of pilot donations auto-allocated to the correct designated fund, zero manual reconciliation |
| G4 | Prove dual-control payouts | All outbound transfers in pilot require 2-of-N approval |
| G5 | Zero crypto exposure for end users | No donor or staff member needs to see a wallet address, gas, or token name to complete any core flow |

## 5. Non-goals (explicitly out of scope for v1)

- **Yield / DeFi deployment of reserves.** Highest legal and political sensitivity; deferred to v2 after diocesan trust is established.
- **Tuition billing.** FACTS replacement is a larger sales motion; enter via fundraisers first.
- **Debit cards (Gnosis Pay).** Not needed for pilot; payouts go to the parish bank account.
- **Native mobile app for donors.** Donor flows are web-first (link/QR from the pew, bulletin, or email). Staff dashboard is responsive web.
- **Direct crypto donations (donor sends their own USDC/BTC).** Valuable later (The Giving Block model); adds tax-receipt complexity (fair-market-value reporting) not needed for pilot.
- **Multi-parish / diocese admin console.** v2, after pilot.

## 6. Users & personas

| Persona | Role | Primary needs |
|---|---|---|
| **Donor / Parishioner** | Gives one-time or recurring | 30-second give flow, choose a fund, instant receipt, annual statement |
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
- One-time and recurring gifts; card and ACH via Bridge on-ramp; settlement to org USDC balance on Base
- Apple Pay / Google Pay if supported by ramp provider (large mobile conversion lift)
- QR code generation for bulletins/pews; shareable campaign links
- Instant email receipt to donor (Resend), 501(c)(3) compliant language

**Treasury & fund accounting**
- Org account with sub-fund ledger; every gift auto-tagged to a fund
- USD-denominated dashboard: balances by fund, recent activity, donor list
- Off-ramp payout to the parish's existing bank account (Bridge), with **2-of-N approval** (e.g., pastor + finance council member) enforced before any outbound transfer
- CSV export (QuickBooks-friendly)

**Roles & access**
- Owner (pastor), Admin (bookkeeper), Approver (finance council), Viewer (auditor/diocese)
- Email-based auth via Privy embedded wallets — users never see keys; account abstraction (EIP-7702) sponsors and batches all gas/approvals

**Compliance plumbing**
- Org KYB and donor-side KYC handled by Bridge as the licensed money services partner
- Receipt and record retention suitable for annual statements

### P1 — fast follow (within pilot window if possible)

- Campaign pages with goal thermometer and end dates (gala/auction/annual fund)
- One-click **year-end giving statements** (batch PDF + email to all donors) — ship before January regardless
- Text-to-give (number → link)
- Donor self-serve portal (update card, view history)

### P2 — post-pilot roadmap (informs architecture, not built now)

- Reserve yield, framed as org-directed treasury management; gated on legal review and diocesan comfort. **Candidate infra: Blend (blend.money)** — per-org isolated Gnosis Safe (SMA model), curated Prime-tier-only vault allocations, non-custodial, org retains direct Safe access independent of us. Diligence required: Safe signer must be the org's 2-of-N smart account (not a single EOA), plus audit/track-record review and fee structure
- Cross-border missionary / sister-parish transfers (stablecoin payout corridors)
- Diocese-level console (multi-parish reporting and policy controls)
- Direct on-chain crypto donations with FMV receipts
- Tuition invoicing; scrip program replacement

## 9. Core user flows (P0)

**F1. Donor gives:** Scan QR / tap link → giving page → choose fund + amount + frequency → pay via card/ACH/Apple Pay (Bridge-hosted or embedded checkout) → funds settle as USDC to org smart account, tagged to fund → donor receives email receipt. *Donor never sees crypto.*

**F2. Bookkeeper reconciles:** Dashboard shows gifts in USD by fund in near-real-time → exports CSV to QuickBooks. No manual fund allocation.

**F3. Payout with dual control:** Admin initiates payout (amount, fund, destination = verified parish bank account) → request goes to approvers → second signature collected via email-link approval flow (Privy session signing, gas sponsored) → Bridge off-ramps USDC → ACH/wire to parish bank → immutable audit log entry.

**F4. Year-end statements (P1):** Admin clicks "Generate 2026 statements" → batch PDFs per donor with IRS-required language → emailed via Resend + downloadable archive.

## 10. Architecture & stack

| Layer | Choice | Notes |
|---|---|---|
| Chain | Base | Low fees, strong stablecoin liquidity (USDC native) |
| Wallets | Privy embedded wallets + smart accounts | Email auth; non-custodial; org account is a smart account with role-based signers |
| Account abstraction | EIP-7702 | Gas sponsorship + batched approvals; no user-visible signing |
| Onchain infra | Alchemy | RPC + indexing/webhooks (keeps the Postgres ledger in sync with chain state) and Gas Manager paymaster powering the sponsorship above |
| Fiat ramps | Bridge (BridgeXYZ) | On-ramp (card/ACH) and off-ramp (payouts); Bridge carries MSB licensing + KYC/KYB |
| Approvals | 2-of-N policy enforced at smart-account level | On-chain enforcement, not just app-layer — this is the audit-grade differentiator |
| Email | Resend | Receipts, approval requests, statements |
| Backend | Node.js + Postgres | Org/fund/donor ledger mirrors on-chain state; webhooks from Bridge |
| Frontend | Web (Next.js or similar), responsive | Donor pages + staff dashboard; no native app in v1 |
| Swaps (if needed) | LI.FI | Only if multi-stable support is required; v1 is USDC-only |

**Build-vs-reuse note:** Wallets, ramps, gas sponsorship, and email are integrations (~reusable from existing open patterns). The proprietary build is: org/role model, fund ledger, approval engine, giving pages, receipts/statements. That is where engineering time should go.

## 11. Legal & compliance guardrails

1. **Non-custodial architecture.** Org funds sit in the org's own smart account; the platform cannot unilaterally move funds. Combined with Bridge as the licensed transmitter for fiat legs, the platform positions as software, not a money transmitter. **Confirm with fintech counsel before launch** (state-by-state money transmission analysis, ~1–2 hours of counsel time for a memo).
2. **Naming.** Never "bank," "banking," or "deposits" in product copy. Use "giving," "treasury," "funds."
3. **No yield in v1.** Avoids securities/BlockFi-pattern risk entirely at pilot stage. When introduced, structure as org-directed, self-custodied deployment — not a platform-offered interest rate.
4. **Tax receipts.** Cash-equivalent gift receipts with standard 501(c)(3) language ("no goods or services were provided..."). Parish (not platform) is the donee of record.
5. **KYC/KYB.** Performed by Bridge; platform stores minimal PII (donor name, email, gift history for statements).
6. **Diocesan policy.** Treat the diocese as a quasi-regulator: support sweeping balances to diocesan-approved depositories; offer read-only auditor access.

## 12. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Diocese blocks anything crypto-adjacent | Medium | Lead with fees/controls/statements; crypto framed as settlement infrastructure; support sweep-to-approved-bank; engage diocesan finance office early, not after launch |
| Bridge pricing/coverage changes | Medium | Abstract ramp layer behind an interface; evaluate backup ramp providers |
| Donor conversion drops vs incumbents | Medium | Apple Pay/Google Pay support; keep give flow ≤ 3 taps; A/B against existing flow during pilot |
| Stablecoin depeg / headline risk | Low | USDC-only; near-immediate off-ramp option for orgs that want daily sweeps |
| Key-person/account recovery (staff turnover) | Medium | Org-level recovery via N-of-M signers + documented diocesan recovery path; never single-signer orgs |
| Regulatory shift on stablecoin apps | Low-Med | Non-custodial posture; monitor; counsel review pre-launch and pre-yield |

## 13. Milestones (8-week target to pilot)

| Week | Milestone |
|---|---|
| 1 | Finalize scope; pastor verbal buy-in; Bridge + Privy accounts/sandbox; legal memo commissioned |
| 2–3 | Org/smart-account model, roles, Privy auth; Bridge on-ramp integration; USDC settlement to org account |
| 4 | Giving page (funds, one-time + recurring, receipts); QR/link generation |
| 5 | Dashboard (balances by fund, activity, donor list, CSV export) |
| 6 | Payout flow with 2-of-N approval + off-ramp to bank; audit log |
| 7 | End-to-end testing with real small dollars; finance council demo; pilot campaign selected |
| 8 | **Pilot launch** (one fundraiser / second collection); instrumented metrics (G1–G5) |
| Post | Year-end statements (must ship before Jan); campaign thermometer pages; diocese conversation with pilot data |

## 14. v2 Segment expansion — small-org treasury (PTAs, boosters, HOAs, mutual aid funds)

The parish product generalizes to any small volunteer-run organization with a treasurer, a board, and weak financial controls. Same codebase, ~15% delta.

**Why this segment:** these orgs run on a checkbook + one volunteer treasurer + a spreadsheet. Treasurer embezzlement is a chronically recurring problem in PTAs and booster clubs precisely because no dual control exists. The pitch is identical to Steward's core: dual-approval spending, fund segregation, member-auditable transparency, automated records — plus the things that vary by org type below.

**What changes vs. the parish product:**

| Area | Parish (v1) | Small-org (v2) |
|---|---|---|
| Onboarding | High-touch, founder-led, diocesan politics | Self-serve signup with KYB flow |
| Entity complexity | Parish under diocese, predictable | Messy: PTAs are often 501(c)(3) under a state PTA umbrella; booster clubs range from incorporated nonprofits to informal associations; HOAs are corporations. KYB flow must branch by entity type, and Bridge's KYB requirements determine who can onboard self-serve |
| Inbound money | Donations | Donations **plus dues** (HOA assessments, membership fees) and lightweight event payments — requires invoicing/dues-tracking, the largest net-new feature |
| Approvers | Pastor + finance council | Treasurer + board officers (2-of-N identical mechanically) |
| Transparency | Auditor/diocese view | **Member-facing** read-only ledger — a selling point for orgs whose members demand visibility |
| Distribution | Diocese as channel | State PTA associations, HOA management companies, booster/league networks; also bottoms-up self-serve |
| Pricing | Decided post-pilot | Self-serve SaaS ($20–50/org/mo) and/or ramp spread; these orgs are price-sensitive but currently lose more to fraud risk and card fees |

**Sequencing:** ship only after the St. Bernadette's pilot proves the core. The self-serve KYB branching and dues/invoicing are the two real engineering lifts; everything else is reuse.

## 15. Open questions

1. Which diocese is St. Bernadette's under, and does it mandate a deposit & loan fund or approved depository list? (Determines payout/sweep design.)
2. What does the parish currently use for online giving, and what are its actual all-in fees and volumes? (Sets the concrete savings number for the pitch.)
3. Pilot vehicle: school fundraiser vs. second collection? (Fundraiser = lower stakes, natural end date; collection = closer to core offertory.)
4. Entity setup for the platform itself (LLC/C-corp) and who signs the Bridge platform agreement.
5. Pricing model: flat SaaS fee, per-transaction spread, or free pilot → diocese-level licensing? (Recommend free pilot; decide pricing with real cost data.)
