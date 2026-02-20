# Product & UX Designer Agent Report
## Iteration 1 -- The 13th Cheque v2

**Reviewer**: Senior Product Designer (Emerging Market Consumer Finance)
**Date**: 2026-02-20
**File reviewed**: `thirteenth-cheque-v2.jsx`

---

## Executive Summary

This v2 prototype has a genuinely compelling core idea: reframe the tax refund as a "13th Cheque" that grows throughout the year. That emotional framing is the best thing about this product. However, the current build suffers from a fundamental product architecture problem: **it is structured as a data-entry tool, not as a money-finding assistant**. The onboarding collects information but does not deliver enough immediate, personalised value. The post-onboarding experience drops the user into a dashboard with no clear next action. There is no habit loop, no notification system, no weekly rhythm, and no mid-year catch-up path. On Day 47, most users will have stopped opening the app.

The bones are here. The visual language is strong. The Tjommie personality layer has real potential. But the product needs significant restructuring to survive in the real world -- specifically in South African daily life, where data is expensive, power goes out, and people need a reason to open an app that goes beyond "you should log your expenses."

---

## AREA: Information Architecture

- **Habit loop score**: BROKEN (Action element fails -- logging an expense is too much friction for the reward)
- **Day 47 survival**: NO
- **Trust score**: NEUTRAL
- **South African fit**: NEEDS WORK
- **Core issue**: The app is organised around developer abstractions ("Work expense" vs "Personal expense", tax categories, budget limits) rather than how real people think about their money. A user who just bought lunch doesn't think "is this a personal expense against my eating-out budget category?" -- they think "I spent R85 at Nando's." The architecture forces classification before capture, which kills the speed of the primary action.

  The navigation has five tabs (Home, 13th Cheque, Add, Spending, Tjommie), which is reasonable, but the relationship between the "13th Cheque" screen and the "Spending" screen is unclear. One is about tax money, the other is about living money. A user who just wants to know "how much money do I have left?" has to mentally decide which screen answers that question. The home screen tries to show both but succeeds at neither -- it is a summary dashboard that shows numbers without telling the user what to do next.

  The Add Expense flow asks for amount BEFORE category (line 662-683). This is backwards. Category sets context for the amount. If I select "Fuel", I know it is probably R400-R800. If I select "Phone & Internet", I know the exact amount from my bill. Category first, then amount.

- **Redesign recommendation**:
  1. Restructure navigation around user mental model: "My Money" (combined view), "13th Cheque" (tax refund tracker), "Add" (quick capture), "Tjommie" (chat). Drop "Spending" as a separate tab -- merge it into the home "My Money" view.
  2. Add Expense must lead with category, not amount. Category -> Amount -> Description -> Date -> Save. Category selection should use large, tappable icons -- not a dropdown.
  3. Every screen must end with a clear next action. No dead ends.

---

## AREA: Feature Decisions

- **Habit loop score**: WEAK (Reward exists for work expenses via the "+R X to your 13th Cheque" moment, but no trigger or investment mechanism)
- **Day 47 survival**: AT RISK
- **Trust score**: BUILDING (the tax bracket display and honest disclaimer on the Settings page are good)
- **South African fit**: NEEDS WORK
- **Core issue**: Several critical features are missing entirely, and some existing features do not pull people back to the app:

  **Missing (CRITICAL)**:
  - No receipt upload / camera capture. This is the single biggest convenience feature for a tax expense tracker. Without it, the user has to manually type every expense. This alone will kill retention.
  - No reminder system. There is zero notification infrastructure. The user must remember to open the app on their own, indefinitely. No weekly prompt, no payday reminder, no end-of-month nudge.
  - No career-aware deduction suggestions. The app asks for occupation (line 304) but never uses it. A teacher, a sales rep, and a software developer have completely different deduction profiles. The occupation data is collected and wasted.
  - No mid-year catch-up flow. If a user installs the app in August, they have 5 months of uncaptured expenses. The app offers no path to recover those. That is half a year of tax refund money left on the table.
  - No annual tax summary / PDF export. The entire point of tracking expenses all year is to produce something useful at tax time. The app has no export functionality.
  - No Retirement Annuity (RA) deduction category. This is the single largest tax deduction most working South Africans miss. Its absence is a significant gap in a product whose premise is "find your hidden tax money."

  **Present but undercooked**:
  - The Dreams section (lines 77-85) is a static list of pre-defined items. It should be personalised. "Weekend away for two" means nothing if the user dreams of paying off their car. Let users set their own dream. Make it tangible. Show progress toward THAT specific thing.
  - Budget categories (lines 67-75) are generic and incomplete. Missing: Housing/Rent/Bond, Utilities (Eskom, water, rates), School Fees, Insurance, Family Support (a uniquely South African category -- sending money home to family is a real budget line for millions of people), Transport (the current "Fuel" ignores taxi and Uber users entirely).
  - The income input (line 307) is a raw number field with type="number". No currency formatting, no visual feedback, no South African feel. Typing "25000" into a plain number input does not feel like progress -- it feels like a government form.

