# AI Integration Specialist Agent Report — Iteration 1

**File reviewed:** `thirteenth-cheque-v2.jsx`
**Date:** 2026-02-20
**Agent:** AI Integration Specialist
**Focus:** Every Tjommie touchpoint — system prompt, proactive messages, reactive responses, notification strategy, quick questions, tone consistency, Clippy risk

---

## Executive Summary

Tjommie has a strong foundation. The system prompt is well-constructed and the character voice is mostly consistent. However, the current build suffers from three structural problems:

1. **Tjommie is mostly silent.** Outside the chat screen and a handful of static tips, Tjommie has almost no presence in the app. Users will forget he exists.
2. **Proactive messages are static strings, not contextual intelligence.** Every Tjommie bubble shows the same text regardless of time of day, user history, or tax year position. This is the fastest path to Clippy.
3. **The chat feature is technically broken** — the API call to Anthropic has no authentication header (`x-api-key`), meaning every chat attempt will fail with a 401. Tjommie's most valuable feature is dead on arrival.

**Severity: 2 CRITICAL, 5 HIGH, 7 MEDIUM, 4 LOW issues.**

---

## 1. SYSTEM PROMPT REVIEW

### Location: `S_Tjommie` component, lines 766-786

**INTERACTION: System prompt construction**
- Moment appropriateness: RIGHT — built fresh per session with live user data
- Content quality: GOOD — includes income, marginal rate, employment type, deduction categories, cheque total, and days left
- Tone: ON CHARACTER — "warm South African financial assistant" and "knowledgeable friend" are clear directives
- User value: HIGH — model has everything it needs for personalised answers
- Clippy risk: LOW
- Fix: Several gaps remain (see below)

### What the system prompt gets right:
- User's real financial data is injected (income, tax, marginal rate, cheque total)
- Employment type fork is present and correct (Section 23(m) vs Section 11(a))
- Tone direction is clear: "like a knowledgeable friend — direct, warm, plain South African English"
- Escalation rule is present: "Recommend a tax practitioner for complex situations"
- Session context via the last 6 messages being passed to the API
- SARS 2025/26 brackets and rebates are included

### SYSTEM PROMPT GAPS (CRITICAL and HIGH):

**GAP 1 — No API key in the fetch call (CRITICAL)**
Line 797: The `fetch` call to `https://api.anthropic.com/v1/messages` includes `Content-Type` but NO `x-api-key` header and NO `anthropic-version` header. Every single chat message will fail with a 401 or 400 error. Tjommie's chat is completely broken.

```javascript
// Current (broken):
headers:{"Content-Type":"application/json"}

// Needed:
headers:{
  "Content-Type":"application/json",
  "x-api-key": API_KEY,
  "anthropic-version": "2023-06-01"
}
```

**Severity: CRITICAL** — The primary Tjommie interaction is non-functional.

**GAP 2 — No occupation-specific deduction intelligence (HIGH)**
The system prompt includes the user's occupation but doesn't tell Tjommie what deductions are typical for that occupation. A teacher, a Uber driver, and a software developer all have very different deduction profiles. The system prompt should include 3-5 occupation-specific suggestions. Example: "As a teacher, typical deductions include: stationery and classroom supplies, training courses and CPD, work travel between schools."

**GAP 3 — No budget/spending context passed to Tjommie (HIGH)**
The budget categories and current spending are not included in the system prompt. If a user asks "Am I spending too much on eating out?", Tjommie has no data to answer. The budget array and this month's spending totals should be injected.

**GAP 4 — No history awareness (MEDIUM)**
The system prompt tells Tjommie the total work expenses but not the breakdown. Tjommie cannot say "You haven't logged any phone expenses yet — that's usually the biggest one" because he doesn't know which categories have entries and which don't.

**GAP 5 — No conversation memory across sessions (MEDIUM)**
Each time the user opens the chat, Tjommie starts fresh. Previous conversations are lost. For a "friend" character this is jarring. At minimum, a summary of the last conversation should be stored in localStorage and injected into the system prompt.

