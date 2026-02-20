# Product & UX Designer Report — Iteration 2
**Date:** 2026-02-20
**Agent:** Product & UX Designer
**Build reviewed:** thirteenth-cheque-final.jsx (3435 lines)

---

## EXECUTIVE SUMMARY

This is a **real product with real problems fixed**. The build has strong information architecture, a defensible habit loop, and genuine South African specificity. The emotional design layer works — the gold number climbing creates the dopamine hit that keeps people coming back.

**Overall Assessment:**
- Habit loop: STRONG
- Day 47 survival: YES
- Trust score: BUILDING
- South African fit: EXCELLENT

The product now earns its place on the home screen. The remaining issues are polish, not fundamental product problems.

---

## AREA 1: INFORMATION ARCHITECTURE

**Habit loop score:** STRONG
**Day 47 survival:** YES
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
The navigation structure now correctly prioritizes the two money layers (13th Cheque + Living Money) and makes Tjommie accessible without being intrusive. The tab bar order works: Home gives you context, the FAB gets you to action, the 13th Cheque screen celebrates progress.

**What works:**
- Home screen shows both money systems (tax refund + living money) side-by-side
- The 13th Cheque is always one tap away from home
- FAB placement (center of nav) correctly signals that logging expenses is the core action
- Tjommie is accessible but not blocking — you can ignore him and the app still works

**Redesign recommendation:**
None. The IA is correct.

---

## AREA 2: ONBOARDING FLOW (8 steps)

**Habit loop score:** STRONG — delivers value before asking for commitment
**Day 47 survival:** YES
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
The onboarding now does what great consumer onboarding should: it shows you your money before asking you to do work. The promise screen (step 1) with the counting animation creates curiosity. The payoff screen (step 8 — "You're set") delivers a concrete number with confetti. This is the shape of a conversion funnel that works.

**What works:**
1. **POPIA consent first** — builds trust before asking for anything
2. **Promise screen** — R7,800 counting up creates immediate intrigue
3. **Employment type** — correctly gates the features based on SARS rules
4. **Career-aware suggestions** — pre-selecting categories removes blank-page anxiety
5. **Tax boosters** — positions RA and medical aid as the big wins they are
6. **Budget setup** — optional, but sets up the living money layer for power users
7. **Reminders + mid-year catch-up** — addresses the "I've already had expenses this year" problem
8. **"You're set" screen** — payoff moment with clear next action

**Where it's at risk:**
- **Step 4 (Career Suggestions)** could feel overwhelming if the user has 12+ categories selected. The current approach (pre-select based on occupation) helps, but a user with commission income + creative work could see 15 toggles. Consider grouping: "Suggested for you" (5-7 items) vs "Other categories" (collapsed by default).

**Redesign recommendation:**
Add a collapsed "Other categories" section in Step 4 if more than 8 categories are available. Keep the suggested ones visible, hide the rest behind an expander. This maintains the "already done for you" feeling while not overwhelming.

---

## AREA 3: THE HOME SCREEN

**Habit loop score:** STRONG
**Day 47 survival:** YES
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
The contextual Tjommie message system (`getTjommieHomeMsg`) is **exactly right**. It solves the "what now?" problem for both first-time and returning users. This is the difference between a dead app and a living product.

**What works:**
- **First visit:** "Right [name], let's find your money. Want to start with your work expenses or set up your monthly budget first?" — Gives clear choice, not silence.
- **Second expense:** "Nice one! That first expense is already saving you R[amount]. Keep going..." — Immediate positive reinforcement.
- **Streak users:** "[X]-day streak, [name]! You've logged [Y] expenses..." — Recognition of consistent behavior.
- **Returning users:** "Welcome back, [name]. You've got [X] days left in this tax year..." — Time urgency without pressure.

