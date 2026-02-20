# Notification & Habit Design Agent Report
**Iteration:** 2
**Generated:** 2026-02-20
**App Version:** thirteenth-cheque-final.jsx (v3)

---

## Executive Summary

The 13th Cheque app has implemented **reminder settings** and **basic streak tracking** but has **ZERO actual notification functionality**. There is no notification permission request, no delivery mechanism, no notification copy, and no way for Tjommie to actually reach users outside the app.

The app currently asks users to set up a weekly reminder (day and time), stores this preference, displays it in Settings, but **does nothing with it**. This is a phantom feature that creates false expectations.

**Severity:** HIGH — The app promises a habit-forming reminder system but delivers silence.

**Impact:** Users who enable reminders will never receive them. The app has no mechanism to bring users back after they close it. Habit formation depends entirely on self-motivation, which fails for 90%+ of users within the first week.

---

## Current State Analysis

### What's Implemented

1. **Reminder Setup Screen (S_Reminders)**
   - Users can toggle reminders on/off
   - Select day of week (Sun-Sat)
   - Select time (08:00, 09:00, 12:00, 18:00, 20:00)
   - Data stored: `reminderEnabled`, `reminderDay`, `reminderTime`
   - Default: enabled, Sunday 09:00

2. **Streak Tracking (Partial)**
   - `lastLogDate`: tracks last expense log date
   - `streakDays`: counts consecutive days
   - Logic in `handleSave()` (line 2239-2256):
     - Same day = no increment
     - 1-2 day gap = increment
     - Longer gap = reset to 1
   - **BUG:** Streak logic is flawed — allows 2-day gaps, which isn't "consecutive"

3. **Engagement Counters**
   - `firstExpenseLogged`: boolean flag
   - `totalExpensesLogged`: lifetime count
   - Used in Tjommie home messages

4. **Contextual Home Messages**
   - `getTjommieHomeMsg()` (line 650-701)
   - Different messages for:
     - First-time user (no expenses)
     - First expense logged
     - 3+ day streak
     - Total deductions >R5,000
     - Default returning user

### What's Missing

**CRITICAL GAPS:**

1. **No notification permission request**
   - Never asks browser/OS for notification permission
   - `Notification.requestPermission()` not implemented

2. **No notification scheduling**
   - Reminder settings stored but never used
   - No Web Notifications API calls
   - No service worker for background delivery

3. **No notification content**
   - Zero notification copy written
   - No message templates
   - No personalisation logic

4. **No re-engagement mechanism**
   - App has no way to bring users back
   - Relies 100% on user remembering to return
   - Death sentence for habit formation

5. **No notification preferences**
   - Can't customize types (weekly digest vs daily nudge)
   - Can't snooze or reschedule
   - Can't see preview of what notifications look like

6. **No quiet hours**
   - Offers 08:00 and 20:00 as options
   - South African context: load shedding, sleep schedules, shift work
   - No "don't disturb" override

---

## Notification Strategy Review

Since **no actual notifications exist**, I'm reviewing the setup UI and intended strategy:

### NOTIFICATION: Weekly expense reminder (setup screen)

**Current state:** Settings collected, never sent

- **Value score:** HIGH (if implemented correctly)
- **Timing:** REVIEW NEEDED
- **Specificity:** GENERIC (as designed)
- **Trust account impact:** UNKNOWN (never delivered)
- **South African fit:** NEEDS ADJUSTMENT

**Problems:**