**GAP 6 — No time-of-year awareness (MEDIUM)**
The prompt includes days left but doesn't tell Tjommie to adjust behaviour based on tax year position. In February (right now!), Tjommie should be urgently reminding users to log everything before the 28th. In March, he should be congratulating them on a new tax year. In September, he should be talking about provisional tax. The prompt needs seasonal intelligence.

**GAP 7 — No max_tokens handling (LOW)**
The `max_tokens` is set to 350 which is reasonable for mobile but may cut off mid-sentence on complex questions. The system prompt should include: "Keep answers under 3 short paragraphs. If the topic is complex, give a brief answer and offer to explain more."

---

## 2. PROACTIVE MESSAGES REVIEW

### 2.1 Onboarding — Employment Type Screen (line 267)

**INTERACTION: "Hey, I'm Tjommie. This first question matters most. Be honest — it can only help you."**
- Moment appropriateness: RIGHT — this is literally the first Tjommie touchpoint, and the question genuinely matters
- Content quality: GOOD — brief, human, sets the right expectation
- Tone: ON CHARACTER — "Be honest — it can only help you" is warm and direct
- User value: HIGH — reduces anxiety about a potentially sensitive question
- Clippy risk: NONE
- Fix: None needed. This is one of the best Tjommie moments in the app.

### 2.2 Onboarding — Salaried Warning (lines 280-284)

**INTERACTION: "Greyed-out categories can't be claimed by salaried employees — SARS expects your employer to cover these."**
- Moment appropriateness: RIGHT — appears only for salaried employees, exactly when relevant
- Content quality: GOOD — explains the restriction clearly
- Tone: OFF CHARACTER — This is a system warning, not Tjommie. It uses a warning icon and red styling but not Tjommie's voice. It says "SARS expects" which is corporate language.
- User value: MEDIUM — the information is correct but could be more actionable
- Clippy risk: NONE
- Fix: Rewrite in Tjommie's voice: "Look, because you're salaried, SARS says your employer should cover most of these. The greyed-out ones are off-limits — but the ones you can toggle? Those are where your money is."

### 2.3 Onboarding — Deductions Screen (line 339)

**INTERACTION: "Don't overthink this. Start with what you know, and add more later. I'll remind you as you go."**
- Moment appropriateness: RIGHT — users likely feel overwhelmed by the category list
- Content quality: GOOD — reduces decision paralysis
- Tone: ON CHARACTER — "Don't overthink this" is exactly how a friend talks
- User value: MEDIUM — helpful but the promise "I'll remind you" is currently a lie (no reminder system exists)
- Clippy risk: LOW — the promise of future reminders creates a credibility gap when they never come
- Fix: Either remove "I'll remind you as you go" or implement the reminder system. Broken promises erode trust faster than no promise at all.

### 2.4 Onboarding — Budget Screen — Savings Coach (line 383)

**INTERACTION: "Tjommie will coach you toward saving R[x]/day"**
- Moment appropriateness: BORDERLINE — this appears while the user is still setting up, before they've committed
- Content quality: GENERIC — "coach you toward saving" is vague. What does coaching look like?
- Tone: OFF CHARACTER — refers to Tjommie in the third person ("Tjommie will coach you"). Tjommie should say "I'll" not "Tjommie will"
- User value: LOW — the daily breakdown is nice math but the coaching promise is empty
- Clippy risk: LOW
- Fix: Change to first person and be specific: "I'll check in each week to see how your saving is going. {fmtR(goal/30)}/day — that's doable." Only say this if the savings coaching actually exists.

### 2.5 Ready Screen — Post-onboarding (line 439)

**INTERACTION: "Right — every rand you spend on work this year, I'll track it. The tax year ends 28 Feb. Snap your slips as you go and let's find that money."**
- Moment appropriateness: RIGHT — this is the transition moment, user needs direction
- Content quality: GOOD — actionable, specific, time-aware
- Tone: ON CHARACTER — "Snap your slips as you go" is natural and South African
- User value: MEDIUM — tells them what to do but doesn't give a FIRST specific action
- Clippy risk: NONE
- Fix: **HIGH priority.** Per the CLAUDE.md requirements, this must actively direct the user with a choice: "Right [name], let's find your money. Want to start with your work expenses or set up your monthly budget first?" Currently it's a monologue, not a conversation starter. Add two tappable action buttons beneath the Tjommie message.