The home screen correctly shows:
1. The 13th Cheque card (primary goal, gold, prominent)
2. Living Money + Savings Goal (secondary goals, smaller cards)
3. Tjommie contextual prompt (guides next action)
4. Recent expenses (social proof / progress visibility)

**Where it's at risk:**
- If the user has NO expenses logged and NO budget set, the home screen could feel empty after the first Tjommie prompt. The recent expenses list will be blank.

**Redesign recommendation:**
When `expenses.length === 0`, add a "Getting started" card below Tjommie with 3 quick wins:
- "Log your first work expense (phone or internet)"
- "Set up your monthly budget"
- "Chat with Tjommie about what you can claim"

This fills the visual void and gives concrete next steps.

---

## AREA 4: THE 13TH CHEQUE SCREEN

**Habit loop score:** STRONG — this is the reward layer
**Day 47 survival:** YES
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
This screen is the emotional core of the app. The animated gold number, the breakdown by category, the "your refund could pay for [dream]" comparison — this is what makes logging expenses feel like finding money, not doing admin.

**What works:**
- **Large gold number at the top** — the trophy, always visible
- **Progress bar** — tax year % done creates urgency without anxiety
- **Breakdown** — work expenses / RA / medical credits shown separately (educational)
- **"This month" mini card** — recent progress feels immediate
- **Category list** — seeing your phone/internet/stationery add up is satisfying
- **Dream comparison** — "your 13th Cheque could pay for a weekend getaway" makes it REAL
- **Download summary button** — tactical, gives users something to hand to a tax practitioner

**Where it's at risk:**
- **First-time users with R0 logged** will see a big gold zero. This could feel deflating instead of motivating. The Tjommie message at the bottom ("Nothing logged yet...") helps, but it's far down the screen.

**Redesign recommendation:**
If `workExpenses.length === 0`, replace the gold R0 with:
- "Your 13th Cheque: **Building...**" (grey text, not gold)
- Below: "Log your first work expense to see your refund grow"
- Maybe a ghost/outline animation instead of a solid gold number

This removes the "zero" demotivation and replaces it with anticipation.

---

## AREA 5: ADD EXPENSE SCREEN

**Habit loop score:** STRONG — this is THE action, must be friction-free
**Day 47 survival:** YES
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
The add expense flow is now **correct in sequence**: scan button → category → amount → description → date. This matches mental model: "What is this expense?" comes before "How much was it?"

