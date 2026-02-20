# Notification & Habit Design Agent Report
## Iteration 1 — 13th Cheque v2 Review

**Date**: 20 February 2026
**Agent**: Notification & Habit Design Specialist
**File reviewed**: `thirteenth-cheque-v2.jsx`
**Verdict**: CRITICAL gaps in notification strategy, habit loops, and retention mechanics

---

## Executive Summary

The current build has **zero notification infrastructure**. No reminder system exists. No permission moment is designed. No weekly, monthly, or event-based notifications are implemented or even scaffolded. The app has no mechanism to bring users back after they close it. This is the single largest threat to long-term engagement and, consequently, to users actually building their 13th Cheque over a full tax year.

The app also has almost no habit mechanics: no streaks, no progress milestones, no sharing, no monthly review events, and no seasonal urgency system. The only positive engagement signal is the animated gold number on expense entry, which is good but not enough to sustain a 12-month habit on its own.

From a notification perspective, this is a blank canvas. That is actually better than a bad notification strategy, but it needs to be filled urgently.

---

## Part 1: Notification Inventory

### Current State: NOTHING

There are zero notifications in the codebase. No:
- Push notification setup or permission request
- Reminder scheduling (weekly or otherwise)
- Notification copy or templates
- Event-triggered notifications (budget limit, milestone, deadline)
- Notification settings or customisation screen
- Any reference to the Web Notifications API, service workers, or any notification mechanism

**Severity: CRITICAL**

The CLAUDE.md spec explicitly requires: "Add a screen (or Tjommie prompt) to set a weekly reminder day and time." This is entirely missing.

---

## Part 2: Evaluating Needed Notifications

Since no notifications exist, I will evaluate the notifications that SHOULD exist, rate them by the five-criteria test from the SKILL.md, and provide specific implementation guidance.

---

### NOTIFICATION 1: Weekly Expense Logging Reminder

**Message (ideal)**: "Hey [name], it's [day]. Got any work expenses from this week? Even a R50 data top-up adds R[marginal] to your 13th Cheque."

- **Value score**: HIGH
- **Timing**: APPROPRIATE (user-chosen day and time; default suggestion: Sunday evening 18:00)
- **Specificity**: PERSONALISED (uses name, marginal rate, references their actual deduction categories)
- **Trust account impact**: DEPOSIT (reminds them of money they would otherwise lose)
- **South African fit**: GOOD (Sunday evening is post-weekend, pre-Monday; avoids load shedding peak hours in most schedules)
- **Fix**: Must be built from scratch. Add a reminder setup screen during onboarding (Step 4.5 or post-setup Tjommie prompt). Use the Notifications API or, for this prototype, an in-app reminder system with a visible "Reminder set: Sundays at 18:00" indicator.

**Five-criteria test:**
1. User cannot get this information another way right now: PASS (they will forget without a nudge)
2. Timing is right: PASS (user chooses their own time)
3. Specific to this user: PASS (includes their marginal rate and name)
4. Something they can do right now: PASS (tap to log an expense)
5. Missing it would make them worse off: PASS (unclaimed expenses = lost refund)

---

### NOTIFICATION 2: Weekly Summary (Monday Morning)

**Message (ideal)**: "Last week you added R[amount] to your 13th Cheque. You're at R[total] with [days] days left."

- **Value score**: HIGH
- **Timing**: APPROPRIATE (Monday 08:00; start of week, motivating context)
- **Specificity**: PERSONALISED (real numbers from their actual data)
- **Trust account impact**: DEPOSIT (celebrates real progress without being fake)
- **South African fit**: GOOD (Monday commute time; short enough to read on a taxi or in traffic)
- **Fix**: Build. Only send if user logged at least one expense the previous week. If they logged nothing, DO NOT send "You didn't log anything" -- that is shaming. Instead, skip the notification entirely or send: "New week, [name]. Your 13th Cheque is at R[total]. Got any slips from last week?"

**IMPORTANT**: If the user logged nothing for two consecutive weeks, reduce frequency to fortnightly. If nothing for a month, stop entirely and switch to the re-engagement strategy (see below).

---

### NOTIFICATION 3: Work Expense Reward Confirmation (In-App)

