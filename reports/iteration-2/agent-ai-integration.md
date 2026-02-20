# AI Integration Specialist Agent Report
**Iteration 2 — The 13th Cheque App**
**Generated:** 2026-02-20
**Reviewed by:** AI Integration Specialist Agent

---

## Executive Summary

Tjommie is **mostly good, occasionally great, and sometimes Clippy**. The character is well-defined, the system prompt is solid, and the contextual home message is a clear win. But there are critical moments where Tjommie speaks when he shouldn't, repeats himself when ignored, and fires generically when specificity is the whole point.

**The core issue:** Tjommie is trying to be helpful everywhere instead of being invaluable at the right moments.

**What's working:**
- System prompt is comprehensive, SARS-accurate, and character-appropriate
- Contextual home message (getTjommieHomeMsg) adapts to user state
- Quick questions are employment-type aware
- Tone is consistently South African and warm

**What's broken:**
- Proactive messages lack proper firing triggers (no "seen/dismissed" state)
- Generic fallback messages appear when specific context exists
- No silence strategy — Tjommie speaks on almost every screen
- Celebration messages for actions that aren't achievements
- System prompt gives user data but doesn't pass conversation history context

---

## Detailed Review — Every Tjommie Touchpoint

### 1. SYSTEM PROMPT (Line 2648-2671)

**INTERACTION:** Core AI instruction set for Tjommie chat
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** NONE
**Fix:** Minor improvements

**Analysis:**
The system prompt is strong. It correctly:
- Passes all relevant user financial data
- Encodes SARS 2025/26 rules accurately
- Establishes clear character boundaries ("warm South African friend")
- Sets length constraints appropriate for mobile
- Defines escalation rules ("recommend a tax practitioner for complex situations")
- Handles the Section 23(m) employment type fork prominently

**Gaps identified:**
1. **No conversation history context:** The prompt says "be specific to the user's real numbers" but doesn't tell the model "you're stateless — each conversation is fresh." This means Tjommie might reference things he shouldn't remember.
2. **Missing career context:** The system prompt knows occupation but doesn't pass the matched career profile or suggested deductions. This means Tjommie can't say "As a teacher, you probably already know about reference books..."
3. **No refund breakdown context:** The prompt gives the total refund estimate but not the breakdown (work expenses vs RA vs medical credits). Tjommie can't say "Most of your R8,500 refund is coming from your RA — have you maxed that out?"
4. **Missing temporal context:** No info about when the user last logged expenses or what their current streak is. Tjommie can't say "You've logged 3 weeks in a row — that's the habit that builds the 13th Cheque."

**Recommendation:**
Add these lines to system prompt:
```
- Career profile: ${CAREER_PROFILES[matchCareer(data.occupation)]?.label || "General"}
- Suggested deduction categories: ${CAREER_PROFILES[matchCareer(data.occupation)]?.deductions.join(", ") || "none"}
- Refund breakdown: Work expenses saving R${refundData.taxSaved}, RA saving R${refundData.raSaving}, Medical credits R${refundData.medCredits}
- Last expense logged: ${data.lastLogDate ? fmtDateFull(data.lastLogDate) : "never"}
- Current logging streak: ${data.streakDays || 0} days
- Total expenses logged: ${data.totalExpensesLogged || 0}

Important: You are stateless. Each conversation is independent — do not reference previous chats unless the user brings them up.
```

---

### 2. HOME SCREEN MESSAGE (getTjommieHomeMsg, Line 650-701)

**INTERACTION:** Contextual Tjommie message on home screen
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** LOW
**Fix:** Add dismissed state tracking

**Analysis:**
This is **the best Tjommie moment in the app**. The function elegantly branches based on user state:
- First-time user: "let's find your money" with clear action choices
- First expense logged: celebrates the milestone with specific numbers
- Active streak: acknowledges the habit formation
- Returning user: references actual progress with real numbers