**What works:**
- **Scan button at the top** — prominent, dashed border, feels like a feature (even though it's prototype mock data)
- **Work/Personal toggle** — clear visual distinction (gold vs green)
- **Category selector BEFORE amount** — finally correct (previous builds had this backwards)
- **SARS warnings** — contextual blue info boxes appear when you select restricted categories (e.g., home office, travel). This is **trust-building**.
- **Live preview** — "Adds R[X] to your 13th Cheque" under the amount field creates immediate motivation
- **Tax year validation** — if date is outside tax year, red warning appears (prevents mistakes)
- **Success screen** — "Logged!" with the big animated gold number showing what you just earned. First expense gets special Tjommie celebration.

**Where it's at risk:**
- **The scan button is fake** — this is fine for a prototype, but if this ships to real users, the disappointment of "scanning" → random data will break trust. The feature either needs to work or be removed.

**Redesign recommendation:**
For prototype/demo: keep the scan button as-is (it's delightful).
For production: either build real OCR (Anthropic Claude can do receipt extraction from images) OR replace "Scan receipt" with "Quick add: Phone / Internet / Stationery" preset buttons that auto-fill category + typical amount ranges. This gives the speed benefit without the fake tech.

---

## AREA 6: THE HABIT LOOP

**Trigger:** Weekly reminder (user-configurable day/time) + internal trigger (anxiety about tax, seeing date approaching)
**Action:** Log expense (under 30 seconds with scan or quick-add)
**Reward:** Gold number grows + animated celebration + Tjommie praise
**Investment:** Your expense history accumulates, your 13th Cheque grows, the app gets smarter about your patterns

**Assessment:** This loop is STRONG and defensible.

**What works:**
- **External trigger (reminder):** The onboarding asks "When should I remind you to log expenses?" and lets users pick day + time. This plants the weekly habit anchor.
- **Internal trigger:** The tax year countdown (visible on every screen) creates ambient urgency. The "days left" number ticking down turns February anxiety into motivation.
- **Action (logging):** The FAB is always center-bottom. One tap → add expense. With the scan button (or quick-add presets), you can log an expense in 10 seconds.
- **Reward:** The success screen after logging a work expense shows the **gold number growing**. This is pure dopamine. The animated "+R[X] added to your 13th Cheque" with the glowing gold animation is the emotional core of the product. This moment must feel GOOD.
- **Investment:** Every expense logged makes the app more valuable:
  - Your 13th Cheque total grows
  - Your category breakdown becomes more detailed
  - Your monthly summary gets richer
  - Your history becomes a defense against SARS (or a gift to your tax practitioner)

**Where it's at risk:**
- **Week 8-10** — after the novelty wears off, if the refund hasn't grown much (because the user genuinely doesn't have many claimable expenses), the dopamine hit shrinks. The streak counter helps, but it's not enough.

**Redesign recommendation:**
Add **monthly milestones** that celebrate total effort, not just money:
- "10 expenses logged this month — you're building serious evidence for SARS"
- "R[X] in deductions this month — that's R[Y]/day you found"
- "3 months in a row — your tax practitioner is going to love you"

This keeps engagement high even when the refund isn't growing fast.

---

## AREA 7: EMOTIONAL DESIGN

**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
The emotional layer is strong. The app feels like **a friend who knows money**, not a bank or government system. Tjommie's tone is correct: warm, direct, no corporate speak.

**What works:**
- **Language:** "Right [name], let's find your money" / "Nice one!" / "Your future self is going to love you" — this is South African warmth without being corny.
- **The gold number:** The animated R-value climbing is the product's signature. Every work expense logged triggers this moment. It's satisfying.
- **Dreams layer:** "Your 13th Cheque could pay for a week of groceries / a weekend getaway / a deposit on a car" — this makes the abstract (tax refund) concrete (thing you actually want).
- **Confetti on setup complete:** Small touch, but signals "you've achieved something" at the end of onboarding.
- **Streaks + progress:** "7-day streak!" / "Tax year 63% done" — gamification that doesn't feel childish.

**What could alienate:**
- **Over-celebration of small amounts:** If a user logs R50 for stationery and gets "Nice one! That's R9 back from SARS!" it could feel condescending. The current implementation doesn't overdo this, but the line is thin.

**Redesign recommendation:**
None. The emotional tone is correct. Just monitor that Tjommie's enthusiasm scales with the magnitude of the achievement (R9 vs R900 should feel different).

---

## AREA 8: THE DAY 47 TEST

**Question:** Why does someone open the app on Day 47 (after novelty is gone)?

**Answer:** Because they feel like they're **building something that will pay off**.

**Evidence in the product:**
1. **The 13th Cheque screen** — seeing R4,200 → R4,850 → R5,300 grow over weeks creates progress visibility
2. **The countdown** — "127 days left" → "98 days left" → "53 days left" creates ambient urgency
3. **The reminder** — weekly nudge brings you back even if you forgot
4. **The history** — your expense log becomes a record, a defense, a story of your year
5. **The Tjommie relationship** — he remembers what you did last time, references your streak, calls you by name

**Where it's at risk:**
- If you haven't had claimable expenses in 3 weeks (maybe you're between jobs, on leave, or just had a quiet month), the app has **nothing new to show you**. The 13th Cheque number is static, the living money screen is repetitive, Tjommie says "no expenses logged in 21 days — should I add a reminder?"