**Message (current partial implementation)**: The app shows "+R[amount] to your 13th Cheque" after saving a work expense.

- **Value score**: HIGH
- **Timing**: APPROPRIATE (immediate, after the action)
- **Specificity**: PERSONALISED (uses their exact marginal rate calculation)
- **Trust account impact**: DEPOSIT (this is the reward moment)
- **South African fit**: GOOD
- **Fix**: This exists partially (the "Logged!" confirmation screen) but needs enhancement:
  - Add a more satisfying animation (the gold number should pulse/glow, not just appear)
  - Add a running total context: "Your 13th Cheque is now R[total]. That's [dream item] territory."
  - Add a share button: "Tell a friend about the 13th Cheque" -- social accountability AND viral growth

---

### NOTIFICATION 4: Monthly Budget Close (1st of Month)

**Message (ideal)**: "[name], January is done. You spent R[amount] of your R[budget] budget. Your 13th Cheque grew by R[monthly_work_amount]. Here's your February budget."

- **Value score**: HIGH
- **Timing**: APPROPRIATE (1st of month, morning)
- **Specificity**: PERSONALISED (real budget and refund numbers)
- **Trust account impact**: DEPOSIT (monthly review is a natural financial moment)
- **South African fit**: GOOD (month-end/payday cycle is deeply ingrained in SA financial life)
- **Fix**: Build a monthly review screen or modal that Tjommie triggers on first open after the 1st. This should feel like an event, not just a screen. Show: budget summary, 13th Cheque growth, progress toward annual estimate, and set the tone for the new month.

---

### NOTIFICATION 5: Budget Limit Warning (Event-Triggered)

**Message (ideal)**: "[name], you're at 80% of your [category] budget (R[spent] of R[limit]). R[remaining] left for the rest of the month."

- **Value score**: MEDIUM
- **Timing**: REVIEW NEEDED (should fire when 80% threshold is crossed, but only once per category per month; time of day should be evening)
- **Specificity**: PERSONALISED (specific category and amounts)
- **Trust account impact**: NEUTRAL to DEPOSIT (helpful if specific and actionable; harmful if vague or anxiety-inducing)
- **South African fit**: NEEDS ADJUSTMENT (avoid sending during load shedding schedules; keep message discreet for shared devices: "Budget update" not "You're overspending on takeaways")
- **Fix**: Build with conservative defaults. Only fire at 80% threshold, not 50% or 90%. Never fire more than once per category per month. Preview subject line should be discreet: "Budget update from Tjommie" not "You've almost blown your groceries budget."

---

### NOTIFICATION 6: Tax Year Deadline Countdown (Final 60 Days)

**Message (ideal, at 60 days)**: "[name], 60 days left in the tax year. Your 13th Cheque is at R[total]. Let's make the most of what's left."

**Message (ideal, at 7 days)**: "One week to go. Your 13th Cheque: R[total]. Any last work expenses to log before 28 Feb?"

- **Value score**: HIGH
- **Timing**: APPROPRIATE (genuine urgency; these are rare and seasonal)
- **Specificity**: PERSONALISED (real refund number)
- **Trust account impact**: DEPOSIT (time-sensitive, actionable, genuinely helpful)
- **South African fit**: GOOD (28 Feb deadline is universally understood in SA)
- **Fix**: Build a countdown notification series: 60 days, 30 days, 14 days, 7 days, 3 days, 1 day. Each message should feel different and escalate in urgency naturally. The tone should be "time to make the most of what's left" NOT "you're running out of time." Current code has `daysLeft()` function -- use it.

---

### NOTIFICATION 7: Payday Prompt (Monthly, After 25th)

**Message (ideal)**: "Payday! Before you spend it all, got any work slips from this month? Every R100 claimed = R[marginal] back from SARS."

- **Value score**: MEDIUM
- **Timing**: APPROPRIATE (25th-28th of month; natural financial moment)
- **Specificity**: PERSONALISED (marginal rate)
- **Trust account impact**: DEPOSIT (catches people at the right moment)
- **South African fit**: GOOD (payday cycle on 25th is standard for most SA employers)
- **Fix**: Build. Ask user their payday date during onboarding or settings. Default to 25th. Send one notification, morning of payday.