- **Redesign recommendation**:
  1. Add receipt camera/upload as the FIRST action on the Add Expense screen. Tap camera -> "scanning..." animation -> auto-fill category, amount, merchant, date. Even in a prototype, this flow must exist visually.
  2. Build a reminder setup prompt into the onboarding or immediate post-onboarding. "When should I remind you to log your expenses? Pick a day and time." Default to Sunday 7pm.
  3. After occupation entry, Tjommie must surface: "As a [occupation], you can probably claim these..." with pre-populated suggestions. This is the first trust-building moment.
  4. Add mid-year catch-up as the first Tjommie conversation after onboarding: "Have you had work expenses earlier this year? The tax year runs March to February. Let's capture what you've already spent."
  5. Add a "Download tax summary" button on the 13th Cheque screen. Generate a formatted summary by category, ready for a tax practitioner.
  6. Add RA contributions as a deduction category with a prominent callout: "This is the biggest single tax deduction most South Africans miss."

---

## AREA: Emotional Design

- **Habit loop score**: ADEQUATE (the "+R X to your 13th Cheque" animation is the strongest emotional moment in the app)
- **Day 47 survival**: AT RISK
- **Trust score**: BUILDING
- **South African fit**: GOOD
- **Core issue**: The app has one great emotional moment -- the gold number growing when a work expense is added (lines 635-640). That is genuinely satisfying. But this is the ONLY emotional moment. The rest of the app feels like a dashboard. There is no celebration when a user hits a milestone ("You've claimed R5,000 this year!"), no acknowledgement of consistency ("Third week in a row logging expenses -- nice one"), no personalised warmth from Tjommie on the home screen.

  The Dreams section is the closest thing to an emotional anchor, but it is generic. "Return flights to Cape Town" is meaningless to someone in Cape Town. "Six months of groceries" is depressing, not aspirational. The dreams need to be set by the user, not by the developer.

  The "Living Money Left" card (line 495) turns red when over budget. This is correct behaviour, but the transition from green to red is abrupt and shaming. There should be a warning zone (amber at 80%) and the language should be constructive, not just a number in red.

  The Tjommie component (line 179) is visually small and easy to miss. For the personality layer that is supposed to make the app feel human, Tjommie's presence on screen is minimal. The gold "T" icon at 26x26px gets lost in the visual hierarchy.

- **Redesign recommendation**:
  1. Add milestone celebrations: R1,000 claimed, R5,000 claimed, R10,000 claimed. Each gets a unique animation and Tjommie message.
  2. Add a streak counter: "You've logged expenses X weeks in a row." Small but powerful for habit formation.
  3. Let users set their own dream. "What would you do with your 13th Cheque?" Free text or choose from options. Show that specific dream on the home screen with a progress ring.
  4. Add an amber warning state at 80% budget usage before going red at 100%.
  5. Make Tjommie's home screen presence bigger and more contextual. First visit: "Right [name], let's find your money. Want to start with your work expenses or set up your monthly budget first?" Returning visit: "You logged 3 expenses last week. Your 13th Cheque grew by R450. Let's keep going."

---

## AREA: Onboarding Flow