1. **Timing options too limited**
   - 5 time slots: 08:00, 09:00, 12:00, 18:00, 20:00
   - Misses early evening (19:00) — the best time for expense logging
   - No custom time input
   - 08:00 too early for Sunday (people sleep in)
   - 20:00 too late for working parents (kids' bedtime)

2. **Generic by design**
   - Setup screen says: "When should I nudge you to log your expenses?"
   - No preview of what the actual message will say
   - Likely to be: "Don't forget to log your expenses!" (fails test #3: specificity)
   - Correct approach: "Last week you added R430 to your 13th Cheque — anything to log this week?"

3. **Weekly is wrong for most users**
   - Optimal frequency for expense tracking: 2-3x per week
   - Weekly = 6 days of forgetting → pile of unlogged expenses → cognitive burden → "I'll do it later" → abandoned
   - Should offer: Daily (evening), 3x/week (Sun/Wed/Fri), Weekly, or Custom

4. **No context about load shedding**
   - South African reality: notifications during load shedding arrive in bursts when power returns
   - Should: avoid sending during typical Stage 4+ windows (18:00-22:00) unless user opts in
   - Better: "Send even during likely load shedding times?" with explanation

5. **Permission request timing (not implemented)**
   - If it were implemented, asking on setup screen (Step 6 of 6) = WRONG
   - User hasn't experienced value yet
   - Permission request should come AFTER first expense logged + seeing gold number grow
   - Explanation should be specific: "I'll remind you every Sunday at 18:00 to log your week's expenses — based on your current pace, that's worth ~R120/week in tax savings"

**Fix required:**

```
IMMEDIATE:
1. Implement actual Web Notifications API
2. Request permission AFTER first expense logged
3. Show preview: "Here's what the reminder looks like" with example notification

NOTIFICATION COPY (examples):
- Week 1: "Time to log expenses, [name]. Last week you added R[amount] — let's keep building your 13th Cheque."
- Streak active: "[X]-day streak! You've logged [Y] expenses worth R[Z]. Log today's to keep it going."
- No activity: "Haven't logged in [X] days — your 13th Cheque is waiting. Even one receipt makes a difference."
- Tax year end approaching: "[X] days left in the tax year. You're at R[amount] in deductions — every expense counts now."
- After skipping: "No pressure, but you're [X] days from losing your streak. Worth 30 seconds?"

TIMING:
- Default: Sunday 18:00 (post-weekend, pre-week planning)
- Alternative slots: Mon 19:00, Wed 19:00, Fri 19:00 (after-work windows)
- Custom time picker (30min increments)
- Quiet hours toggle: "Don't send before [time] or after [time]"

FREQUENCY:
- Daily (for power users logging work expenses daily)
- 3x/week (optimal for most)
- Weekly (minimum viable)
- Smart: "Remind me only if I haven't logged in 3+ days"
```

---

### NOTIFICATION: First expense celebration (not implemented)

**Would be triggered:** After user logs first work expense

- **Value score:** HIGH
- **Timing:** APPROPRIATE
- **Specificity:** PERSONALISED
- **Trust account impact:** DEPOSIT
- **South African fit:** GOOD

**Current state:** Only shows in-app after save (line 2296)

**Should be notification:**
- Title: "Your first R[amount] is working for you!"
- Body: "You just added R[tax_saving] to your 13th Cheque. This is how it grows."
- Action: "Add another expense"
- Timing: Immediate (while dopamine is high)

**Why it matters:**
- First success = strongest habit anchor
- Proves the system works
- Shows Tjommie is paying attention
- Creates expectation that app celebrates wins, not just nags

**Fix:** Implement as push notification + in-app celebration (keep both)

---

### NOTIFICATION: Streak milestones (not implemented)

**Would be triggered:** 3, 7, 14, 30 day streaks

**Current state:** Only visible on home screen if user opens app

**Problem:** User won't know they're on a streak unless they open the app — but they need the notification to remind them to open the app. Circular dependency.

**Should be:**
- 3 days: "3-day streak! You're building a habit. Keep it going."
- 7 days: "One week strong! You've added R[amount] to your 13th Cheque."
- 14 days: "Two weeks of discipline = R[amount] in tax savings. Your future self is grateful."
- 30 days: "A full month! R[amount] found and counting. You're in the top 5% of tax savers."

**Timing:** Morning of streak day (before they might break it)

**Fix:** Implement with progressive reinforcement — celebrate effort, not just outcome

---

### NOTIFICATION: Monthly summary (not implemented)

**Would be triggered:** 1st of each month, 09:00

- **Value score:** HIGH
- **Timing:** APPROPRIATE (month-end is natural reflection point)
- **Specificity:** PERSONALISED
- **Trust account impact:** DEPOSIT (provides value, not nag)
- **South African fit:** GOOD

**Copy:**
```
SUBJECT: Your [Month] Tax Summary
BODY:
Last month you logged R[work_expenses] in work expenses
+ R[tax_saving] added to your 13th Cheque
You're at R[running_total] for the year — [dream]

Current refund estimate: R[refund]
[Days_left] days until tax year end.

[If overspent budget]: You overspent by R[amount] — let's get back on track this month.
[If streak broken]: Your streak reset, but your refund is still growing. Log one expense to restart.
```

**Why it's high value:**
- Natural monthly rhythm (payday, bills, new month planning)
- Reinforces progress without being naggy
- Combines wins + course correction
- Gives reason to open app (see detailed breakdown)

**Timing consideration:**
- 1st is payday for many = mentally primed for money
- 09:00 = after morning rush, before deep work
- Alternative: Last day of month (reflective vs forward-looking)

**Fix:** Implement as monthly digest — most valuable notification the app could send

---

### NOTIFICATION: Budget limit warnings (not implemented)

**Would be triggered:** When spending hits 80%, 100%, 110% of budget category

**Current state:** Only visible in Spending screen if user checks

**Risk level:** WITHDRAWAL (could be perceived as nagging)

**Copy (if implemented):**
```
80%: "You've spent R[spent] of your R[limit] [category] budget — R[remaining] left this month"
100%: "Your [category] budget is used up (R[limit]). Track what you spend from here."
110%: Not sent — shaming doesn't help

Alternative smart notification:
"You're tracking R[amount] less than last month in [category] — nice work!"
```

**Recommendation:** DON'T IMPLEMENT in v1
- Budget warnings feel like parent scolding child
- Creates negative association with app
- High uninstall risk
- Better: show progress bars in-app only, celebrate when under budget

**Exception:** If user explicitly enables "Warn me at 80% of budget limits" in settings

---

### NOTIFICATION: Tax year deadline urgency (not implemented)

**Would be triggered:** 60 days out, 30 days out, 14 days out, 7 days out

**Value score:** MEDIUM (urgency is real, but can feel like pressure)

**Copy:**
```
60 days: "[Name], 60 days left in the tax year. You're at R[refund] — every expense between now and Feb 28 counts."

30 days: "One month left to build your 13th Cheque. You're at R[refund]. Time to log those receipts you've been meaning to add."

14 days: "Two weeks until tax year end. Your current refund: R[refund]. Last push — scan those receipts!"

7 days: "Final week! Tax year ends Feb 28. You've built R[refund] so far — finish strong."
```

**Timing:** Mid-morning (10:00), never on weekends

**South African context:**
- February is already stressful (back to school, post-holiday debt)
- Tone must be "time to win" not "you're running out of time"
- Celebrate what's been achieved, frame urgency as opportunity

**Fix:** Implement but TEST tone carefully — urgency vs anxiety

---

### NOTIFICATION: "We miss you" re-engagement (not implemented)

**Would be triggered:** 7, 14, 30 days of inactivity

**Value score:** LOW-MEDIUM (depends entirely on execution)

**Generic version (DON'T SEND):**
- "Haven't seen you in a while! Come back to 13th Cheque"
- Result: Annoyance → Disable notifications

**Specific version (WORTH TESTING):**
```
7 days: "[Name], your R[current_refund] is waiting. Even 5 minutes of expense logging = R[potential_gain] more."

14 days: "It's been 2 weeks. Your 13th Cheque is at R[amount] — not too late to add to it before Feb 28."

30 days: "Your refund estimate hasn't changed in a month (still R[amount]). Want to see it grow? One logged expense and you're back."
```

**Critical rules:**
1. Only send if user logged at least 3 expenses before going inactive (they've experienced value)
2. MAX one re-engagement per user lifetime (not 7-day, 14-day, 30-day — pick ONE)
3. Include clear value: "You have R[X] logged — that's R[Y] back from SARS"
4. No guilt, no FOMO, no "your streak is broken" — only opportunity

**Recommendation:** Implement 14-day version only, max 1 per user

---

## Habit Mechanics Beyond Notifications

### Streak Tracking (Currently Broken)

**Bug in line 2242-2244:**
```javascript
const streak = prev.lastLogDate === today ? prev.streakDays :
  (prev.lastLogDate && (new Date(today) - new Date(prev.lastLogDate)) <= 86400000 * 2)
    ? prev.streakDays + 1 : 1;
```

**Problem:** Allows 2-day gaps (48 hours) to count as consecutive
- User logs Monday → skips Tuesday → logs Wednesday = streak continues
- That's not a daily habit, it's 50% compliance
- Undermines the psychological contract of a "streak"

**Fix:**
```javascript
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().slice(0, 10);

const streak = prev.lastLogDate === today
  ? prev.streakDays  // Same day = no change
  : prev.lastLogDate === yesterdayStr
    ? prev.streakDays + 1  // Yesterday = extend
    : 1;  // Any other gap = reset
```

**South African consideration:**
- Load shedding can prevent logging
- Should offer "streak freeze" after 7+ days: "Couldn't log yesterday? Use one freeze to save your streak"
- Max 2 freezes per month

---

### Progress Visualisation

**What's good:**
- Gold number animates up when work expense added (line 2282)
- Tax year progress bar on home screen
- "Dream" text ("that holiday you keep postponing")

**What's missing:**
- No visual "level up" when crossing milestones (R5k, R10k, R20k refund)
- No before/after comparison ("You started at R0, now at R14,230")
- No projection: "At your current pace, you'll hit R[X] by Feb 28"

**Fix:**
```
ADD TO HOME SCREEN:
- Pace indicator: "Logging [X] expenses/week on average"
- Projection: "If you maintain this, estimated final refund: R[amount]"
- Milestone badges: Unlock at R5k, R10k, R20k (visual reward)

ADD TO CHEQUE SCREEN:
- Timeline graph: refund growth over tax year
- Month-by-month breakdown bar chart
- "You're ahead of 67% of users at your income level" (social proof, if we had multi-user data)
```

---

### Seasonal Momentum

**Current state:** App knows tax year % complete (line 109-114)

**Missing:** No seasonal framing
- March 1 = fresh start, new tax year, reset to R0
- December = mid-year check-in ("You're halfway through the year at R[X] — on track?")
- January = post-holiday push ("New year, new receipts — log those December expenses")
- February = final sprint

**Fix:** Tjommie messages should reference season
```
March: "Fresh tax year, [name]. Your 13th Cheque starts at R0 — let's build it together."
June: "You're 3 months in at R[amount]. That's [dream]. Let's double it by Feb."
December: "Halfway through the tax year. You've built R[amount] — that's R[monthly] per month on average."
February: "Final month! Tax year ends Feb 28. You're at R[amount] — time for the last push."
```

---

### Sharing (Not Implemented)

**Current state:** No sharing functionality

**Opportunity:** "Share your 13th Cheque" feature
- Generate image: "I found R14,230 in tax refunds with The 13th Cheque app 💰"
- Social proof drives adoption
- Public commitment increases completion (you told people, now you have to file)

**Implementation:**
```
ADD TO CHEQUE SCREEN:
- "Share" button (generates image with refund amount + app logo)
- Privacy-aware: "Share R[amount]" or "Share that I'm using 13th Cheque" (no amount)
- Prewritten copy: "I'm tracking my work expenses and found R[amount] in tax deductions I didn't know I could claim. South Africans — check out The 13th Cheque app before Feb 28!"
```

**South African context:**
- Stokvels share financial wins
- "Black tax" = family ask for money → sharing refund estimate = "this is earmarked"
- Sharing is accountability in SA culture

---

### The Monthly Review Event

**Current state:** No special treatment of month rollover

**Opportunity:** Make 1st of month feel like an EVENT, not just a date

**What other habit apps do:**
- Duolingo: Monthly streak summary + XP total
- Strava: Monthly mileage badge
- Headspace: "You meditated X days this month"

**What 13th Cheque should do:**
```
ON 1ST OF MONTH:
1. Push notification (if implemented): Monthly summary
2. In-app modal on first open:
   - "[Month] Complete!"
   - "You logged R[work] in work expenses"
   - "+R[tax_saving] to your 13th Cheque"
   - "Personal spending: R[spent] of R[budget]"
   - "This month's goal: [what's one thing to improve?]"
3. Unlock monthly badge (gamification lite)
4. Tjommie message: "New month, [name]. Last month you added R[X]. Let's beat that — what's the first expense to log?"
```

**Why it matters:**
- Creates rhythm (monthly checkpoint = habit maintenance)
- Celebrates micro-wins before tax year end (delayed gratification is hard)
- Frames new month as fresh start (psychologically powerful)

---

## Overall Notification Strategy

### Maximum Daily Notifications: 1

**Rationale:**
- This is a finance app, not a social app
- User checks it when logging expenses (2-3x/week), not daily
- More than 1/day = nagging = disabled notifications

**Exceptions:**
- Day of first expense: celebration notification (one-time ever)
- Tax year deadline: final 7 days can have 1 additional (max 2/day for 1 week only)

### Permission Strategy

**WHEN TO ASK:**

❌ **WRONG (current design if implemented):**
- During onboarding Step 6
- User hasn't experienced value
- "Allow notifications?" with no context

✅ **RIGHT:**
- After first work expense logged + success screen shown
- Context: "You just added R[tax_saving] to your 13th Cheque. I can remind you weekly to keep building it — want that?"
- Preview shown before permission prompt
- Opt-out clearly available

**HOW TO ASK:**

1. In-app explainer screen (before browser prompt):
```
┌─────────────────────────────────┐
│ 🤖 Tjommie here                 │
│                                 │
│ You've logged your first work  │
│ expense — nice! At your current│
│ pace, you could add R[X] more  │
│ to your refund this year.      │
│                                 │
│ I can remind you weekly to log │
│ expenses. Here's what it looks │
│ like:                           │
│                                 │
│ [Preview of notification]      │
│                                 │
│ Sound good?                    │
│                                 │
│ [Yes, remind me] [Not now]     │
└─────────────────────────────────┘
```

2. If user clicks "Yes" → trigger browser `Notification.requestPermission()`
3. If user clicks "Not now" → never ask again (store `notificationsDismissed: true`)
4. If user later enables in Settings → trigger permission flow

**Notification preview example:**
```
┌─────────────────────────────────┐
│ 🤖 The 13th Cheque              │
│ Time to log expenses, Lerato    │
│                                 │
│ Last week you added R430 to    │
│ your refund. Anything to log   │
│ this week?                      │
│                                 │
│ Sunday, 18:00                   │
└─────────────────────────────────┘
```

### Disable Recovery

**What happens when user disables notifications:**

Current state: Nothing (can't disable what doesn't exist)

**Should do:**
1. Detect disabled state (check `Notification.permission === "denied"`)
2. Show in-app message (NOT a notification, obviously):
```
┌─────────────────────────────────┐
│ Notifications are off           │
│                                 │
│ You disabled reminders. No      │
│ problem — you can still use the│
│ app. If you change your mind,  │
│ re-enable in Settings > App    │
│ Permissions.                    │
│                                 │
│ [Got it]                        │
└─────────────────────────────────┘
```
3. Remove notification settings from in-app Settings screen
4. Never re-prompt (respect the "no")

**NEVER:**
- Send silent notifications hoping they'll re-enable
- Nag in-app about re-enabling
- Make app features dependent on notifications

### Customisation

**What users should control:**

1. **Frequency:**
   - Daily (18:00)
   - 3x/week (Sun/Wed/Fri at 18:00)
   - Weekly (Sunday 18:00)
   - Custom days + time
   - Smart: "Only if I haven't logged in 3+ days"

2. **Quiet hours:**
   - Don't send before [08:00]
   - Don't send after [21:00]
   - Respect system Do Not Disturb

3. **Types:** (if multiple notification types implemented)
   - ☑ Weekly expense reminder
   - ☑ Monthly summary
   - ☐ Budget warnings
   - ☑ Streak milestones
   - ☐ Tax deadline reminders

4. **Tone:**
   - Casual (default): "Time to log, Lerato!"
   - Formal: "Expense logging reminder"
   - Silent: Notification with no sound/vibration

**Current state:** Only on/off toggle, day picker, time picker (5 options)

**Fix:** Add customisation after v1 launch based on user feedback

---

## HIGHEST VALUE NOTIFICATIONS

If forced to pick only 3 notifications to implement first:

### 1. Weekly Expense Reminder (Contextual)

**Why it's #1:**
- Core habit loop: log expenses weekly
- Without it, app is forgotten
- Drives primary user action

**Copy template:**
```
WEEK 1 (no prior data):
"Time to log expenses, [name]. Did you have any work costs this week? Even one receipt starts building your 13th Cheque."

WEEK 2+ (has logged before):
"Last week you added R[amount] to your refund. Anything to log this week?"

STREAK ACTIVE:
"[X]-day streak! You've logged R[total] so far. Log this week's expenses to keep it going."

COMEBACK (3+ weeks inactive):
"Your R[current_refund] refund is waiting. Log this week's expenses to grow it."
```

**Timing:** User-selected day + time (default: Sunday 18:00)

**Personalisation level:** HIGH
- Uses name
- References last week's amount
- Mentions streak if active
- Shows running total

**Why it works:**
- Specific (not "log expenses", but "last week you added R430")
- Timely (weekly rhythm matches expense memory decay)
- Actionable (clear what to do)
- Rewarding (celebrates progress)

---

### 2. Monthly Summary (Achievement Notification)

**Why it's #2:**
- Celebrates progress (positive reinforcement)
- Natural rhythm (monthly = payday, budgeting)
- High information density (worth the interruption)

**Copy template:**
```
TITLE: "Your [Month] Tax Summary"

BODY:
"[Name], you logged R[work_expenses] in work expenses last month.

That's +R[tax_saving] to your 13th Cheque.

Running total: R[refund_to_date]
[Days left] days until Feb 28.

[IF AHEAD OF PACE]: You're on track for R[projected_final] by tax year end!
[IF BEHIND PACE]: Log [X] more expenses/month to hit R[target].

Tap to see full breakdown."
```

**Timing:** 1st of month, 09:00

**Why it works:**
- Deposits to trust account (gives value, doesn't ask)
- Provides context (where you are vs where you could be)
- Motivates next action (natural time to set monthly goal)

---

### 3. First Expense Celebration (One-Time)

**Why it's #3:**
- Strongest habit formation moment
- Proves system works
- Creates dopamine association with logging

**Copy:**
```
TITLE: "Your first R[amount] is working for you!"

BODY:
"You just added R[tax_saving] to your 13th Cheque. This is how it grows.

Log another expense to keep building."
```

**Timing:** Immediately after first work expense saved

**Why it works:**
- Instant gratification (no delayed reward)
- Social proof (Tjommie is watching and celebrating)
- Low-stakes win (easy to repeat)

**One-time only:** Never spam with celebration every time (diminishing returns)

---

## NOTIFICATION GRAVEYARD

Notifications to NEVER implement (or remove if implemented):

### 1. "You haven't logged in X days"

**Why it's spam:**
- Guilt-based (negative emotion)
- No new information (user knows they haven't opened app)
- Not actionable (if they cared, they'd open app)
- High disable rate

**Exception:** Single 14-day re-engagement with specific value ("Your R[X] is waiting")

---

### 2. "Your budget is at risk!"

**Why it's spam:**
- Fear-based
- Often wrong (budget tracking requires manual entry = incomplete)
- Creates negative association with app
- Feels like parent scolding child

**Better:** In-app progress bars only, celebrate wins ("You're R[X] under budget in [category]!")

---

### 3. Generic streaks: "7 days on The 13th Cheque!"

**Why it's spam:**
- Celebrates app usage, not user achievement
- Duolingo-style "7-day streak!" without context
- User didn't accomplish anything meaningful (logging ≠ achievement, refund built = achievement)

**Better:** "[X]-day streak = R[Y] in deductions logged. You're building something real."

---

### 4. "New feature available!"

**Why it's spam:**
- Not time-sensitive
- Not personal to user
- App update noise
- High annoyance factor

**Better:** In-app changelog banner on next open, dismissible

---

### 5. Daily "Good morning!" check-ins

**Why it's spam:**
- No information value
- Daily frequency too high for finance app
- Not actionable
- Feels desperate (app trying to be your friend)

**Better:** Weekly rhythm only, unless user opts into daily

---

### 6. "Your friend [X] is using The 13th Cheque!"

**Why it's spam:**
- Privacy violation (friend didn't consent to being named)
- Social pressure (guilt)
- Not about user's own progress

**Better:** In-app sharing feature (user-initiated), never notification

---

### 7. "Rate us 5 stars!"

**Why it's spam:**
- Transactional (asking without giving)
- Interrupts user goal
- Damages trust

**Better:** After major win (filed taxes, got refund), in-app prompt (dismissible)

---

## PERMISSION RETENTION STRATEGY

How to keep notifications enabled once granted:

### 1. Start Conservative

**First 30 days:**
- 1 notification per week (weekly reminder)
- No extras (no milestone spams, no tips, no random pings)
- Let user settle into rhythm

**After 30 days:**
- If user is active (3+ logins/week): keep 1/week
- If user is inactive: send ONE re-engagement, then silence
- If user logs daily: offer daily reminder as opt-in upgrade

---

### 2. Every Notification Must Pass The Test

Before sending ANY notification, ask:

1. **Can the user get this info another way right now?**
   - If yes → don't send
   - Monthly summary = NO (user would have to calculate)
   - Weekly reminder = NO (user would have to remember)
   - "New feature!" = YES (they'll see it in-app) → don't send

2. **Is the timing right?**
   - User-selected time = YES
   - Middle of workday = NO
   - During typical load shedding hours (18:00-22:00) = ASK USER

3. **Is it specific to this user's situation?**
   - "Last week you added R430" = YES
   - "Don't forget to log expenses!" = NO

4. **Can the user do something with this right now?**
   - "Log this week's expenses" = YES
   - "Your refund is growing!" = NO (not actionable)

5. **Would missing this notification make the user worse off?**
   - Weekly reminder (prevents forgotten receipts) = YES
   - Streak milestone (just a number) = NO

**Rule:** Fail ANY one test = don't send notification

---

### 3. Respect User Signals

**If user dismisses notification without action 3 times in a row:**
- Show in-app: "You've skipped the last 3 reminders. Want to change the day/time or turn them off?"
- Offer to adjust, don't keep spamming

**If user engages with notification:**
- Track that this type works for them
- Slightly increase (but cap at 2/week max)

**If user disables:**
- Never re-enable without explicit user action
- Remove notification settings from UI
- Respect the choice

---

### 4. Seasonal Adjustment

**Tax year-end (Feb 1-28):**
- Increase frequency slightly (1/week → 2/week) WITH warning
- In-app message Jan 31: "Final month! I'll remind you twice a week in Feb to help you maximise your refund. You can change this in Settings."
- User can opt out

**Post-tax year (Mar-Apr):**
- Reduce frequency (weekly → monthly)
- "Tax year reset — I'll check in monthly while you build next year's refund"

---

### 5. Language Consistency

**Critical for South Africa:**
- User selects language in setup
- EVERY notification MUST be in that language
- Half-English, half-Afrikaans = instant disable

**Current state:** App has `lang: "en"` field but no multi-language implementation

**Fix:** If adding notifications, ensure all copy supports user's language choice

---

## HABIT LOOP GAPS

Parts of the habit cycle notifications don't currently support (because they don't exist):

### 1. CUE (Reminder to Act)

**Gap:** No external trigger to open app
- Current: User must remember
- Should be: Weekly notification "Time to log expenses"

**Fix:** Implement weekly reminder (HIGHEST PRIORITY)

---

### 2. ROUTINE (The Action Itself)

**Gap:** Multi-step friction
- Current: Open app → Navigate to Add → Select category → Enter amount → Save
- Should be: Notification → Tap → Quick-add screen

**Fix:** Notification action buttons
```
┌─────────────────────────────────┐
│ 🤖 The 13th Cheque              │
│ Time to log expenses, Lerato    │
│                                 │
│ Last week: +R430 to your refund│
│                                 │
│ [Quick add] [Open app] [Dismiss]│
└─────────────────────────────────┘
```
- "Quick add" → Deep link to S_AddExpense with pre-filled date (today)
- Reduces friction from 5 steps to 3

---

### 3. REWARD (Positive Reinforcement)

**Gap:** Reward is delayed (tax refund in Feb, 2-11 months away)
- Current: Gold number grows (weak immediate reward)
- Should be: Immediate celebration + progress milestones

**Fix:**
1. First expense celebration notification (implemented)
2. Milestone notifications: R5k, R10k, R20k, R30k unlocked
3. Weekly wins: "This week: +R[X]. Total: R[Y]. You're [Z]% to your goal."

**Copy for R10k milestone:**
```
TITLE: "R10,000 milestone unlocked! 🏆"

BODY:
"[Name], you've built R10,000 in tax deductions. That's [dream] when your refund lands.

Keep going — every expense from here is bonus money."
```

**Timing:** Immediately when crossing threshold (not next weekly reminder)

---

### 4. INVESTMENT (Increasing Commitment)

**Gap:** No escalating commitment mechanism
- Current: Same action every time (log expense)
- Should be: Progressive depth

**Examples from other apps:**
- Duolingo: Unlock new lessons → investment grows
- Strava: Join challenges → commitment deepens
- Headspace: Unlock courses → sunk cost increases

**What 13th Cheque could do:**
- Week 1: Log expenses (easy)
- Week 3: Set monthly budget (medium commitment)
- Week 6: Connect to bank (if auto-categorisation added) (high commitment)
- Month 3: Invite tax practitioner to review (deep investment)

**Notification role:**
```
After 2 weeks active:
"You've logged 8 expenses so far, [name]. Ready to level up? Set a monthly budget and I'll help you track spending too."

[Set budget now] [Maybe later]
```

**Why it matters:**
- More invested → less likely to abandon
- Notifications guide progression, not just nag

---

### 5. SOCIAL (Accountability & Comparison)

**Gap:** Solo experience, no social proof
- Current: User vs self
- Should be: User vs community (even if anonymised)

**Examples:**
- "You're ahead of 67% of users at your income level"
- "Most people at R[income] have logged R[X] by this point in the year — you're at R[Y]"
- Share achievements: "I built R[X] in tax deductions this month"

**Notification role (if social features added):**
```
"Your refund estimate (R14,230) is higher than 73% of users at your income. You're doing great."

[Share this win] [Keep it private]
```

**Privacy consideration:**
- All comparisons anonymised
- User must opt in to community benchmarks
- South African context: comparison can be motivating (stokvels, savings clubs culture)

---

### 6. FAILURE RECOVERY (Compassionate Restart)

**Gap:** Streak breaks = guilt = abandonment
- Current: Streak resets to 1, no acknowledgment
- Should be: Offer restart with compassion

**Notification when streak breaks (7+ days inactive):**
```
WRONG:
"Your 7-day streak is broken. Start over."

RIGHT:
"Your streak reset, but your R[refund] is still growing. Log one expense to start a new streak — all progress counts."
```

**Better:** Streak freeze feature
- After 7+ consecutive days, unlock 2 "freeze days" per month
- If user misses a day, notification asks: "Use a freeze day to save your 14-day streak?"
- Reduces all-or-nothing thinking

**Why it matters:**
- Perfectionism kills habits
- Notifications should help recovery, not shame

---

## South African Context Gaps

### Load Shedding Awareness

**Gap:** No acknowledgment that notifications may be delayed/batched

**Fix:**
- Setting: "I'm often affected by load shedding"
  - If enabled: avoid 18:00-22:00 default slot
  - Suggest 14:00 or 08:00 instead
- Notification copy: "Couldn't log yesterday? Load shedding happens — no problem, log when you can."

---

### Data Cost Sensitivity

**Gap:** Notification opens app = data usage
- Current: No warning
- Should be: Notification content self-contained where possible

**Fix:**
```
Weekly reminder notification:
"Last week: +R430 to your refund. Anything to log this week?"

[Quick add] → Opens app (data)
[I'm on expensive data] → Snooze 2 hours
[Dismiss] → Remind me next week
```

---

### Shared Device Reality

**Gap:** Notifications may be seen by family on shared device
- Current: "Your R14,230 tax refund"
- Should be: "Your 13th Cheque update" (discreet)

**Fix:**
- Setting: "Use discreet notifications"
- If enabled: no rand amounts in notification, only in-app

**Copy:**
```
DISCREET MODE OFF:
"You logged R2,340 in expenses last week — added R843 to your refund"

DISCREET MODE ON:
"New expenses logged. Tap to see your updated refund estimate."
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

1. Implement Web Notifications API
2. Permission request flow (after first expense)
3. Weekly reminder (1 notification/week, user-selected time)
4. Notification settings in Settings screen (enable/disable, day/time picker)

**Success metric:** 40%+ of users grant permission, 80%+ keep it enabled after 30 days

---

### Phase 2: Reinforcement (Week 2)

1. First expense celebration (one-time notification)
2. Monthly summary (1st of month)
3. Notification preview before permission request
4. Quiet hours (respect system Do Not Disturb)

**Success metric:** 60%+ engagement rate on weekly reminders (tap + log expense)

---

### Phase 3: Optimisation (Week 3-4)

1. Streak milestone notifications (3, 7, 14, 30 days)
2. Contextual weekly reminders (reference last week's amount)
3. Smart frequency (offer daily/3x/week based on user behavior)
4. Re-engagement (single 14-day inactive notification)

**Success metric:** 50%+ of users who get re-engagement return to app

---

### Phase 4: Advanced (Month 2+)

1. Tax year urgency (60/30/14/7 days countdown)
2. Notification action buttons (Quick add)
3. Discreet mode (privacy setting)
4. Load shedding awareness (avoid peak hours)
5. Streak freeze feature

**Success metric:** Notifications remain enabled by 70%+ users at 90 days

---

## Critical Recommendations

### DO IMMEDIATELY:

1. **Implement Web Notifications API** — Without this, all reminder settings are lies
2. **Weekly reminder only** — Start with 1/week, perfect it before adding more
3. **Permission after first expense** — Never ask during onboarding
4. **Fix streak logic** — 2-day gaps ≠ consecutive

### DO SOON:

5. **Monthly summary** — Highest value notification after weekly reminder
6. **First expense celebration** — Strongest habit anchor
7. **Notification preview** — Show example before asking permission

### DO EVENTUALLY:

8. **Milestone celebrations** — R5k/R10k/R20k unlocks
9. **Smart frequency** — Daily option for power users
10. **Streak freeze** — Compassionate failure recovery

### NEVER DO:

11. **Budget warnings** — Feels like nagging
12. **Daily check-ins** — Too frequent for finance app
13. **"Rate us!"** — Damages trust
14. **Generic reminders** — "Don't forget!" without context
15. **Social spam** — "Your friend joined!" notifications

---

## Final Verdict

**Current state:** 0/10 — Notification system is vaporware

**Potential (if implemented correctly):** 9/10 — Could be best-in-class habit formation for finance

**Biggest risk:** Implementing notifications badly (generic, frequent, naggy) → mass disable → app death spiral

**Biggest opportunity:** Weekly contextual reminder → 3x increase in retention → tax filing completion → actual refunds → word-of-mouth growth

**One sentence summary:**
The app asks users to trust it with weekly reminders, stores their preferences, then ghosts them completely — implement actual notifications with the contextual, respectful strategy outlined above, or remove the settings screen entirely.

---

**Agent:** Notification & Habit Design
**Status:** CRITICAL IMPLEMENTATION GAPS FOUND
**Priority:** Implement Phase 1 (weekly reminder) before next iteration