---

### NOTIFICATION 8: First-Time Post-Onboarding Direction

**Message (from Tjommie, in-app)**: "Right [name], let's find your money. Want to start with your work expenses or set up your monthly budget first?"

- **Value score**: HIGH
- **Timing**: APPROPRIATE (immediately after onboarding)
- **Specificity**: PERSONALISED (uses name, references their specific situation)
- **Trust account impact**: DEPOSIT (prevents the "now what?" drop-off moment)
- **South African fit**: GOOD
- **Fix**: CRITICAL. The current S_Ready screen gives a "Start building my 13th Cheque" button that goes to the home screen. But the home screen offers no directed first action. The Tjommie message on an empty home screen says "No expenses logged yet. Every work slip you add grows your 13th Cheque. Tap + to start." This is too generic. The post-onboarding moment needs to give a SPECIFIC choice, not a vague invitation.

---

## Part 3: Notifications That Must NOT Be Built

### NOTIFICATION GRAVEYARD

**"You haven't opened the app in X days"**
- Value score: NEGATIVE
- Reason: Guilt-based. Users know they haven't opened it. This tells them nothing new. Fastest route to notification disable.

**"You've been using the app for 7 days!"**
- Value score: NEGATIVE
- Reason: Celebration of nothing. The user has not achieved anything by having the app installed for a week. Feels like spam.

**"New feature available!"**
- Value score: NEGATIVE
- Reason: Not relevant to the user's financial situation. Feels like marketing.

**"Your 13th Cheque hasn't grown this week"**
- Value score: NEGATIVE
- Reason: Shaming. Punishes inaction. Will make users feel guilty and disengage.

**"Don't forget to log your expenses!"**
- Value score: NEGATIVE
- Reason: Generic, nagging, tells the user nothing they don't know. The definition of a bad notification.

**"Budget alert: You're at risk!"**
- Value score: NEGATIVE
- Reason: Fear without specificity. Anxiety without action. If you cannot name the specific category and amount, do not send.

---

## Part 4: The Permission Moment

### Current State: NON-EXISTENT

No notification permission is requested anywhere in the code.

### Recommended Strategy

**When to ask**: NOT during onboarding. Ask after the user has logged their FIRST work expense and seen the gold number grow. At that moment, Tjommie says:

> "Nice one! Want me to remind you each week to log your slips? I'll send one message — your day, your time. That's it."

This works because:
1. The user has already seen value (the gold number grew)
2. The ask is specific (one message, weekly, their choice of day/time)
3. The user has agency (they pick the day and time)
4. The promise is conservative (one message, not "notifications")

**If permission is denied**: Do nothing. Do not ask again for 30 days. After 30 days, only ask again if the user has continued using the app. The in-app Tjommie can still remind them when they open the app, which requires no permission.

**If permission is later disabled**: Show a small, non-intrusive banner in Settings: "Reminders are off. Turn them on to keep building your 13th Cheque." Do not pop up modals or interrupt the experience.

---

## Part 5: Habit Loop Analysis

### The Fogg Behaviour Model: Trigger -> Action -> Reward -> Investment

**TRIGGER (Cue)**
- External triggers: MISSING. No notifications, no reminders, no weekly nudges.
- Internal triggers: WEAK. The app does not connect to natural financial moments (payday, receiving a receipt, end of month).
- **Gap**: The user has no reason to open the app except their own memory. Memory is the worst trigger for a habit that needs to persist for 12 months.
- **Severity**: CRITICAL

**ACTION (The Behaviour)**
- The Add Expense flow exists and works.
- However, it is not optimised for minimum friction. The category selector comes AFTER the amount (should come before). There is no receipt scan button (a one-tap entry point is faster than manual entry).
- **Gap**: The action is functional but not minimal. Every extra tap is a reason not to do it.
- **Severity**: HIGH

**REWARD (Variable Reward)**
- The gold number animation after logging a work expense is the primary reward. It exists and is good.
- However: it is the ONLY reward. The reward is the same every time. Variable rewards are more habit-forming than fixed ones.
- Missing rewards:
  - No streak counter ("5 weeks in a row!")
  - No milestone celebrations ("You've crossed R5,000!")
  - No dream-item unlocks ("Your 13th Cheque just covered return flights to Cape Town!")
  - No social sharing moment