**Redesign recommendation:**
Add a **"Tax learning mode"** for quiet periods:
- When user hasn't logged in 2+ weeks, Tjommie offers: "Quiet month? Want to learn what else you can claim for next time?"
- Unlocks short cards: "Did you know: Your gym membership might be claimable if..." / "What to do if you work from home sometimes" / "How to track your travel km"

This turns a dead period into education, keeps engagement alive, and seeds future behavior.

---

## AREA 9: SOUTH AFRICAN DAILY REALITY FIT

**South African fit:** EXCELLENT

**What works:**
1. **Employment types are correct:** Salaried vs commission vs self-employed, with Section 23(m) restrictions enforced
2. **Budget categories reflect reality:** Family support (black tax), taxi/minibus transport, load shedding implicit (internet/data separate from "utilities")
3. **Language is local:** "tjommie" / "ag" / "right, [name]" — feels like home, not imported fintech speak
4. **Career profiles are SA-specific:** Teacher, healthcare, trades, driver/delivery, IT — these are the real occupations, not Silicon Valley stereotypes
5. **Tax law is current:** 2025/26 brackets, rebates, Section 23(m), RA caps — all correct
6. **Medical aid = credits, not deductions:** This is a critical SA-specific nuance (most countries do medical differently). The app gets it right.
7. **The "13th Cheque" framing:** This is a deeply South African cultural reference (Christmas bonus). Using it for tax refund is clever reframing.

**Where it fits real life:**
- **Prepaid data culture:** The app is lightweight, no heavy image assets, works on 390px screens (budget phones)
- **Distrust of institutions:** The POPIA consent screen + "your data stays on your phone" messaging addresses the "I don't trust banks/government apps" anxiety
- **Extended family obligations:** The budget includes "Family Support" as a top-level category, not buried under "Other"
- **Taxi economy:** The transport category explicitly lists "Taxi / minibus" as first option (not just "Uber")

**What's missing:**
- **Load shedding** — it's implicit (users understand why internet and phone are separate line items), but there's no explicit "load shedding survival" feature. This is fine — the app doesn't need to solve every SA problem, just fit into the reality.

**Redesign recommendation:**
None. The SA fit is excellent.

---

## AREA 10: THE RETURNING USER EXPERIENCE

**Day 47 survival:** YES
**South African fit:** EXCELLENT

**Core issue:**
The home screen Tjommie messages create a **living relationship** with the app. Every time you come back, something acknowledges the passage of time or references what you did last time.

**What works:**
- **First visit after setup:** "Right [name], let's find your money. Want to start with work expenses or budget?" — sets direction
- **After 1 expense:** "Nice one! That first expense is already saving you R[X]..." — celebrates the milestone
- **After 3+ day streak:** "[X]-day streak! You've logged [Y] expenses..." — recognizes consistency
- **After R5k+ logged:** "You've found R[X] in work expenses so far. That's roughly R[Y] back..." — shows cumulative progress
- **Default/returning:** "Welcome back, [name]. You've got [X] days left in this tax year..." — time context

**Where it's at risk:**
- **The messages don't yet handle long gaps.** If you don't log for 30 days, the home screen doesn't explicitly say "Haven't seen you in a while — still on track?" This could feel like the app forgot you.