The messages are:
- Specific (uses user's name, actual refund amounts, days logged)
- Actionable (every message has clear next steps)
- Variable (doesn't repeat the same message)
- Honest (uses "roughly" and "estimate" correctly)

**The problem:**
No dismissed/seen tracking. If the user ignores Tjommie's suggestion to "Add work expense," the same message fires on every home screen visit. After 3 ignores, this becomes Clippy.

**Recommendation:**
Add a `dismissedHomeMsg` field to track the last message shown and when. If the user navigates away without acting on the message, don't show the same one again for 24 hours. Show a different branch or go silent.

```javascript
// Add to data structure:
dismissedHomeMsgs: {}, // { msgKey: timestamp }

// In getTjommieHomeMsg:
const lastShown = data.dismissedHomeMsgs?.['first-expense-prompt'];
if (lastShown && Date.now() - lastShown < 86400000) {
  // User saw this within 24h and didn't act — show something else or go silent
}
```

---

### 3. ONBOARDING: STEP 1 — EMPLOYMENT TYPE (Line 858)

**INTERACTION:** `<Tjommie compact msg="Hey, I'm Tjommie. This first question matters most — be honest, it can only help you." />`
**Moment appropriateness:** RIGHT
**Content quality:** GOOD
**Tone:** ON CHARACTER
**User value:** MEDIUM
**Clippy risk:** LOW
**Fix:** Make it specific to what "matters" means

**Analysis:**
Good: Introduces Tjommie early, establishes trust ("be honest"), hints at the stakes.

Weak: "This matters most" is vague. The user doesn't know *why* it matters yet.

**Better version:**
"Hey, I'm Tjommie. This answer changes what SARS will let you claim — salaried vs commission makes a big difference."

---

### 4. ONBOARDING: STEP 4 — CAREER SUGGESTIONS (Line 1063-1066)

**INTERACTION:** Career-aware deduction suggestions with personalised tip
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** NONE
**Fix:** None needed

**Analysis:**
This is **the second-best Tjommie moment**. The message:
- Uses the user's actual occupation
- References career-matched deductions
- Gives a specific, actionable tip ("Stationery and reference books for your subject are the easiest wins")
- Appears at the perfect moment (right before showing the category list)

**Why this works:**
It makes the user feel *seen*. The app isn't showing a generic list — it knows you're a teacher, and it knows what teachers claim.

**No changes needed.** This is Tjommie at his best.

---

### 5. ONBOARDING: STEP 7 — REMINDER SETUP (Line 1491)

**INTERACTION:** `<Tjommie compact msg="When should I nudge you to log your expenses, ${firstName}? Once a week is all it takes." />`
**Moment appropriateness:** RIGHT
**Content quality:** GOOD
**Tone:** ON CHARACTER
**User value:** MEDIUM
**Clippy risk:** LOW
**Fix:** Add frequency reassurance

**Analysis:**
Good: Asks permission, uses "nudge" (friendly, not naggy), sets expectations ("once a week").

Weak: Doesn't address the fear that this will become spam.

**Better version:**
"When should I nudge you to log your expenses, ${firstName}? Once a week — and if you ignore me 3 times, I'll back off."

---

### 6. ONBOARDING: STEP 7 — MID-YEAR CATCH-UP (Line 1543-1544)

**INTERACTION:** Tjommie asks about past expenses if tax year is >10% complete
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** NONE
**Fix:** None needed

**Analysis:**
Perfect. The message:
- Only fires if relevant (>10% into tax year)
- Uses specific numbers ("The tax year is 47% done")
- Explains the rule ("March to February")
- Gives a clear yes/no choice
- Doesn't force the action

**No changes needed.** This is proactive AI done right.

---

### 7. ONBOARDING: STEP 8 — SETUP COMPLETE (Line 1690)

**INTERACTION:** `<Tjommie msg="Right ${firstName} — every work expense you add from now on grows that gold number. The tax year ends 28 Feb. Let's find your money." />`
**Moment appropriateness:** RIGHT
**Content quality:** GOOD
**Tone:** ON CHARACTER
**User value:** MEDIUM
**Clippy risk:** LOW
**Fix:** Make it more celebratory, less instructional

**Analysis:**
This is the setup complete screen — the user just finished 8 steps. They know what to do. The message should celebrate the milestone, not re-explain the concept.

**Current tone:** Instructional ("every work expense you add grows that gold number")
**Better tone:** Celebratory ("You're set, ${firstName}. Your 13th Cheque starts now.")

**Better version:**
"You're set, ${firstName}. Your 13th Cheque starts now. Add your first work expense and watch that gold number grow."

---

### 8. ADD EXPENSE SUCCESS — FIRST EXPENSE (Line 2297)

**INTERACTION:** `<Tjommie compact msg="Your first work expense! That's ${fmtR(chequeAdd)} back from SARS already. This is how the 13th Cheque grows." />`
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** NONE
**Fix:** None needed

**Analysis:**
Perfect celebration. The message:
- Acknowledges the milestone (first expense)
- Uses specific numbers (actual tax saving)
- Explains the mechanism ("this is how the 13th Cheque grows")
- Appears exactly once (only fires on first expense)

**No changes needed.** This is the emotional core of the app working correctly.

---

### 9. 13TH CHEQUE SCREEN — ZERO EXPENSES (Line 2177)

**INTERACTION:** `<Tjommie msg="Nothing logged yet. Start with your phone contract — it's usually the easiest deduction most people miss." />`
**Moment appropriateness:** RIGHT
**Content quality:** EXCELLENT
**Tone:** ON CHARACTER
**User value:** HIGH
**Clippy risk:** NONE
**Fix:** None needed

**Analysis:**
This is exactly right. The message:
- States the obvious ("nothing logged yet") without judgment
- Gives a specific, actionable suggestion (phone contract)
- Explains why (easiest + commonly missed)
- Only fires when the empty state is real

**No changes needed.** This is proactive guidance at the right moment.

---

### 10. SPENDING SCREEN — NO PERSONAL EXPENSES (Line 2630-2631)

**INTERACTION:** `<Tjommie compact msg="No personal expenses this month yet. Log your everyday spending to see where your money goes." actions={[{ label: "Add expense", onClick: () => go("add", "personal") }]} />`
**Moment appropriateness:** BORDERLINE
**Content quality:** GENERIC
**Tone:** ON CHARACTER
**User value:** LOW
**Clippy risk:** MEDIUM
**Fix:** Make conditional on whether user has a budget set

**Analysis:**
This message fires on the Spending screen when the user has no personal expenses logged this month.

**The problem:**
If the user hasn't set up a budget (which is optional), this message is pushing them toward an action that doesn't have much value. "See where your money goes" only matters if you have budget limits to track against.

**Why this is borderline Clippy:**
The user came to the Spending screen to see... spending. If there's nothing here, the screen itself communicates that. Tjommie repeating "nothing here yet" is redundant.

**Better strategy:**
Only show Tjommie here if:
1. The user has a budget set up (budget categories with amounts > 0), OR
2. They're overspending vs their income

If neither condition is true, go silent. The empty state speaks for itself.

**Better version (conditional):**
```javascript
{thisM.filter(e => e.type === "personal").length === 0 &&
 Object.values(budget).some(c => c.amount > 0) && (
  <Tjommie compact msg="You've set a budget but haven't logged any spending yet. Track a few expenses to see if you're on track."
    actions={[{ label: "Add expense", onClick: () => go("add", "personal") }]} />
)}
```

---

### 11. QUICK QUESTIONS (Line 2684-2689)

**INTERACTION:** Pre-populated quick questions in Tjommie chat
**Moment appropriateness:** RIGHT
**Content quality:** GOOD
**Tone:** ON CHARACTER
**User value:** MEDIUM
**Clippy risk:** LOW
**Fix:** Make them more context-aware

**Analysis:**
The quick questions are employment-type aware (`What can a ${data.empType || "salaried"} employee claim?`), which is good.

**What's missing:**
The questions don't adapt to the user's actual situation. They're generic conversation starters, not specific prompts.

**Current questions:**
- "How do I claim more?"
- "Am I on track?"
- "What can a salaried employee claim?"
- "Tell me about RA deductions"

**Better questions (contextual):**
- If user has RA contributions: "Can I increase my RA to get a bigger refund?"
- If user is a teacher: "What can teachers claim that most don't know about?"
- If refund is low (<R3000): "Why is my refund so small?"
- If nearing deadline: "Do I have time to add past expenses before 28 Feb?"
- If salaried with <50% commission: "Why can't I claim travel as a salaried employee?"

**Recommendation:**
Generate quick questions dynamically based on:
- Employment type
- Occupation
- Current refund amount
- Days left in tax year
- Whether RA/medical aid is set up

---

### 12. REACTIVE CHAT — GENERAL

**INTERACTION:** User asks Tjommie a question, gets AI response
**Moment appropriateness:** RIGHT
**Content quality:** DEPENDENT ON AI
**Tone:** ON CHARACTER (based on system prompt)
**User value:** HIGH (if accurate)
**Clippy risk:** LOW (user-initiated)
**Fix:** Add response quality testing

**Analysis:**
The reactive chat is **user-initiated**, which means Clippy risk is inherently low — the user asked for this.

**Key strength:**
The system prompt sets up Tjommie to be:
- Specific to user's numbers
- Brief (max 400 tokens)
- Honest about uncertainty
- Quick to escalate complex questions to a tax practitioner

**Remaining risk:**
The system prompt is good, but we can't see the actual responses without testing. The SARS Agent should verify tax accuracy. This agent is concerned with:
1. **Length:** Are responses actually mobile-appropriate, or are they walls of text?
2. **Specificity:** Is Tjommie using the user's real numbers, or giving generic advice?
3. **Escalation:** Is Tjommie correctly admitting when he doesn't know?

**Recommendation for testing:**
Test these scenarios and verify response quality:
- User asks: "Can I claim my home office?" (Answer must depend on empType + commissionPct)
- User asks: "How much more can I contribute to my RA?" (Answer must use actual income + current contribution)
- User asks: "Can I claim my gym membership?" (Answer should be "No, not as a work expense — that's personal")
- User asks: "What if I worked from home 3 days a week?" (Answer should escalate: "This gets complex — worth asking a tax practitioner about the 50% rule")

---

## MISSING TJOMMIE MOMENTS

Places where Tjommie should speak but currently doesn't:

### 1. **After 3+ ignored home messages**
**Situation:** User sees the same Tjommie home message 3 times and never acts on it.
**Tjommie should:** Go silent or show a different message. Currently, he repeats forever.
**Suggested message (on 4th visit):** "No pressure, ${firstName}. I'll be here when you're ready. Tap 'Add expense' when you've got a receipt to log."

---

### 2. **When user logs an expense outside the tax year**
**Situation:** User adds an expense dated before 1 March or after 28 Feb of the current tax year.
**Tjommie should:** Acknowledge it won't count, but offer to adjust the date.
**Current state:** Red warning box appears (line 2476-2485), but no Tjommie.
**Suggested addition:** After the warning, add:
```javascript
<Tjommie compact msg="That date falls outside this tax year, ${firstName}. Want me to change it to today's date so it counts towards your refund?"
  actions={[
    { label: "Yes, use today", onClick: () => setDate(todayStr()) },
    { label: "No, keep it", onClick: null },
  ]} />
```

---

### 3. **When user's refund drops below previous visit**
**Situation:** User deletes expenses or changes their income, and their 13th Cheque estimate goes down.
**Tjommie should:** Acknowledge the change without judgment, explain why.
**Current state:** The number just changes. No context.
**Suggested approach:** Track `lastKnownRefund` in data. If new refund < last by >R500, show a home message:
"Your 13th Cheque dropped to ${fmtR(newRefund)}, ${firstName}. Did you delete some expenses or change your income? Just checking in."

---

### 4. **When user reaches a refund milestone**
**Situation:** User crosses R5,000 / R10,000 / R20,000 refund thresholds.
**Tjommie should:** Celebrate the milestone with context (what that money could buy).
**Current state:** The DREAMS array exists (line 272-284) but is only used on the Cheque screen, not as a proactive trigger.
**Suggested approach:** When refund crosses a major threshold, show a one-time celebration message:
"${firstName}, you just crossed R10,000! That's a proper holiday you're building. Keep going — you've got ${daysLeft()} days to push it higher."

---

### 5. **When tax year has <30 days remaining and refund is low**
**Situation:** It's late January or February, user has <R3000 refund, and there's still time to act.
**Tjommie should:** Create urgency without panic. Suggest high-value actions.
**Current state:** Home message shows days left, but doesn't adapt tone/urgency as deadline approaches.
**Suggested message:**
"${firstName}, you've got ${daysLeft()} days left and your refund is at ${fmtR(refund)}. That's low for your income level. Have you claimed your phone, internet, and professional fees? Those add up fast."

---

### 6. **When user has a high income but low refund**
**Situation:** User earns R40k+/month but refund is <R5000.
**Tjommie should:** Ask if they've missed major deductions (RA, medical aid).
**Current state:** No proactive check.
**Suggested home message condition:**
```javascript
if (annual > 480000 && refundData.refund < 5000 && !data.raContribMonthly) {
  return {
    msg: `${firstName}, you're in the 39% tax bracket but your refund is only ${fmtR(refundData.refund)}. Have you considered an RA? Even R2,000/month would save you R9,000 in tax.`,
    actions: [
      { label: "Tell me more", screen: "tjommie" },
      { label: "Not now", screen: null },
    ],
  };
}
```

---

## SYSTEM PROMPT GAPS

What Tjommie needs to know that he currently doesn't:

1. **Career profile context**
   Currently knows: Occupation string ("teacher")
   Should know: Matched career profile, suggested deductions, career-specific tip

2. **Refund breakdown**
   Currently knows: Total refund (R12,500)
   Should know: How much is work expenses (R4,200) vs RA (R6,800) vs medical (R1,500)

3. **User behaviour patterns**
   Currently knows: Nothing about engagement
   Should know: Last log date, streak, total expenses logged, average expense value

4. **Conversation history disclaimer**
   Currently: Might assume continuity across sessions
   Should know: "You are stateless. Each conversation is independent."

5. **Budget context**
   Currently knows: Nothing about the user's budget
   Should know: Whether budget is set up, if user is overspending, what their savings goal is

6. **Ignored suggestions tracking**
   Currently knows: Nothing about what the user has dismissed
   Should know: "User was shown RA suggestion 3 times and never clicked — don't push it again"

---

## TONE DRIFT RISKS

Places where Tjommie's character could slip:

### 1. **Generic fallback responses**
**Risk location:** Any Tjommie message that doesn't use the user's actual name, numbers, or context.
**Example:** "Log your expenses to see your refund grow" (generic) vs "Log your phone bill, ${firstName} — that's usually R350-500/month, which is R140-200 back at your 41% rate" (specific)
**Mitigation:** Every Tjommie message should have access to firstName, income, marginalRate, refund, and empType as minimum context.

---

### 2. **Corporate language creeping in**
**Risk location:** System prompt compliance in edge cases.
**Example:** If the AI falls back to formal language ("Please consult a tax professional") instead of Tjommie's voice ("Worth chatting to a tax practitioner about this one")
**Mitigation:** Add to system prompt: "Never use corporate phrases like 'Please note', 'Kindly', 'For your information'. You're a friend, not a bank."

---

### 3. **Over-celebration**
**Risk location:** Any time Tjommie celebrates something that isn't actually an achievement.
**Example:** "Great job opening the app!" (Clippy) vs "Nice one, ${firstName}. That first expense is already saving you R340" (earned celebration)
**Mitigation:** Only celebrate:
  - First expense logged (milestone)
  - Streak milestones (3 days, 7 days, 14 days)
  - Refund threshold crossings (R5k, R10k, R20k)
  - Setup completion (earned after 8 steps)

---

### 4. **Repeating information the screen already shows**
**Risk location:** Any proactive Tjommie message on a screen with clear visual information.
**Example:** On the 13th Cheque screen, Tjommie saying "Your refund is R8,500" when there's a giant gold R8,500 number right there.
**Mitigation:** Tjommie should **add context**, not **repeat content**. Good: "Your refund is at R8,500, ${firstName} — R3,200 of that is your RA tax saving." (This adds info the breakdown section shows but the user might not notice.)

---

### 5. **Hedging to the point of uselessness**
**Risk location:** Reactive chat responses on SARS rule questions.
**Example:** "It depends on many factors..." (useless hedge) vs "At your income and employment type, you can claim up to R2,000/month for [specific category]" (specific answer with context)
**Mitigation:** System prompt should say: "Give specific answers using the user's actual numbers. If there's genuine complexity, say 'This one's complex because [reason] — worth asking a tax practitioner.' Don't give vague non-answers."

---

## HIGHEST CLIPPY RISK MOMENTS

**CRITICAL RISK:** Home screen Tjommie message repeating infinitely
**Why this is Clippy:** User sees "Want to start with your work expenses or set up your monthly budget first?" on every single home screen visit. After the 3rd time, the user learns to ignore Tjommie entirely.
**Fix:** Implement dismissal tracking. Show each home message once, then wait 24-48 hours before showing a different message or going silent.

---

**HIGH RISK:** Spending screen Tjommie on empty state
**Why this is Clippy:** The screen already communicates "no expenses logged" through empty state. Tjommie saying "No personal expenses this month yet" is redundant noise.
**Fix:** Only show Tjommie here if the user has a budget set up OR is overspending. Otherwise, silence is better.

---

**MEDIUM RISK:** Quick questions not adapting to context
**Why this is Clippy:** The questions are generic conversation starters when they could be specific prompts based on the user's actual situation.
**Fix:** Generate quick questions dynamically based on user state (employment type, refund size, RA status, days remaining).

---

**MEDIUM RISK:** Celebration creep
**Why this is Clippy:** The first expense celebration is perfect. If we start celebrating "You opened the app!" or "You viewed your 13th Cheque!", we become Clippy.
**Fix:** Only celebrate genuine milestones: first expense, streaks, refund thresholds, setup completion. Nothing else.

---

**LOW RISK:** System prompt not passing enough context
**Why this could become Clippy:** If Tjommie gives generic advice because he doesn't have the user's career profile or refund breakdown, users will learn his responses aren't valuable.
**Fix:** Enrich system prompt with career profile, refund breakdown, behaviour patterns, budget status.

---

## FINAL ASSESSMENT

**Tjommie's strongest moments:**
1. Career-aware deduction suggestions (Step 4 onboarding)
2. First expense celebration (specific, earned, emotional)
3. Mid-year catch-up prompt (only fires when relevant)
4. Contextual home messages (adapt to user state)
5. Zero-expense nudge on Cheque screen (specific actionable suggestion)

**Tjommie's weakest moments:**
1. Home message repeating infinitely (no dismissal tracking)
2. Spending screen empty state message (redundant)
3. Generic quick questions (not context-aware)
4. System prompt missing key context (career, refund breakdown, behaviour)
5. No silence strategy (Tjommie speaks on almost every screen)

**Overall character consistency:** STRONG
Tjommie sounds like Tjommie across all touchpoints. The tone is warm, South African, direct, and brief.

**Overall user value:** MEDIUM-HIGH
When Tjommie speaks at the right moment with specific context, he's invaluable. When he repeats himself or states the obvious, he's noise.

**Clippy risk level:** MEDIUM
The app is 2-3 repetitions away from training users to ignore Tjommie. The home message infinite loop and empty state redundancy are the critical risks.

**Recommended priority fixes:**
1. **CRITICAL:** Add dismissal tracking to home messages (prevent infinite repetition)
2. **HIGH:** Make spending screen Tjommie conditional (only show if budget exists)
3. **HIGH:** Enrich system prompt with career profile + refund breakdown
4. **MEDIUM:** Generate contextual quick questions dynamically
5. **MEDIUM:** Add missing Tjommie moments (out-of-year date, refund milestones, deadline urgency)
6. **LOW:** Add conversation history disclaimer to system prompt

---

## Conclusion

Tjommie has a strong foundation. The character is right, the system prompt is solid, and the best moments are genuinely delightful. The fixes needed are surgical, not systemic:

**Do this:**
- Add dismissed message tracking
- Make proactive messages conditional on real need
- Enrich system prompt context
- Shut up when the screen speaks for itself

**Don't do this:**
- Add more Tjommie messages for the sake of "engagement"
- Celebrate non-achievements
- Repeat what the screen already shows
- Generic messages when specific data is available

The difference between helpful and Clippy is knowing when NOT to speak. Tjommie needs to learn that.