### 2.6 Home Screen — No Expenses State (line 511)

**INTERACTION: "No expenses logged yet. Every work slip you add grows your 13th Cheque. Tap + to start."**
- Moment appropriateness: RIGHT — empty state guidance is essential
- Content quality: GOOD — clear call to action
- Tone: ON CHARACTER — brief and direct
- User value: HIGH — tells them exactly what to do
- Clippy risk: LOW
- Fix: Minor — "Tap + to start" could be replaced with a direct tap-to-navigate action (which it has via `onTap`). Good. However, this message never changes. If the user comes back tomorrow with still no expenses, they see the same message. After 3 views, this becomes wallpaper. Add variants: "Still no expenses? Let's start with something easy — have you bought data or airtime this month for work?" / "Your 13th Cheque is at R0. One receipt changes that. What did you spend on work this week?"

### 2.7 Home Screen — Has Expenses State (line 512)

**INTERACTION: "Every R100 you claim saves you R[x] in tax. You've already found [cheque amount] this year."**
- Moment appropriateness: RIGHT — positive reinforcement when the user has been active
- Content quality: GOOD — uses real numbers, shows the multiplier effect
- Tone: ON CHARACTER — encouraging without being sycophantic
- User value: MEDIUM — informative but becomes repetitive since it's the same message every time
- Clippy risk: MEDIUM — this exact same message appears every single home screen load. After 5 visits, users will stop reading it. After 10, they'll actively resent it.
- Fix: **HIGH priority.** Rotate messages based on context:
  - If no expenses this week: "Nothing logged this week yet. Got any work receipts lying around?"
  - If new month: "New month, fresh start. Your 13th Cheque is at [amount] — let's keep it growing."
  - If near month end: "Month's almost done. Any work expenses you forgot to log?"
  - If cheque crossed a dream threshold: "Hey, your 13th Cheque just crossed [dream amount]. That's [dream item] money."
  - If tax year end approaching: "8 days left in the tax year. Every receipt counts now."

### 2.8 Home Screen — Zero Cheque with Expenses (line 512-513)

**INTERACTION: null (no Tjommie message when cheque is 0 but expenses exist)**
- Moment appropriateness: WRONG — this is a confusing state where the user has logged expenses but cheque is R0 (possible if only personal expenses exist)
- Content quality: N/A — no message
- Tone: N/A
- User value: NEGATIVE — the user may be confused about why their cheque isn't growing
- Clippy risk: N/A
- Fix: Add a message: "You've been logging personal expenses — nice. But those don't build your 13th Cheque. Tap here to add a work expense and watch the gold number grow."

### 2.9 Cheque Screen — Empty State (line 609)

**INTERACTION: "Nothing logged yet. Start with your phone contract — it's usually the biggest deduction most people miss."**
- Moment appropriateness: RIGHT — user is on the 13th Cheque screen specifically, they're thinking about tax
- Content quality: EXCELLENT — specific, actionable, genuinely useful advice
- Tone: ON CHARACTER — the phone contract suggestion is practical and South African
- User value: HIGH — gives a concrete first step
- Clippy risk: NONE
- Fix: None needed. This is the best proactive message in the app. Could add a tap action to pre-fill an expense with the phone category.

### 2.10 Cheque Screen — "Every extra R100" tip (line 607)

**INTERACTION: "Every extra R100 you claim adds R[marginal rate] to your 13th Cheque. What work expenses haven't you logged yet?"**
- Moment appropriateness: BORDERLINE — this appears even when the user has a healthy cheque and has logged everything
- Content quality: GOOD — the math is correct and personalised
- Tone: BORDERLINE — the question "What work expenses haven't you logged yet?" assumes they've forgotten something. After they've logged everything, this feels like nagging.
- User value: MEDIUM initially, LOW over time
- Clippy risk: MEDIUM — this is a static message that appears every time. If the user has diligently logged everything, being asked "what haven't you logged?" is patronising.
- Fix: Make conditional. If expenses were logged recently (within 7 days), show an encouraging message instead. If no expenses in 2+ weeks, then the prompt to log more is appropriate.