- **Gap**: Reward is singular and fixed. Needs variability and escalation.
- **Severity**: HIGH

**INVESTMENT (Stored Value)**
- The app stores expense data, which increases in value over time (more data = more accurate estimate).
- However, the user is not SHOWN the investment. They don't see "You've logged 47 expenses this year" in a way that makes them feel invested.
- Missing investment signals:
  - No "tax year progress" that fills up with THEIR activity (the current progress bar is calendar-based, not behaviour-based)
  - No "your data is building your tax summary" framing
  - No "download your tax summary" to crystallise the value of their investment
- **Gap**: The user's stored value is invisible. They cannot feel how much they'd lose by leaving.
- **Severity**: HIGH

---

## Part 6: Streak Mechanics

### Current State: NON-EXISTENT

No streak tracking, no consecutive-day/week counters, no streak-related UI.

### Recommendation

**Weekly streaks, NOT daily streaks.**

Daily expense logging is unrealistic for most South Africans. Not everyone spends money on work every day. A daily streak would be punishing and unnatural.

A WEEKLY streak makes sense: "You've logged work expenses 4 weeks in a row." This is achievable, meaningful, and maps to the natural rhythm of the app.

**Streak recovery**: If a user breaks a weekly streak, do not reset to zero immediately. Give a 48-hour grace period: "You missed last week, but if you log something by Tuesday, your streak stays alive." This prevents the demoralising cliff-edge that makes people abandon streaks entirely.

**Streak visibility**: Show the streak on the home screen, small but present. A flame icon or similar. Not dominant but always visible.

**Severity of absence**: HIGH

---

## Part 7: Progress Visualisation

### Current State: PARTIAL

The app has:
- A tax year progress bar (calendar-based, line 484) -- GOOD but passive
- An animated gold number (AnimNum component) -- GOOD, the emotional core
- Dream item comparisons (DREAMS array) -- GOOD, makes the number tangible

The app is missing:
- **Behaviour-based progress**: A bar that fills based on USER ACTIVITY, not calendar time. "You've logged 60% of what we estimate you could claim" is far more motivating than "The tax year is 92% complete."
- **Monthly comparison**: "This month vs last month" chart or comparison. Users need to see momentum.
- **Category completeness**: "You've logged Phone & Internet expenses for 8 of 12 months" -- showing gaps where money is being left on the table.
- **The annual report / tax summary download**: The CLAUDE.md spec requires this ("Download my tax summary" button). Not implemented. This is both a feature AND a habit investment mechanism -- users who have a downloadable summary feel their data is worth something.

**Severity**: HIGH for the behaviour-based progress; CRITICAL for the missing annual report (spec requirement).

---

## Part 8: Seasonal Momentum

### Current State: MINIMAL

The code has `daysLeft()` and `taxYearPct()` functions, which are used to show "X days left" and "Tax year X% complete" on the home and cheque screens. This is good basic infrastructure.

### Missing

- **No seasonal tone shift**: February (tax year end) should feel urgent and exciting. March (fresh start) should feel optimistic and clean. The app feels the same regardless of when in the tax year you open it.
- **No "end of year push"**: We are currently 8 days from the end of the 2025/26 tax year (28 Feb 2026). There should be a prominent banner, a Tjommie message with genuine urgency, and a "last chance" framing. None of this exists in the current code.
- **No "new year kickoff"**: When a new tax year starts (1 March), the app should celebrate, reset the progress bar, show last year's total, and set the tone for the new year. No such mechanism exists.
- **No mid-year catch-up**: The CLAUDE.md spec requires: "When user first opens the app, Tjommie should ask about earlier expenses." This is not implemented.

**Severity**: HIGH (the seasonal moments are where the highest-value notifications live)

---

## Part 9: South African Context Issues

### Load Shedding Awareness
- No consideration for notifications arriving in batches after load shedding ends.
- **Fix**: If implementing push notifications, use "time-to-live" parameters so stale notifications expire rather than arriving in a flood at 2am when power returns.

