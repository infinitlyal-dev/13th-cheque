# The 13th Cheque — Agent Skills

Eight specialised review agents for the 13th Cheque app. Each sees the product through a different lens. Together they cover every failure mode before a real user finds it.

## How to Use These

In Claude Code, load a skill when you want that agent's perspective on a specific piece of work. You can run multiple agents on the same feature to get all perspectives. They don't overlap — each has a clear lane.

---

## The Eight Agents

### 1. `agent-user` — The Real User
**What they catch**: Friction, confusion, assumed knowledge, missing guidance, moments where someone gives up.
**Use when**: Reviewing any screen, flow, or copy for user-friendliness.
**Not their job**: Tax accuracy, Tjommie quality, code quality.
**The question they ask**: *Would I open this app again tomorrow?*

---

### 2. `agent-sars` — The SARS Compliance Officer
**What they catch**: Wrong calculations, overclaiming, missing documentation requirements, high-audit-risk features, incorrect employment type rules.
**Use when**: Reviewing tax logic, deduction categories, refund estimates, Tjommie tax advice, or any SARS-facing content.
**Not their job**: UX, Tjommie tone, visual design.
**The question they ask**: *Would SARS accept this?*

---

### 3. `agent-tax-consultant` — The SA Tax Practitioner
**What they catch**: Missed deductions, suboptimal advice, career-specific opportunities the app doesn't surface, Tjommie answers that are correct but not useful.
**Use when**: Reviewing deduction logic, Tjommie responses, career-based suggestions, RA contribution surfacing, overall tax strategy.
**Not their job**: Basic compliance (that's the SARS Agent), UX.
**The question they ask**: *Is this the smartest advice this person could get?*

---

### 4. `agent-ai-integration` — The AI Specialist
**What they catch**: Tjommie speaking at the wrong moment, generic responses, Clippy-level interruptions, system prompt gaps, stateless session problems, tone inconsistency.
**Use when**: Reviewing Tjommie system prompt, proactive messages, reactive responses, notification copy, quick question chips.
**Not their job**: Tax accuracy, visual design.
**The question they ask**: *Is this the right moment, right message, right tone — or is this Clippy?*

---

### 5. `agent-product-designer` — The Product Designer
**What they catch**: Missing daily habit loop, Day-47 retention problems, information architecture issues, emotional design gaps, features that don't earn their keep, the overall product not having a reason to exist in someone's daily life.
**Use when**: Reviewing information architecture, feature decisions, onboarding, the monthly review, the year-end moment, overall product strategy.
**Not their job**: Tax accuracy, code quality.
**The question they ask**: *Does this product earn daily use?*

---

### 6. `agent-mobile-data` — The Mobile Specialist
**What they catch**: Data cost problems, load shedding failure modes, offline functionality gaps, low-end device performance issues, battery drain, accessibility barriers.
**Use when**: Reviewing any feature that makes network calls, requires constant connectivity, or assumes a high-spec device.
**Not their job**: Tax accuracy, Tjommie personality.
**The question they ask**: *Does this work on a Galaxy A15, on a R29 data bundle, during Stage 4 load shedding?*

---

### 7. `agent-trust` — The Trust & Inclusion Specialist
**What they catch**: POPIA compliance gaps, data collection that exceeds what's necessary, financial literacy barriers, SARS fear amplification, trust-spending design patterns, exclusion of informal workers or lower-literacy users.
**Use when**: Reviewing onboarding, data collection, privacy copy, any screen asking for sensitive information, Tjommie copy that references SARS.
**Not their job**: Tax accuracy, technical implementation.
**The question they ask**: *Would someone who has never trusted a financial app trust this one — and should they?*

---

### 8. `agent-notifications` — The Habit Design Specialist
**What they catch**: Notification copy that costs more trust than it gives, wrong timing, generic messages, permission strategy problems, habit loop gaps, absence of the right notifications.
**Use when**: Reviewing notification system, reminder logic, engagement mechanics, monthly check-in design, any feature designed to bring users back.
**Not their job**: Tax accuracy, visual design.
**The question they ask**: *Is Tjommie in your pocket a welcome guest or an uninvited one?*

---

## Recommended Review Order

When reviewing a new feature or screen:

1. **`agent-product-designer`** first — does this feature belong at all?
2. **`agent-user`** — can a real person actually use it?
3. **`agent-sars`** + **`agent-tax-consultant`** in parallel — is the tax right and optimal?
4. **`agent-ai-integration`** — is Tjommie's involvement right?
5. **`agent-trust`** — does this earn or spend trust?
6. **`agent-mobile-data`** — does this work in real South African conditions?
7. **`agent-notifications`** last — only after the feature itself is right

For full app reviews (before each major release), run all eight.

---

## The Four Failure Modes These Agents Prevent

| Failure Mode | Primary Agent | Secondary |
|---|---|---|
| Bad UX — users give up | agent-user | agent-product-designer |
| Legal risk — SARS audit or rejection | agent-sars | agent-tax-consultant |
| Missed value — underclaiming | agent-tax-consultant | agent-ai-integration |
| Annoying AI — Clippy | agent-ai-integration | agent-notifications |
| Data/device failure | agent-mobile-data | agent-trust |
| Trust breakdown | agent-trust | agent-user |
| Habit failure | agent-product-designer | agent-notifications |
| Inclusion failure | agent-trust | agent-mobile-data |