### 2.11 Spending Screen — Empty Personal State (line 752-753)

**INTERACTION: "No personal expenses this month yet. Log your everyday spending to see where your money goes."**
- Moment appropriateness: RIGHT — empty state on the spending screen
- Content quality: GENERIC — "log your everyday spending to see where your money goes" is what every finance app says
- Tone: BORDERLINE — slightly corporate, not Tjommie enough
- User value: MEDIUM — tells them to do something but not why it matters to them specifically
- Clippy risk: LOW
- Fix: Personalise: "No spending logged this month yet. Your budget gives you {fmtR(living)}/month after tax — let's see how you're doing. Tap here to log your first expense."

---

## 3. REACTIVE MESSAGES (CHAT) REVIEW

### 3.1 Chat Opening Message (line 787)

**INTERACTION: "Hey [name]! I know your numbers — [cheque amount] estimated so far, [days] days left. What do you want to know?"**
- Moment appropriateness: RIGHT — establishes context immediately
- Content quality: GOOD — shows Tjommie has context, uses real numbers
- Tone: ON CHARACTER — "I know your numbers" feels like a friend who's been paying attention
- User value: HIGH — sets up the conversation productively
- Clippy risk: NONE
- Fix: Minor — the opening message is identical every time the user opens chat. After the 5th time, "Hey [name]! I know your numbers" feels like a broken record. Add 3-4 variants and rotate, or make the message contextual: "Hey [name], I noticed you haven't logged anything this week — everything okay?" or "Hey [name], your 13th Cheque grew by [amount] this month. Nice work."

### 3.2 API Call Structure (line 797)