### Data Cost Consciousness
- Notification taps that open the app should not trigger heavy data loads.
- The current app uses Google Fonts via @import, which will download on every fresh app load. This is a data cost.
- **Fix**: Notifications should be self-contained where possible. Deep-link to the specific screen (e.g., Add Expense) rather than forcing the user through the home screen.

### Shared Device Privacy
- Financial notification content should be discreet.
- **Fix**: Notification preview text should never include rand amounts. Use "Your Tjommie update" or "Weekly 13th Cheque update" not "Your R14,230 refund estimate."

### Language
- Only English is functional. Notification copy in other languages is not available.
- **Fix**: Not critical for prototype, but note that the language selection screen (S_Lang) promises Afrikaans, isiZulu, isiXhosa, and Sesotho. If these are ever enabled, ALL notification copy must be translated. A half-translated notification is worse than no notification.

---

## Part 10: Overall Notification Strategy Recommendation

### Maximum daily notifications: 1

Never more than one notification per day. On most days, zero. The cadence should be:
- Weekly: 1 reminder (user-chosen day/time)
- Weekly: 1 summary (Monday morning, only if they logged something)
- Monthly: 1 review (1st of month)
- Event-based: Budget threshold (max 1 per month), tax deadline countdown (seasonal)

**Absolute maximum per week: 3** (and that's a busy week)

### Permission strategy
- Ask after first work expense logged, not during onboarding
- Offer specific controls: reminder day/time, summary on/off, budget alerts on/off
- Default: conservative (weekly reminder only)

### Disable recovery
- If user disables notifications: show subtle Settings banner, no pop-ups
- Continue providing value inside the app so they WANT to re-enable
- After 30 days of continued app use with notifications off, Tjommie can say once: "I notice reminders are off. Want me to turn them back on? I promise I won't spam you."

### Customisation controls needed
- Reminder day and time (user picks)
- Weekly summary: on/off
- Budget alerts: on/off
- Tax deadline reminders: on/off (default: on)
- Quiet hours: respect system Do Not Disturb

---

## Issue Summary Table

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| 1 | No notification system at all | CRITICAL | Infrastructure |
| 2 | No weekly reminder setup (spec requirement) | CRITICAL | Missing Feature |
| 3 | No permission moment designed | CRITICAL | UX/Strategy |
| 4 | No habit loop triggers (external) | CRITICAL | Retention |
| 5 | No streak mechanics | HIGH | Engagement |
| 6 | No monthly review event | HIGH | Engagement |
| 7 | No seasonal urgency system | HIGH | Engagement |
| 8 | No mid-year catch-up prompt (spec requirement) | HIGH | Missing Feature |
| 9 | No annual report / tax summary download (spec requirement) | HIGH | Missing Feature |
| 10 | No behaviour-based progress visualisation | HIGH | Engagement |
| 11 | No milestone celebrations / variable rewards | HIGH | Habit Loop |
| 12 | Post-onboarding direction too generic | HIGH | Onboarding |
| 13 | No social sharing mechanism | MEDIUM | Growth/Habit |
| 14 | No new tax year kickoff event | MEDIUM | Seasonal |
| 15 | No payday-aware prompting | MEDIUM | Contextual |
| 16 | No notification privacy controls for shared devices | MEDIUM | SA Context |
| 17 | No data-cost-aware notification design | LOW | SA Context |
| 18 | No load shedding timing awareness | LOW | SA Context |

---

## Final Sections

### HIGHEST VALUE NOTIFICATIONS

The three notifications that would most increase daily active use:

1. **Weekly expense logging reminder** (user-chosen day/time, personalised with marginal rate). This is the single most important notification because it is the ONLY external trigger that brings users back to log expenses. Without it, the app relies entirely on user memory for 12 months. That will fail.

2. **Weekly summary with real numbers** (Monday morning, only if active). This creates a feedback loop: log expenses -> see the number grow -> feel motivated -> log more expenses. The summary is the "scoreboard check" that makes the game feel real.

3. **Tax year deadline countdown** (final 60 days, escalating). This creates genuine urgency with a real deadline. The 28 February date is unmovable and universally understood in SA. These notifications convert procrastinators into actors.

### NOTIFICATION GRAVEYARD

Notifications that must never be built:
- "You haven't opened the app in X days" (guilt-based, no value)
- "Don't forget to log your expenses!" (generic, nagging)
- "You've been using the app for X days!" (celebration of nothing)
- "Your 13th Cheque hasn't grown this week" (shaming inaction)
- "New feature available!" (marketing, not user value)
- "Budget alert: You're at risk!" (fear without specificity)

### PERMISSION RETENTION STRATEGY

How to keep notification permission once granted:
1. **Never break the promise**: If you said "one message a week," send one message a week. Not two. Not three. Not "just this one extra time."
2. **Every notification must contain a real number**: The user's actual 13th Cheque amount, their actual budget remaining, their actual marginal rate. Personalised notifications feel like a service. Generic ones feel like spam.
3. **Respect silence**: If a user ignores two consecutive weekly reminders (doesn't open the app after receiving them), reduce frequency to fortnightly. If they ignore four, stop and wait for them to come back organically.
4. **Make the notification the start of a one-tap action**: Tapping the notification should take the user directly to the Add Expense screen, not the home screen. Minimise friction between notification and action.
5. **Give credit visibly**: After a user logs an expense from a notification, show: "Glad you caught that. +R[amount] to your 13th Cheque." Acknowledge the notification worked.

### HABIT LOOP GAPS

Parts of the habit cycle that notifications and current mechanics do not support:

1. **No external trigger exists at all**: The app has zero mechanisms to reach the user when they are not in the app. This means the entire habit loop depends on the user remembering to open the app, which is the weakest possible trigger for a 12-month behaviour. This must be fixed first.

2. **No variable reward**: The gold number animation is good but identical every time. The brain habituates to fixed rewards. Need: milestone surprises ("You just crossed R10,000!"), dream-item unlocks ("Your 13th Cheque just covered weekend away for two!"), streak celebrations, and occasional Tjommie insights ("Did you know you've claimed more than 70% of people at your income level?").

3. **No investment visibility**: Users cannot see how much value they have stored in the app. There is no "you've logged 52 expenses this year" counter, no "your tax summary is 85% complete" indicator, no downloadable report that crystallises their investment. Users who feel invested don't leave. Users who don't feel invested churn silently.

4. **No social hook**: There is no way to share progress, invite friends, or create accountability. "Share your 13th Cheque estimate" is both a growth mechanism and a habit reinforcer (social commitment increases follow-through). Even a simple "Tell a friend about the 13th Cheque" after the reward moment would help.

5. **No seasonal transition**: The shift from tax year end (February) to new tax year (March) is a massive missed opportunity. End of year should feel like a countdown with urgency. Start of year should feel like a fresh start with optimism. Currently, the app feels exactly the same in both periods.

6. **No "receipts in pocket" moment**: The most natural trigger for logging a work expense is having a receipt. The app has no receipt upload/scan feature (spec requirement). This means the user must remember the expense AND manually enter it, rather than just pointing their camera at a slip. The camera button is a trigger multiplier -- it turns a physical object (receipt) into a digital action (logged expense).

---

## Conclusion

The 13th Cheque v2 has a solid foundation for the in-app experience but is fundamentally missing the entire engagement layer that keeps users coming back over a 12-month tax year. No notifications, no reminders, no streaks, no milestones, no seasonal mechanics, no social sharing, and no external triggers of any kind.

The gold number animation is the emotional core and it works. But one good reward moment is not enough to sustain a year-long habit without any triggers to initiate the behaviour.

**Priority order for fixes:**
1. Build the weekly reminder setup screen (spec requirement, CRITICAL)
2. Build the notification permission moment after first work expense
3. Add streak tracking (weekly streaks with grace period)
4. Build the monthly review event
5. Add milestone celebrations and variable rewards
6. Build tax year countdown notifications (urgent: we are 8 days from deadline)
7. Add the mid-year catch-up prompt (spec requirement)
8. Add the annual report download (spec requirement)

Without these fixes, the app will have strong onboarding and weak retention. Users will set up, maybe log a few expenses, and then forget. The 13th Cheque that Tjommie promised them will remain unclaimed -- not because the app is bad, but because it is silent.