- **Habit loop score**: WEAK (no trigger established, no habit commitment)
- **Day 47 survival**: N/A (this is Day 1 only)
- **Trust score**: BUILDING (the employment type warning for salaried employees is excellent)
- **South African fit**: GOOD
- **Core issue**: The onboarding flow has 6 steps: Language -> Promise -> Employment Type -> Money (name, occupation, income) -> Deductions -> Budget. This is too long. The budget step in particular (Step 4 of 4, lines 363-406) is a full budget-building exercise with 7 category sliders. This is a high-friction task that has NOTHING to do with the primary value proposition ("find your 13th Cheque"). The user came here to find tax money, and step 4 of 4 is asking them to build a personal budget. This is where abandonment will spike.

  The promise screen (lines 231-253) is strong. The animated R18,400 number and the "13th Cheque" framing are immediately compelling. But the impact dissipates across the next 4 screens of form-filling.

  The "Step X of 4" label counts from 1 to 4 but there are actually 6 screens before the user reaches the app (Lang, Promise, EmpType, Money, Deductions, Budget). The user sees "Step 4 of 4" on the Budget screen, taps "Find my 13th Cheque", and then gets ANOTHER screen (the Ready screen). The count is dishonest and erodes trust.

  The income field (line 307) is a raw `type="number"` input. On mobile, this triggers a numeric keyboard but with no currency formatting. The user types "25000" and sees "25000" -- not "R 25,000". This does not feel like money. This feels like a form.

  After completing onboarding, the Ready screen (lines 412-443) shows the estimated 13th Cheque and some dream items, then a single button: "Start building my 13th Cheque." Tapping this drops the user on the home screen with zero guidance. Tjommie says "No expenses logged yet. Every work slip you add grows your 13th Cheque. Tap + to start." -- but this is a small tip card that competes with the dashboard's visual density. The user has just completed a 6-step setup and is rewarded with... a dashboard. No clear first action. No "let's log your first expense together."

- **Redesign recommendation**:
  1. Cut onboarding to 4 actual steps: Promise -> Employment Type + Name + Occupation -> Income (with formatted currency input) -> Deduction Selection. Move budget setup to a LATER moment, triggered by Tjommie after the user has logged their first few expenses.
  2. Fix the step counter to match reality. If there are 4 steps, say "Step X of 4." Do not lie.
  3. Replace the raw number input with a formatted currency input: display "R 25,000" as the user types, with comma separators. Include quick-select buttons (R15,000 / R25,000 / R35,000 / R50,000) for common salary ranges.
  4. After the Ready screen, Tjommie must immediately guide the user to their first action: "Right [name], let's find your money. As a [occupation], here are expenses you can probably claim -- want me to walk you through them?" This must be a guided first-expense flow, not a generic dashboard.
  5. Add reminder setup as the LAST onboarding step or the first post-onboarding Tjommie prompt: "When should I remind you to log your expenses?"

---

## AREA: Returning User Experience

- **Habit loop score**: BROKEN (no trigger mechanism whatsoever)
- **Day 47 survival**: NO
- **Trust score**: NEUTRAL
- **South African fit**: NEEDS WORK
- **Core issue**: There is no difference between what the user sees on their 2nd visit and their 47th visit. The home screen (lines 445-537) always shows the same dashboard layout: greeting, 13th Cheque card, Living Money card, Savings card (if set), Tjommie tip, recent expenses. None of this changes based on context. The app does not acknowledge time passing. It does not know if the user has been away for a day or a month.

  There are no notifications. No reminders. No weekly digest. No "you haven't logged expenses in 5 days" nudge. No payday prompt. No end-of-month review. The app is entirely passive -- it sits and waits for the user to remember it exists.

  The Tjommie tip on the home screen (lines 510-513) has exactly two states: "No expenses logged yet" or a generic "Every R100 you claim saves you RX." Neither of these gives the returning user a reason to engage. After 47 days, both messages are stale.

  There is no weekly or monthly review flow. The Spending screen shows the current month's budget usage, but there is no "end of month" summary, no "here's how you did" moment, no comparison to last month.

  Load shedding and data costs are completely unaddressed. The app requires a network connection for Tjommie chat (Anthropic API call on line 797) but has no offline fallback. During load shedding, if a user opens the Tjommie tab, they will see a network error. The home screen works offline (localStorage), but the most personal, human part of the app -- the chat -- fails silently.

- **Redesign recommendation**:
  1. Add a reminder system: weekly reminder on a user-chosen day/time. "Time to log your expenses for the week." This is the trigger mechanism the habit loop needs.
  2. Tjommie's home screen message must be contextual and time-aware:
     - First visit: "Let's log your first expense together."
     - Been away 3+ days: "Hey [name], you haven't logged anything since [date]. Any work expenses this week?"
     - Payday (if known): "Payday! A good time to check your budget for the month."
     - Near month end: "Almost the end of the month. You're [over/under] budget by [X]. Here's your spending breakdown."
     - Near tax year end (Feb): "28 Feb is coming! Make sure you've captured everything. Want me to check what you might be missing?"
  3. Add offline-capable Tjommie responses. Pre-generate 10-15 contextual tips based on the user's data that do not require an API call. Show these when offline.
  4. Build a monthly review flow: at the start of each month, Tjommie offers a "Last month's review" card. Spending vs budget, 13th Cheque growth, streak status.