**INTERACTION: The actual Anthropic API call**
- Moment appropriateness: N/A — technical
- Content quality: CRITICAL FAILURE — the API call is missing the `x-api-key` header. It will return a 401 error every time. The entire Tjommie chat feature is non-functional.
- Tone: N/A
- User value: NEGATIVE — user tries to ask Tjommie a question and gets "Ag, something went wrong. Try again?" every time. This destroys trust.
- Clippy risk: HIGH — repeated failures train users that Tjommie is useless
- Fix: **CRITICAL.** Add proper authentication headers. If the API key cannot be exposed client-side (which it shouldn't be in production), implement a proxy pattern or clearly document this limitation for the prototype.

### 3.3 Error Handling (lines 799-800)

**INTERACTION: "Ag, something went wrong. Try again?" / "Connection problem — try again in a sec."**
- Moment appropriateness: RIGHT — error states need messages
- Content quality: GOOD — brief, on-voice
- Tone: ON CHARACTER — "Ag" is a great South African touch
- User value: LOW — "try again" is all the user can do, but it's honest
- Clippy risk: MEDIUM — if the API key is missing (as it is now), users will see this every time and learn Tjommie is broken
- Fix: Add a third attempt fallback: "I keep hitting a wall here. Can you check your connection, or try asking me something different?" Don't keep showing the same error.

### 3.4 Conversation Context Window (line 797)

**INTERACTION: Last 6 messages passed to API**
- Moment appropriateness: RIGHT — 6 messages is a reasonable mobile context window
- Content quality: GOOD — the filter includes both user and assistant messages
- Tone: N/A — technical
- User value: MEDIUM — sufficient for follow-up questions within a session
- Clippy risk: NONE
- Fix: The `.filter(m=>m.r==="u"||m.r==="a")` is fine. However, the initial greeting message (index 0) is always included in the history, taking up one slot. Consider excluding it or treating it separately.

---

## 4. QUICK QUESTIONS REVIEW

### Location: Line 792

**Current quick questions:**
1. "How do I claim more?"
2. "Am I on track?"
3. "What's my marginal rate?"
4. "What can a [employment type] claim?"

**INTERACTION: Quick question chips in chat**
- Moment appropriateness: RIGHT — shown only when chat first opens (msgs.length === 1)
- Content quality: GOOD — questions 1, 2, and 4 are genuinely useful
- Tone: ON CHARACTER — conversational phrasing, not robotic
- User value: MEDIUM — question 3 ("What's my marginal rate?") is already shown on-screen during onboarding and in the system prompt. Low incremental value.
- Clippy risk: LOW
- Fix (HIGH):
  1. Replace "What's my marginal rate?" with something more actionable: "What's the one thing I should log right now?" or "How much could I get back if I logged R500 more?"
  2. Personalise based on employment type — a freelancer should see "Can I claim my internet?" while a salaried employee should see "What can salaried people actually claim?"
  3. Add time-awareness — in February: "Is it too late to add expenses from last year?"
  4. Quick questions should change based on user state:
     - New user (0 expenses): "What should I log first?" / "How does this work?"
     - Active user (10+ expenses): "Am I missing any deductions?" / "How does my 13th Cheque compare?"
     - Tax year end: "What do I do with my tax summary?" / "Should I file myself or use a practitioner?"

---

## 5. NOTIFICATION STRATEGY REVIEW

**INTERACTION: Notification/reminder system**
- Status: **DOES NOT EXIST**
- Moment appropriateness: N/A
- Content quality: N/A
- Tone: N/A
- User value: NEGATIVE — Tjommie promises "I'll remind you" during onboarding (line 339) but no reminder infrastructure exists
- Clippy risk: N/A — you can't be Clippy if you never show up

**Assessment (HIGH):** The CLAUDE.md spec explicitly requires a reminder setup screen: "When should I remind you to log your expenses? Pick a day and time." This is completely missing. For a weekly expense tracking app, the absence of reminders means most users will forget to come back. Tjommie's value proposition depends on being present at the right moments — and the most important moment is when the user hasn't opened the app in a week.

**Required implementation:**
- A reminder setup prompt during or after onboarding (Tjommie asks, not a settings form)
- Day and time picker in Tjommie's voice: "I'll nudge you every [Wednesday at 7pm] to log your expenses. Sound good?"
- Notification content should be Tjommie-voiced, not system notifications: "Hey [name], got any work receipts from this week? Even one builds your 13th Cheque."
- Adaptive frequency: if user ignores 3 notifications, reduce to fortnightly. If they engage, keep weekly.
- No notification should fire during typical South African load shedding windows (though this is hard to implement in a prototype)

---

## 6. MISSING TJOMMIE MOMENTS

These are situations where Tjommie should speak but currently does not:

### 6.1 Post-Onboarding First Action (CRITICAL)

After the user taps "Start building my 13th Cheque" on the Ready screen, they arrive at the home screen with zero guidance. Tjommie should immediately appear with a choice: "Right [name], let's find your money. Want to start by adding a work expense, or should I show you what you can claim as a [occupation]?"

**Currently:** User lands on home screen, sees a static Tjommie tip about logging expenses. No conversation, no choice, no direction.

### 6.2 After First Expense — The Reward Moment (CRITICAL)

When a user logs their first work expense and sees "+R[x] to your 13th Cheque", this is the emotional peak of the entire app. Tjommie should celebrate this specifically: "That's your first one! R[x] already on its way back to you. What's next — got any more receipts?"

**Currently:** The confirmation screen shows the amount but Tjommie is completely absent from this moment.

### 6.3 Mid-Year Catch-Up (HIGH)

When a user installs the app mid-tax-year (which is most users, most of the time), Tjommie should ask: "Have you had work expenses earlier this year you haven't tracked yet? You can add past expenses — the tax year runs from March to February." This is explicitly required by CLAUDE.md item #10.

**Currently:** No mid-year catch-up prompt exists anywhere in the flow.

### 6.4 Career-Specific Deduction Suggestions (HIGH)

After the user enters their occupation during onboarding, Tjommie should surface a personalised list: "As a [occupation], you can probably claim these..." This is explicitly required by CLAUDE.md item #6.

**Currently:** The occupation field is captured but never used to generate suggestions.

### 6.5 Returning User Welcome (HIGH)

When a user returns to the app after days/weeks of absence, Tjommie should reference what they did last time: "Welcome back, [name]. Last time you logged [last expense category]. Your 13th Cheque is at [amount] — want to pick up where you left off?"

**Currently:** The home screen greeting is time-of-day based only. No memory of previous sessions.

### 6.6 Budget Overspend Alert (MEDIUM)

When a user's spending in any budget category exceeds the limit, Tjommie should react: "Heads up — you've gone over your groceries budget by R[x] this month. Want to see where you can cut back?"

**Currently:** The spending screen shows red bars for over-budget categories but Tjommie says nothing.

### 6.7 Tax Year Milestone Moments (MEDIUM)

At key points in the tax year (25% through, 50% through, 1 month left, 1 week left), Tjommie should have specific messages:
- "We're halfway through the tax year. Your 13th Cheque is at [amount]. If you keep this up, you could hit [projected amount]."
- "One week left! After 28 Feb, you can't add expenses from this tax year. Got anything left to log?"

**Currently:** Days-left is shown on screen but Tjommie never comments on milestones.

### 6.8 RA Contribution Prompt (MEDIUM)

Retirement Annuity contributions are the "biggest single tax deduction most South Africans miss" per CLAUDE.md item #12. Tjommie should prompt: "Quick question — do you contribute to a Retirement Annuity? It's the single biggest tax deduction most people miss."

**Currently:** RA is not mentioned anywhere in the app.

### 6.9 After Deleting an Expense (LOW)

When a user deletes an expense from history, Tjommie should briefly acknowledge: "Removed. Your 13th Cheque is now [updated amount]." This reassures the user that the totals are recalculated.

**Currently:** Expenses are deleted silently.

### 6.10 Settings Screen (LOW)

The settings screen is purely data display. Tjommie could add value: "Your income changed? Tap to update and I'll recalculate everything." Currently settings are read-only with no edit capability (separate issue but relevant to Tjommie's presence).

---

## 7. TONE CONSISTENCY ANALYSIS

### On Character:
- "Be honest — it can only help you" (line 267) -- excellent
- "Don't overthink this" (line 339) -- excellent
- "Snap your slips as you go" (line 439) -- natural and South African
- "Ag, something went wrong" (line 799) -- great South African touch
- "Every work slip you add grows your 13th Cheque" (line 511) -- clear and motivating

### Off Character:
- "Tjommie will coach you toward saving" (line 383) -- third person reference. Tjommie should always say "I".
- "SARS expects your employer to cover these" (line 282) -- corporate/legal voice, not Tjommie
- "No personal expenses this month yet. Log your everyday spending to see where your money goes." (line 753) -- generic finance app copy, could be from any app
- "based on typical deductions at your income" (line 317) -- passive, impersonal

### Tone Drift Risk Areas:
1. **System warnings vs Tjommie voice** — The salaried employee warnings (lines 280-284, 338) use a red warning box that doesn't feel like Tjommie. These should either be styled as Tjommie messages or clearly differentiated as system messages.
2. **Static tips vs dynamic conversation** — Every Tjommie message is a static string. Real friends vary their language. Even rotating between 2-3 variants would help.
3. **The gap between static Tjommie and chat Tjommie** — Static Tjommie is brief and direct. Chat Tjommie (powered by the API) may be more verbose or less South African depending on the model's output. The system prompt should include explicit examples of on-character vs off-character responses.
4. **Numbers without narrative** — Several Tjommie messages include numbers but don't tell the user how to feel about them. "You've already found R3,400 this year" — is that good? Bad? Average? Tjommie should contextualise: "You've already found R3,400 — that's better than most people at this point in the tax year."

---

## 8. CLIPPY RISK ASSESSMENT

### Highest Clippy Risk: Repetitive Home Screen Message

**Risk: HIGH**

The home screen Tjommie message (line 512) is the same every single visit: "Every R100 you claim saves you R[x] in tax. You've already found [amount] this year." By the 5th visit this is background noise. By the 10th, it's irritating. This is the #1 Clippy moment because it's the most-visited screen showing the same unchanging message.

### Second Highest: Broken Chat Creating "Learned Helplessness"

**Risk: HIGH**

Because the API key is missing, every chat attempt fails. Users will quickly learn that tapping on Tjommie produces nothing useful. This is worse than Clippy — it's a broken promise. Clippy at least answered (badly). Tjommie doesn't answer at all.

### Third Highest: Empty Promises About Reminders

**Risk: MEDIUM**

Tjommie says "I'll remind you" but never does. Users who trusted this promise and then forgot to log expenses for 3 months will feel betrayed when they realise Tjommie didn't follow through.

### Fourth: Static "What haven't you logged?" on Cheque Screen

**Risk: MEDIUM**

The prompt "What work expenses haven't you logged yet?" (line 607) assumes the user has forgotten something. A diligent user who has logged everything will find this patronising. This is exactly the Clippy pattern: assuming the user needs help when they don't.

---

## ISSUE SUMMARY

### CRITICAL (2)
1. **Chat API authentication missing** — No `x-api-key` header in the Anthropic API call. Tjommie chat is completely non-functional.
2. **Post-onboarding direction missing** — After setup, no active choice is given to the user. Tjommie should offer two clear paths, not silence.

### HIGH (5)
3. **Home screen Tjommie message is static** — Same message every visit. Needs contextual rotation to prevent Clippy effect.
4. **No career-specific deduction suggestions** — Occupation is captured but never used for personalised deduction prompts.
5. **No mid-year catch-up prompt** — Users who install mid-year get no prompt to backfill expenses.
6. **No notification/reminder system** — Explicitly required by spec, completely absent. Tjommie promises reminders he can't deliver.
7. **No first-expense reward moment from Tjommie** — The most emotionally important moment in the app has no Tjommie presence.

### MEDIUM (7)
8. **System prompt missing budget/spending data** — Tjommie can't answer budget questions.
9. **System prompt missing occupation-specific deduction intelligence** — Tjommie can't make career-specific suggestions without this data.
10. **No conversation memory across sessions** — Tjommie forgets everything between sessions.
11. **Quick questions not personalised by state/time** — Same 4 questions regardless of user journey stage.
12. **No tax year milestone messages** — Key moments (50%, 1 month left, 1 week left) go unmarked.
13. **No budget overspend alerts** — Tjommie doesn't react to over-budget spending.
14. **Third-person reference** — "Tjommie will coach you" should be "I'll coach you."

### LOW (4)
15. **No RA contribution prompt** — Biggest deduction for most users, never mentioned.
16. **No post-delete confirmation from Tjommie** — Expenses deleted silently.
17. **Chat opening message never varies** — Same greeting every session.
18. **Error handling doesn't adapt after repeated failures** — Same error message on every attempt.

---

## FINAL SECTIONS

### HIGHEST CLIPPY RISK MOMENTS
1. **Home screen static Tjommie message** — identical text every visit, most-visited screen
2. **Broken chat producing "Ag, something went wrong" every time** — trains users that Tjommie is useless
3. **"What work expenses haven't you logged yet?"** on Cheque screen — patronising to diligent users
4. **"I'll remind you"** promise with no reminder system — broken promise

### MISSING TJOMMIE MOMENTS
1. Post-onboarding active direction with choice (CRITICAL — required by spec)
2. First work expense celebration/reward moment (CRITICAL — emotional core of app)
3. Mid-year catch-up prompt (HIGH — required by spec)
4. Career-specific deduction suggestions (HIGH — required by spec)
5. Returning user contextual welcome (HIGH)
6. Budget overspend reactions (MEDIUM)
7. Tax year milestones (MEDIUM)
8. RA contribution prompt (MEDIUM — required by spec)
9. Post-delete confirmation (LOW)

### SYSTEM PROMPT GAPS
1. No API authentication headers (CRITICAL — chat is broken)
2. No occupation-specific deduction data
3. No budget/spending context
4. No category-level expense breakdown
5. No conversation memory from previous sessions
6. No seasonal/time-of-year behaviour guidance
7. No explicit on-character/off-character examples for tone consistency
8. No instruction to keep answers mobile-length with offer to elaborate

### TONE DRIFT RISKS
1. Third-person Tjommie references ("Tjommie will coach you")
2. System warnings using corporate voice instead of Tjommie voice
3. Generic finance-app copy on the spending screen
4. Gap between static Tjommie (hardcoded strings) and chat Tjommie (LLM-generated) — no examples in system prompt to anchor the voice
5. Numbers without emotional context — Tjommie reports data but doesn't tell users how to feel about it

---

*End of AI Integration Specialist Report — Iteration 1*
