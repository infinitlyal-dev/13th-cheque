# 13th Cheque — Autonomous Build Instructions

## Your Mission

Build a complete, polished, production-ready React prototype of The 13th Cheque app. This is a South African tax refund tracker that helps people find and build their annual SARS tax refund — their "13th Cheque."

Read `thirteenth-cheque-v2.jsx` to understand what exists. It is a starting point, not a finished product.

---

## Autonomous Loop — Max 5 Iterations

Run the following loop. Stop when all agents pass or after 5 full iterations, whichever comes first. Do NOT run forever.

```
ITERATION LIMIT: 5
PASS CONDITION: All 8 agents produce no HIGH or CRITICAL issues
```

### The Loop

**STEP 1 — READ ALL SKILLS**
Read every SKILL.md in the `skills/` folder before doing anything else. Also read the frontend-design skill already installed in your system skills.

**STEP 2 — RUN ALL 8 AGENTS IN PARALLEL**
Spawn all 8 agents simultaneously against the current build:
- `skills/agent-user/SKILL.md`
- `skills/agent-sars/SKILL.md`
- `skills/agent-tax-consultant/SKILL.md`
- `skills/agent-ai-integration/SKILL.md`
- `skills/agent-product-designer/SKILL.md`
- `skills/agent-mobile-data/SKILL.md`
- `skills/agent-trust/SKILL.md`
- `skills/agent-notifications/SKILL.md`

Each agent produces a full report. Save reports to `reports/iteration-N/agent-name.md`.

**STEP 3 — TRIAGE**
Collate all agent reports. Classify every issue:
- CRITICAL: Build-breaking, legally wrong, or causes app to fail
- HIGH: Significant UX or compliance problem
- MEDIUM: Noticeable issue, not blocking
- LOW: Polish item

**STEP 4 — BUILD**
Fix all CRITICAL and HIGH issues. Apply frontend-design skill to ensure visual quality. Build incrementally — fix the biggest problems first.

**STEP 5 — CHECK LOOP**
If CRITICAL or HIGH issues remain AND iteration count < 5, go to STEP 2.
If no CRITICAL or HIGH issues remain, go to STEP 6.
If iteration count = 5, go to STEP 6 regardless.

**STEP 6 — FINAL REPORT**
Write `FINAL-REPORT.md` summarising:
- What was built
- What each agent found
- What was fixed
- Any remaining MEDIUM/LOW issues for next session
- Overall quality assessment

---

## What Needs to Be Built

The current prototype (v2) has these known problems that must be fixed:

### Critical Fixes
1. **Income input** — Replace raw number input with formatted currency field (R button increments, or formatted with commas). Typing R25000 should be easy and satisfying, not frustrating.
2. **Budget categories** — Replace the current list with South African household reality:
   - Housing (Rent / Bond repayment)
   - Utilities (Electricity, Water, Rates)
   - Groceries & Food
   - Eating Out & Takeaways
   - Transport (Fuel / Taxi / Uber)
   - Medical Aid & Health
   - Insurance (Car, Home, Life)
   - School Fees & Education
   - Clothing & Personal Care
   - Entertainment & Subscriptions
   - Savings & Investments
   - Family Support (extended family obligations)
   - Other (with custom item entry)
   Each category should have a dropdown of common sub-items. User can add custom items.
3. **White screen on Done** — Fix the navigation bug that causes white screen after completing onboarding.
4. **Post-onboarding guidance** — After setup, Tjommie must actively direct the user: "Right [name], let's find your money. Want to start with your work expenses or set up your monthly budget first?" Give them a clear choice, not silence.
5. **Home screen direction** — Tjommie on home screen must say something specific and actionable, not generic. First visit: guide to first action. Returning visit: reference what they did last time.

### Important Additions
6. **Career-aware deduction suggestions** — After user enters occupation, Tjommie surfaces a personalised list: "As a [occupation], you can probably claim these..." with a pre-populated shortlist to confirm, not a blank form to fill.
7. **Category before amount** — In the Add Expense screen, category selector must come BEFORE the amount field.
8. **Receipt upload button** — Prominent camera/upload button at the top of Add Expense. For prototype: show a realistic "scanning..." animation then auto-fill with plausible test data.
9. **Reminder setup** — Add a screen (or Tjommie prompt) to set a weekly reminder day and time. "When should I remind you to log your expenses? Pick a day and time."
10. **Mid-year catch-up** — When user first opens the app, Tjommie should ask: "Have you had work expenses earlier this year you haven't tracked yet? You can add past expenses — the tax year runs from March to February." Give a clear yes/no path.
11. **Annual report** — Add a "Download my tax summary" button on the 13th Cheque screen that generates a formatted PDF-style summary of all work expenses by category, ready to hand to a tax practitioner.
12. **RA Contributions** — Add Retirement Annuity as a deduction category with a prominent callout: "This is the biggest single tax deduction most South Africans miss."

### The Feeling
The app must feel like a product, not a form. Every interaction should feel like:
- Progress, not admin
- Money being found, not data being entered
- A friend helping, not a system processing

Tjommie is the personality layer. He must feel present, warm, and specifically South African throughout.

---

## Technical Requirements

- Single file React component (JSX)
- localStorage for persistence (no async storage API)
- Anthropic API for Tjommie chat (claude-sonnet-4-20250514, max_tokens 400)
- No external dependencies except what's available in the Claude.ai artifact environment
- Fonts: Google Fonts via @import
- Must render as a phone frame (390x844px)
- All navigation must work without white screens or broken states

---

## Visual Design Standard

Use the frontend-design skill. The app uses:
- Dark navy base (#07101D)
- Gold accent (#F0B429) for the 13th Cheque / tax refund layer
- Green (#10B981) for living money / savings layer
- Premium fintech aesthetic — dark, warm, confident
- Font pairing: Sora (headings/numbers) + DM Sans (body)
- Animations on number reveals, progress bars, and the reward moment after adding a work expense

The gold number growing when a work expense is added is the emotional core of the app. That moment must be satisfying.

---

## Output

Save the final build as `thirteenth-cheque-final.jsx` in the project root.
Save all agent reports to `reports/`.
Save the final summary to `FINAL-REPORT.md`.

---

## Important Notes

- Do not ask for permission. Build, test with agents, fix, repeat.
- Do not stop to check in unless you hit a genuine ambiguity about South African tax law.
- The SARS agent is the authority on tax accuracy. If it flags something, fix it.
- The Product Designer agent is the authority on whether a feature belongs at all.
- When agents conflict, prioritise: SARS > Product Designer > User > everyone else.
- This is a South African product. Every assumption must fit South African reality.