---

## AREA: End-of-Year Moment

- **Habit loop score**: WEAK (no celebration, no summary, no export)
- **Day 47 survival**: N/A (annual event)
- **Trust score**: SPENDING (the most important moment in the product journey is completely absent)
- **South African fit**: NEEDS WORK
- **Core issue**: The end-of-year moment does not exist. There is no February screen. There is no annual summary. There is no PDF export. There is no "congratulations, here's what you built" celebration. The tax year progress bar (line 484) counts toward 28 Feb, but when 28 Feb arrives... nothing happens.

  This is the emotional climax of the entire product. The user has been logging expenses for 12 months. Their 13th Cheque number has been growing. And when the tax year ends, the app should celebrate that achievement, produce a usable summary for their tax practitioner, and set up the next year. Instead, the progress bar hits 100% and the dashboard looks exactly the same.

  There is also no "Download my tax summary" button anywhere. The user has no way to extract their data. A year of diligent tracking produces... nothing portable. This is a betrayal of the user's investment.

- **Redesign recommendation**:
  1. Build a year-end celebration screen that triggers when the tax year progress hits 100% (or when the user taps the 13th Cheque card in late February). Show the total 13th Cheque estimate with a satisfying animation, a breakdown by category, and the dream items it could cover.
  2. Add a "Download tax summary" button that generates a formatted summary: user name, occupation, tax year, total deductions by category, estimated refund, disclaimer. This is what the user hands to their tax practitioner.
  3. Include a "Start next tax year" flow that rolls the user forward, acknowledges their achievement, and sets up a new empty year.
  4. Send a push notification (or in-app prompt) in early March: "New tax year! Let's find your next 13th Cheque."

---

## AREA: Habit Loop (Overall Assessment)

- **Trigger**: ABSENT. No notifications, no reminders, no external trigger. The only trigger is the user's own memory. This is the weakest possible trigger category.
- **Action**: TOO HEAVY. Adding an expense requires: open app -> tap + -> select work/personal -> enter amount -> enter description -> select category -> select date -> save. That is 8 steps for a single expense. This should be 3-4 steps maximum for the most common case.
- **Reward**: ADEQUATE for work expenses (the "+R X to your 13th Cheque" moment), WEAK for personal expenses (just a confirmation screen). The reward needs to be immediate, visible, and growing. The current work expense reward works. The personal expense reward does not.
- **Investment**: MODERATE. The more expenses the user logs, the more accurate their 13th Cheque estimate becomes, and the more useful their spending data is. But this is passive investment -- the user does not feel it. There should be explicit "your data is making Tjommie smarter" moments.

**Overall Habit Loop Score**: BROKEN. Without a trigger mechanism, the loop cannot start. A strong reward means nothing if the user never opens the app.

---

## AREA: The Day 47 Test

On Day 47, the user has logged ~30 expenses. They have seen the home dashboard dozens of times. The novelty of the animated gold number is gone. There are no notifications reminding them to open the app. The Tjommie tip on the home screen says the same thing every time. The budget tracking is useful but not compelling. The 13th Cheque number is growing slowly.

**Why does the user open the app today?**

There is no clear answer. The app does not give the user a reason to return. The user who opens the app on Day 47 is doing so out of discipline, not delight. And discipline-driven retention has a half-life measured in weeks.

**Day 47 survival: NO** in the current state.

To survive Day 47, the app needs:
1. A weekly reminder (trigger)
2. A 2-tap quick-add flow (reduced friction)
3. A weekly progress summary from Tjommie (reward)
4. Milestone celebrations (surprise reward)
5. A monthly review flow (investment payoff)

---

## AREA: South African Daily Reality Fit