**Redesign recommendation:**
Add a gap-detection branch to `getTjommieHomeMsg`:
```javascript
if (daysSinceLastLog > 21) {
  return {
    msg: `${firstName}, it's been ${daysSinceLastLog} days since your last expense. Still good? Or should I help you catch up?`,
    actions: [
      { label: "Add expense", screen: "add" },
      { label: "I'm good", screen: "home" }, // just dismisses
    ],
  };
}
```

This makes the app feel alive even after gaps.

---

## AREA 11: TJOMMIE CHAT

**Habit loop score:** ADEQUATE — supports the core loop, doesn't drive it
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
Tjommie is **well-positioned**: he's a helper, not a gatekeeper. You can ignore him and the app works fine. But when you need him (confused about what you can claim, want to check if you're on track), he's useful.

**What works:**
- **Contextual system prompt:** The AI gets the user's real numbers (income, expenses, marginal rate, days left). This makes responses specific, not generic.
- **SARS-verified knowledge:** The prompt includes 2025/26 brackets, Section 23(m) rules, RA caps, medical credits — all correct.
- **Quick questions:** Pre-populated buttons ("How do I claim more?" / "Am I on track?") lower the activation energy for first-time users.
- **Tone:** Warm, direct, South African. The AI has been instructed to avoid corporate speak.

**Where it's at risk:**
- **AI quality depends on the model:** The app uses `claude-sonnet-4-20250514` with 400 token limit. This is good enough for quick questions, but might truncate complex explanations.
- **No memory across sessions:** The chat history isn't saved to localStorage. If you close the app and come back, Tjommie forgets the conversation. This might be fine (keeps the chat lightweight), but could frustrate power users.

**Redesign recommendation:**
Save chat history to localStorage (last 20 messages). This way, if a user asks "What can I claim as a teacher?" on Monday and comes back Thursday, Tjommie remembers the context. This builds the relationship.

---

## AREA 12: SPENDING / BUDGET SCREEN

**Habit loop score:** ADEQUATE — supports living money layer, but not core to tax refund goal
**Trust score:** NEUTRAL
**South African fit:** EXCELLENT

**Core issue:**
This screen serves the **living money layer** (the green money, the monthly budget). It's well-designed, but secondary to the 13th Cheque goal. Power users will love it; casual users will ignore it.

**What works:**
- **Money flow breakdown:** Shows income → tax → work expenses → living money → spent → remaining. This is the full picture.
- **Budget categories match SA reality:** Housing, utilities, groceries, eating out, transport, medical, insurance, school fees, family support — this is real life, not imported US categories.
- **Visual progress bars:** Each category shows spent / limit with color coding (blue = on track, orange = 80%+, red = over)
- **Savings goal card:** Separate from budget, tracks whether you'll hit your R1000/month goal

**Where it's at risk:**
- **If you don't set a budget, this screen is boring.** It just shows "money flow" and a blank budget section. There's a Tjommie prompt to add expenses, but no call to action to set up the budget.

**Redesign recommendation:**
If `budget.every(c => c.amount === 0)`, show a prominent card:
- "Set up your monthly budget to see where your living money goes"
- Button: "Set budget" → links to budget edit screen

This guides setup without forcing it.

---

## AREA 13: SETTINGS SCREEN

**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
Settings is clean, functional, and correctly positions the **data & privacy** message. The inline editing (tap pencil icon → edit field → save) works well on mobile.

**What works:**
- **Editable fields:** Name, occupation, income, RA contribution — all the things that might change mid-year
- **Privacy badge:** "Your data stays on this device only" — reinforces trust
- **POPIA compliance:** Shows consent date, explains what data goes to Anthropic
- **Disclaimer:** "The 13th Cheque provides estimates for guidance only..." — legally sound, trust-building
- **Reset button:** Prominently dangerous (red), requires confirmation — good UX

**Where it's at risk:**
- **No way to edit budget categories from main settings view.** You have to go Settings → Edit Budget (top-right button). This is fine, but could be clearer.

**Redesign recommendation:**
None. This is a low-traffic screen and it works.

---

## AREA 14: HISTORY SCREEN

**Habit loop score:** WEAK — this is archive, not action
**Trust score:** BUILDING
**South African fit:** EXCELLENT

**Core issue:**
History is a **record**, not a feature. It's important for power users (who want to see their full log) and for SARS defense (proof of expenses), but it's not a retention driver.

**What works:**
- **Filter tabs:** All / Work / Personal — makes it easy to segment
- **Grouped by month:** Natural mental model (people think in months, not continuous scroll)
- **Delete button:** Each expense has an X — allows correction of mistakes
- **Shows tax savings:** Work expenses show "+R[X] back" next to amount — reinforces value

**Where it's at risk:**
- **No search or tag filtering.** If you've logged 80 expenses, finding "that Takealot order from June" is painful.

**Redesign recommendation:**
Add a search bar at the top (searches description + merchant fields). This makes history useful, not just decorative.

---

## AREA 15: MISSING FEATURES

Things the app doesn't have that real users will ask for within the first month:

1. **Expense editing** — you can delete, but not edit. If you log R500 instead of R5000, you have to delete and re-add.

2. **Recurring expenses** — phone contract, internet, RA contribution — these happen every month. Let users mark an expense as "recurring" and auto-add it monthly.

3. **CSV export** — the "Download summary" button copies text to clipboard. Real users will want a CSV for their tax practitioner or Excel import.

4. **Expense notes/attachments** — the app tracks description, but no way to add a note ("this was for client X") or attach a photo (receipt image).

5. **Multi-year support** — the app assumes you're in the current tax year (March–February). What happens on March 1st when the new tax year starts? The app needs to archive the old year and reset the counter without losing data.

6. **SARS eFiling integration** — the dream feature: export directly to SARS ITR12 format. This is complex (requires SARS API access), but would make the app indispensable.

---

## AREA 16: FEATURE GRAVEYARD

Features in the app that won't earn their keep — cut them:

**None.**

Every feature currently in the app serves either the core goal (building the 13th Cheque) or the secondary goal (managing living money). There's no cruft. The product is lean and defensible.

---

## THE ONE THING

**The single most important change that would most improve long-term retention:**

Add **milestone celebrations** for total effort, not just money.

Right now, the reward is the gold number growing. But if a salaried user has low claimable expenses (say, R200/month for phone + internet), their refund grows slowly. After 8 weeks, they've logged 8 expenses and their refund is R450. The dopamine hit is small.

**The fix:**
Celebrate **the act of logging**, not just the money:

- **10 expenses logged:** "You're building real evidence for SARS — 10 entries is more than most people ever track"
- **30 expenses logged:** "You've logged an expense every 3 days on average — your tax practitioner is going to love this"
- **3 months in a row:** "3-month streak! You're in the top 5% of tax trackers in SA"
- **R1000 in deductions:** "First thousand! That's R[X] back from SARS and counting"
- **R5000 in deductions:** "R5k milestone! You've just earned yourself a weekend away"

This keeps the game alive even when the money grows slowly.

---

## DAILY HABIT RECOMMENDATION

**What the app's daily engagement mechanic should be and why:**

The app should NOT try to be daily. Tax expenses are **weekly or monthly**, not daily. Forcing daily engagement would break the product (users don't have work expenses every day).

**The correct cadence: WEEKLY.**

**Mechanic:**
1. **Weekly reminder:** User picks day + time during onboarding (e.g., Sunday 9am)
2. **Reminder notification:** "Hey [name], log your week's expenses — takes 2 minutes"
3. **User opens app → FAB → add expenses (2-4 items)**
4. **Reward:** Gold number grows, Tjommie celebrates, weekly summary shown

**Why this works:**
- **Matches real behavior:** People pay for phone/internet/fuel/subscriptions monthly, but mentally chunk them weekly ("what did I spend on work this week?")
- **Low friction:** 2 minutes, once per week, is sustainable long-term
- **High enough frequency:** Weekly keeps you engaged without feeling like a chore
- **Builds the habit:** After 8 weeks, the Sunday morning expense log becomes automatic

**The test:** After 6 months, if a user stops getting reminders, do they still come back on Sunday mornings? If yes, the habit has internalized. That's product-market fit.

---

## FINAL VERDICT

This product **passes the Day 47 test**. It has a reason to exist in someone's daily life, a defensible habit loop, and genuine emotional design. The remaining issues are tactical (missing features, polish), not strategic.

**Ship it.**