- **Habit loop score**: N/A
- **Day 47 survival**: AT RISK
- **Trust score**: NEUTRAL
- **South African fit**: NEEDS WORK
- **Core issue**: Several South African realities are not addressed:

  1. **Load shedding**: Tjommie chat requires an active internet connection (API call to Anthropic). During load shedding, wifi drops. The most personal part of the app becomes unavailable exactly when people have time to use their phone (battery backup, no power for TV/work). Add offline Tjommie tips.

  2. **Data costs**: The app loads Google Fonts via @import on every render (line 106). This is approximately 50-100KB of data. For a user on a 1GB monthly plan, this is noticeable. The Anthropic API call for Tjommie chat sends and receives JSON, which is light, but repeated chats add up. The app should be data-conscious: cache fonts, minimise API calls, show "this will use data" before chat.

  3. **Informal income**: The income model asks for a single "monthly gross income" (line 307). Many South Africans have a salary PLUS hustle income -- selling airtime, freelance design work, taxi driving on weekends. The single-income model under-represents the real financial picture. Consider a "Do you earn extra income besides your main job?" prompt.

  4. **Transport**: The budget category "Fuel" (line 70) only serves car owners. Millions of South Africans use minibus taxis (cash, no receipts), Uber, or buses. The transport category should be "Transport" with sub-options: Fuel, Taxi, Uber/Bolt, Bus/Gautrain.

  5. **Family support**: There is no budget category for "Family support" or "Money sent home." For millions of South Africans, this is a non-negotiable monthly expense -- often 10-20% of income. Its absence makes the budget feel incomplete and out of touch.

  6. **Taxi economy and travel deductions**: Work travel deductions (line 56) assume there are receipts. Taxi commuters have no receipts. The app needs to either explain how to track taxi costs or offer a logbook-style daily capture.

  7. **Language**: The app offers language selection (line 202-228) with English as the only available option and four others "coming soon." This is honest, which is good. But the UI takes up a full screen for a choice that currently has only one option. This should be a brief acknowledgement, not a full step.

- **Redesign recommendation**:
  1. Add offline Tjommie tips that work without an API call.
  2. Replace "Fuel" with "Transport" and add sub-categories: Fuel, Taxi, Uber/Bolt, Bus/Train.
  3. Add "Family Support" as a budget category.
  4. Add secondary income prompt: "Do you have any other income besides your main job?"
  5. Skip the language screen when only one language is available. Show a small "English | More languages coming soon" toggle instead of a full-screen chooser.
  6. Add a "Travelling for work?" section that explains logbook requirements for taxi/Uber commuters who want to claim travel deductions.

---

## AREA: White Screen Bug / Navigation

- **Habit loop score**: N/A
- **Day 47 survival**: NO (if the app breaks, the user never comes back)
- **Trust score**: SPENDING (a white screen destroys trust instantly)
- **South African fit**: N/A
- **Core issue**: The `monthKey` function is used on line 453 before it is defined on line 459. This will cause a runtime error in strict mode. The `S_Home` component references `monthKey` as a function call within the component body, but defines it as a const inside the same component body after its first use. While JavaScript hoisting may handle this in some contexts, this is a fragile pattern that could cause rendering failures.

  More critically, the navigation system uses a navStack (line 934) that pushes the current screen before navigating. The `go` function (line 951) always pushes to the stack, meaning repeated navigation between tabs (Home -> 13th -> Home -> 13th) builds an ever-growing stack. The `back` function (line 956) pops from this stack. This can lead to unexpected navigation behaviour and, in edge cases, the app showing no content (white screen) when the stack state becomes inconsistent.

  The `S_Ready` screen's `onDone` (line 999) clears the navStack and sets screen to "home." But if the user had navigated away from the ready screen through some other path, the state could be inconsistent.

- **Redesign recommendation**:
  1. Move `monthKey` function outside `S_Home` or define it before use.
  2. Replace the navStack pattern with a proper state machine or router. Tab navigation should not push to a stack -- only sub-screens (Add, Settings, History, Tjommie chat) should use back navigation.
  3. Add a fallback: if `screen` does not match any known screen, render the home screen. Never render nothing.

---

## THE ONE THING

**Add a weekly reminder system and make Tjommie's home screen message contextual and time-aware.**

This is the single change that would most improve long-term retention. Without a trigger, the habit loop cannot start. Without contextual messages, the returning user has no reason to engage. A weekly push notification ("Time to log your expenses -- tap to add this week's work costs") combined with a Tjommie message that references the user's actual situation ("You logged 4 expenses last week and your 13th Cheque grew by R320 -- nice going!") transforms the app from a passive tracker into an active assistant. This is the difference between Day 47 survival and Day 47 abandonment.

---

## MISSING FEATURES

Users will ask for these within the first month of real use:

1. **Receipt scanning / camera upload** -- "Can I just take a photo of the slip?" (This is the #1 feature request for any expense tracker.)
2. **Export / PDF download** -- "How do I give this to my tax person?"
3. **Reminders / notifications** -- "Can it remind me to log expenses?"
4. **RA (Retirement Annuity) tracking** -- "Where do I add my RA contribution?" (This is the largest single deduction most people miss.)
5. **Past expense catch-up** -- "I started in August but I've got slips from April."
6. **Multi-income support** -- "I have a salary and a side hustle."
7. **Edit expense** -- Currently, expenses can only be deleted, not edited. Typos require delete-and-recreate.
8. **Search expenses** -- After 50+ expenses, finding a specific one by scrolling is painful.
9. **Monthly comparison** -- "Am I spending more this month than last month?"
10. **Data export (CSV)** -- Power users will want their raw data.

---

## FEATURE GRAVEYARD

Features in the current app that will not earn their keep -- consider cutting or deprioritising:

1. **Language selection screen** -- Only English works. Remove the full-screen step. Replace with a small banner or setting. It currently adds friction to onboarding for zero functional value.
2. **Savings goal card on home screen** -- The savings goal is a nice idea but it is disconnected from the core value prop (finding your 13th Cheque). It adds visual clutter to the home screen. Move it to the Spending screen only.
3. **Pre-defined Dreams list** -- The static list of dreams (Cape Town flights, weekend away, etc.) is generic and will feel impersonal after the first viewing. Either let users set their own dream or remove it. A personalised "Your 13th Cheque could pay for your [user's dream]" is 10x more motivating than a generic list.
4. **Budget setup in onboarding** -- This should not be in onboarding. It is friction that has nothing to do with the primary value proposition. Move it to a post-onboarding flow triggered after the user has logged 5+ expenses.

---

## DAILY HABIT RECOMMENDATION

**The daily engagement mechanic should be the "Quick Add" flow, triggered by a smart notification.**

Here is the loop:

1. **Trigger**: Weekly notification on user's chosen day (default: Sunday evening). Message: "Hey [name], time to log this week's expenses. Anything you spent on work?" Additional triggers: payday notification, near-budget-limit alert, end-of-month review prompt.

2. **Action**: The notification deep-links to a "Quick Add" screen. One tap to select category (large icons, not a dropdown). One tap to enter amount. One tap to save. Three taps total. Under 10 seconds.

3. **Reward**: After saving, the 13th Cheque number animates upward with the gold glow. Tjommie says something specific: "That R350 phone bill just earned you R91 back from SARS. Your 13th Cheque is now R4,210." The user FEELS the money being found.

4. **Investment**: After 4 weeks, Tjommie shows: "Based on your pattern, I predict your 13th Cheque will be R8,400 by February. Here's what that could cover..." The prediction gets more accurate over time, creating value that only exists because the user invested their data.

This loop -- weekly trigger, 10-second action, gold-number reward, growing prediction -- is the daily habit. It works because it is fast, feels like money being found (not data being entered), and gets more valuable over time. It survives Day 47 because the prediction gets better, the 13th Cheque number is always growing, and the weekly rhythm becomes automatic.

---

## Severity Summary

| Issue | Severity |
|-------|----------|
| No reminder / notification system | CRITICAL |
| No receipt upload / camera capture | CRITICAL |
| No post-onboarding guided first action | CRITICAL |
| White screen risk from navigation bugs | CRITICAL |
| Budget categories missing SA reality (Housing, Transport, Family Support) | HIGH |
| Income input is raw number field, not formatted currency | HIGH |
| Category comes after amount in Add Expense | HIGH |
| No career-aware deduction suggestions after occupation entry | HIGH |
| No mid-year catch-up flow | HIGH |
| No annual tax summary / PDF export | HIGH |
| No RA contribution category | HIGH |
| Tjommie home screen message is generic, not contextual | HIGH |
| No milestone celebrations | HIGH |
| No monthly review flow | MEDIUM |
| Language screen is unnecessary friction | MEDIUM |
| Dreams list is generic, not personalised | MEDIUM |
| No offline Tjommie fallback | MEDIUM |
| No expense edit (only delete) | MEDIUM |
| No expense search | LOW |
| Savings goal card clutters home screen | LOW |
| No data export (CSV) | LOW |

---

*End of Product & UX Designer Agent Report -- Iteration 1*
