# User Agent Report -- Iteration 1

**Reviewer persona:** Lerato, 34, graphic designer, Johannesburg. Samsung Galaxy A35, prepaid data. Has deleted two financial apps before. Occasionally freelances. Not a tax expert.

**Date reviewed:** 2026-02-20
**File reviewed:** `thirteenth-cheque-v2.jsx`

---

## SCREEN: Language Selection (S_Lang)

- **Friction score:** 2/5
- **Confusion points:**
  - Only English is available. Four other languages are listed but greyed out. A user whose home language is isiZulu sees her language, taps it, and nothing happens. The disabled state is only at 40% opacity -- on a Samsung mid-range screen with adaptive brightness turned down (indoors, saving battery), that distinction is barely visible. She may tap isiZulu three or four times before realising it is not available.
  - There is no explicit "Select English" label or confirmation. You just tap English and proceed. It works, but there is no micro-feedback -- no highlight, no tick animation, nothing to confirm "you chose English."
  - The 🇿🇦 flag is repeated on every language row. This is redundant -- it adds no information and visually clutters the list.
- **Missing guidance:**
  - No explanation of why other languages are unavailable or when they will be added. "Coming soon" is vague. A date or "sign up for Zulu notifications" would build trust.
  - No skip option. If I just want to get in, I have to understand that tapping English is the way forward.
- **Emotional read:** Slightly underwhelming. I expected a warmer greeting. This feels like an install wizard, not a friend introducing themselves.
- **Would they continue?** YES -- but the isiZulu speaker may close the app here feeling excluded.
- **Fix suggestion:** Add a brief welcome line from Tjommie above the language list: "Howzit! Let's get you set up." Make the disabled state more obvious (add a lock icon or a clear "Not yet available" tag instead of subtle opacity). Add a "Notify me when isiZulu is ready" link.

**Severity: MEDIUM** -- Exclusion risk for non-English speakers; low friction for English speakers.

---

## SCREEN: Promise / Value Proposition (S_Promise)

- **Friction score:** 1/5
- **Confusion points:**
  - "SARS owes the average South African" -- the 52-year-old domestic worker in Cape Town does not know what SARS stands for. It is never expanded on this screen. She might think it is a scam.
  - The number R18,400 animates in, which is visually impressive, but there is no source or context for this claim. Where does this number come from? Is this per year? Per person? For someone earning what?
  - The phrase "It's called your 13th Cheque" assumes the user has never heard this term. That is correct for most people, but the explanation is a single paragraph. A 28-year-old Uber driver reading "tax refund most people don't realise they're owed" may still not understand what a tax refund is.
- **Missing guidance:**
  - No explanation of what SARS is (South African Revenue Service).
  - No sense of how long this setup will take. "Show me mine" is compelling, but I do not know if this is a 2-minute or 20-minute process.
  - No privacy signal. The app is about to ask for my income. There should be an early trust seed here: "Your data stays on your phone" or similar.
- **Emotional read:** Excited, curious. The animated number is satisfying. The gold on dark navy looks premium. I want to know if I am owed money. This screen does its job emotionally.
- **Would they continue?** YES -- strong hook.
- **Fix suggestion:** Add a one-liner below the number: "That's money from the South African Revenue Service (SARS) -- and this takes about 3 minutes to set up." Add a small privacy line: "Everything stays on your phone."

**Severity: LOW** -- Good screen overall, minor clarity improvements needed.

---

## SCREEN: Employment Type (S_EmpType)

- **Friction score:** 2/5
- **Confusion points:**
  - "I earn commission" -- what if I earn a salary PLUS commission? This is extremely common in South Africa (car sales, insurance, retail). There is no mixed option. I am forced to choose one and I do not know which one matters more for tax.
  - The sub-text "Variable or performance-based pay" under commission does not clarify the salary+commission case.
  - "employer deducts PAYE" -- the 52-year-old domestic worker does not know what PAYE means. It is not explained. She might pick "I work for myself" because she does not recognise the acronym.
  - The red warning for salaried employees ("stricter rules -- SARS expects your employer to cover most work costs") is alarming. A salaried person reading this might think "so this app is not for me" and close it. The warning does not say "but there are still things you can claim" -- it only says what you cannot do.
  - Tjommie says "Be honest -- it can only help you." This is slightly patronising. It implies I might lie. A better framing would be neutral.
- **Missing guidance:**
  - No "not sure" option or help link. Many South Africans genuinely do not know their employment classification. Contract workers, part-time employees, gig workers -- the lines are blurry.
  - The salaried warning lacks a follow-up reassurance. It should say "but you can still claim X, Y, Z."
- **Emotional read:** Slightly anxious. The warning for salaried users creates doubt. The tax jargon (PAYE) creates confusion. But the overall design is clean and the choices are clear for someone who does know their type.
- **Would they continue?** MAYBE -- salaried users may feel discouraged by the red warning. Confused users with no "help me decide" option may guess wrong or close the app.
- **Fix suggestion:** (1) Add a 4th option: "Mix of salary and commission" or "I'm not sure -- help me figure it out." (2) Expand PAYE on first use: "your employer deducts tax (PAYE) from your payslip." (3) Change the salaried warning to include a positive: "Stricter rules apply, but salaried employees can still claim travel, professional fees, and more. We'll show you exactly what."

**Severity: HIGH** -- This is the first decision point and it has the highest confusion-to-consequence ratio. Getting this wrong changes the entire app experience. There is no way to come back and change it without resetting all data.

---

## SCREEN: Your Money (S_Money)

- **Friction score:** 4/5
- **Confusion points:**
  - The income input is a raw `type="number"` field. On a Samsung Galaxy A35, this opens a numeric keypad. But typing "25000" with no formatting -- no commas, no "R" prefix visible while typing -- feels wrong. I type 25000 and see "25000". Is that R25,000 or R250.00? The R prefix is only in the label, not in the input.
  - The default value is 25000, pre-filled. This is a problem. A user may not even change it, assuming it is a placeholder that will clear. Or they may feel judged -- "the app thinks I earn R25,000." For the domestic worker earning R6,000/month, seeing R25,000 pre-filled is alienating.
  - "Monthly gross income" -- many South Africans do not know the difference between gross and net. Domestic workers, Uber drivers, freelancers -- they know what hits their bank account, not what the gross figure is. There is no tooltip or explanation.
  - "Tax bracket: 26%" and "Monthly tax: ~R1,619" appear below the input. These are real tax terms with real numbers, presented without explanation. What is a tax bracket? Why should I care about the percentage? The 28-year-old Uber driver sees "26%" and has no idea what it means or what to do with that information.
  - The "Estimated 13th Cheque" card shows a number based on "typical deductions at your income." This is vague. Typical for whom? It creates an expectation that may not be met, which could feel like a broken promise later.
  - "What do you do?" occupation field has no impact visible on this screen. Why am I filling it in? What does the app do with my job title?
- **Missing guidance:**
  - No explanation of "gross" vs "net" income.
  - No explanation of what the tax bracket percentage means.
  - No explanation of why the app needs my income (to calculate your potential refund).
  - No Tjommie on this screen. He appeared on the previous screen, then vanished when I need him most.
  - No indication of what happens if I get the number wrong ("you can always update this later in settings").
- **Emotional read:** Frustrated and exposed. Entering my income into an app I just downloaded feels vulnerable. There is no reassurance about data privacy. The raw number input is fiddly. The tax jargon is intimidating.
- **Would they continue?** MAYBE -- the estimated 13th Cheque number at the bottom is motivating (it shows me money), but the friction of the income field and the missing context may lose less confident users.
- **Fix suggestion:** (1) **CRITICAL:** Replace the raw number input with a formatted currency field -- show "R 25,000" as the user types, with commas. Remove the pre-filled 25000 and use a placeholder instead. (2) Add Tjommie: "Don't stress about getting this exact -- your payslip has this number, or just estimate. You can always change it later." (3) Replace "Monthly gross income" with "What you earn before tax each month (your gross pay)" with a small "What's gross pay?" toggle that says "The amount on your payslip before deductions." (4) Hide or simplify the tax bracket display -- show "Your tax rate" without the word "marginal." (5) Add a small lock icon and "Stays on your phone" below the income field.

**Severity: CRITICAL** -- Income input is the most sensitive and friction-heavy field in the entire app. A raw number input with a pre-filled value, no formatting, no privacy assurance, and unexplained tax jargon is a wall. This is where users who deleted two financial apps before will delete this one too.

---

## SCREEN: Work Deductions (S_Deductions)

- **Friction score:** 2/5
- **Confusion points:**
  - "Home Office (Rent)" and "Home Office (Utilities)" -- many users do not have a home office. But these are presented alongside phone/internet and equipment, which almost everyone has. Users may toggle things on that do not apply because they do not fully understand the criteria (SARS requires exclusive use of a dedicated room).
  - "Bank Charges" as a deduction category -- most salaried employees cannot claim this. But the toggle is available. (Though greyed out for salaried? Actually it is NOT in the restricted set for salaried -- bank_charges is pre-enabled for salaried users. This seems incorrect for Section 23(m) employees.)
  - "Client Entertainment" description says "Business meals & hosting" -- many users will toggle this on thinking "I sometimes buy my colleagues lunch." That is not what SARS considers business entertainment.
  - The toggles are custom-styled but small. On a mid-range phone, the toggle target area (36x21px) is below the recommended 48x48px touch target. Users with larger fingers will miss.
  - Categories like "Professional Services" and "Subscriptions" are vague. What counts? The descriptions are one-liners. A user who does not know tax law will either toggle everything on (over-claiming, audit risk) or toggle everything off (missing money).
- **Missing guidance:**
  - No per-category help. Tapping a category should show a brief explanation: "For example: your accountant's fees, tax filing costs."
  - No indication of which categories typically yield the biggest refunds. If I am a graphic designer, which of these 13 categories matter most to me?
  - No career-aware suggestions. The app knows I am a graphic designer (from the previous screen), but it does not use that information to highlight relevant categories.
  - Tjommie says "Don't overthink this" -- but some of these categories have serious SARS implications. The app should help me think about them correctly, not tell me not to think.
- **Emotional read:** Overwhelmed. 13 categories, toggles, a warning (for salaried), and no clear guidance on which ones are safe. It feels like a test I have not studied for.
- **Would they continue?** YES -- Tjommie's encouragement and "you can change these any time" helps. The "Almost there" button implies the end is near, which motivates completion.
- **Fix suggestion:** (1) Use the occupation entered in the previous screen to surface a personalised shortlist: "As a graphic designer, these are your most likely deductions: Equipment & Software, Phone & Internet, Subscriptions. We've switched them on for you." (2) Add a "What counts?" tap-to-expand under each category with 2-3 real examples. (3) Increase toggle touch target to 48px minimum. (4) For categories with SARS restrictions (like home office), add a small warning icon: "Strict rules apply -- must be a dedicated room."

**Severity: HIGH** -- Users will either over-claim (audit risk) or under-claim (missed money) without proper guidance. The lack of career-aware suggestions is a major missed opportunity.

---

## SCREEN: Budget & Savings (S_Budget)

- **Friction score:** 3/5
- **Confusion points:**
  - The budget categories are too few and too generic for South African reality. There is no "Housing" (rent/bond), no "Utilities" (electricity, water), no "Transport" (fuel is there but not taxi fare or Uber), no "Insurance," no "School Fees," no "Family Support." These are the biggest expenses for most South African households. A budget tool that does not include rent is useless.
  - Savings goal input is another raw `type="number"` field with no formatting.
  - The budget limits are all editable number inputs. On mobile, editing 7 number fields in a row is tedious. Each tap opens the keyboard, you delete the default, type a new number, move to the next. This is the most form-like screen in the app and it feels like homework.
  - "Tjommie will coach you toward saving R33/day" -- this is a nice touch, but R33/day for R1,000/month does not match. R1,000/30 = R33.33, which rounds to R33. Fine. But R1,000 is a very low default savings goal relative to a R25,000 income. The app could suggest a reasonable starting point.
  - The "Budgeted R16,300 / R20,381" display does not clearly explain what happens if I am over budget. Is this a hard limit? A warning? Will Tjommie yell at me?
  - There is no "skip" option. What if I do not want to budget right now? I just want the 13th Cheque feature. Being forced through a budget setup adds friction for users who only care about the tax refund.
- **Missing guidance:**
  - No explanation of why budgeting matters for the 13th Cheque. The connection between tracking personal spending and getting a tax refund is not drawn.
  - No guidance on what reasonable budget limits look like at my income level.
  - No ability to add custom categories. If my biggest expense is "Data / Airtime" or "Sending money home" (a massive reality for millions of South Africans), there is no place for it.
- **Emotional read:** Tedious. This feels like the part of the app that makes people quit. The promise was "find your money." Now I am filling in budget spreadsheets. The connection to the exciting 13th Cheque is lost.
- **Would they continue?** MAYBE -- users motivated by the 13th Cheque number will push through. But many will enter random numbers just to get past this screen, making the budget feature useless.
- **Fix suggestion:** (1) **CRITICAL:** Replace budget categories with South African household reality: Housing, Utilities, Groceries, Eating Out, Transport, Medical Aid, Insurance, School Fees, Clothing, Entertainment, Savings, Family Support, Other. (2) Add a "Skip for now" option. Let people get to the 13th Cheque and come back to budgeting later. (3) Replace raw number inputs with sliders or preset options (R2,000 / R3,000 / R5,000 / custom) to reduce typing. (4) Add Tjommie: "This part is optional -- but the more I know about your spending, the better I can help you save."

**Severity: CRITICAL** -- Budget categories do not reflect South African reality. Missing rent/bond, utilities, transport, school fees, and family support makes the entire budget feature feel foreign. Many users will abandon here.

---

## SCREEN: Ready / Setup Complete (S_Ready)

- **Friction score:** 1/5
- **Confusion points:**
  - The potential 13th Cheque estimate is calculated with a formula (`annual * 0.09 * marginal * max(enabled,1) / 4`) that is opaque. The number shown may differ from the estimate on the Money screen, which could confuse users who remember the earlier figure.
  - "Your 13th Cheque could cover..." section shows dreams (flights, weekend away, laptop). These are aspirational, which is good, but the connection between "estimated refund" and "actual money in your pocket" is not explained. When do I get this money? How?
- **Missing guidance:**
  - No explanation of what happens next. "Start building my 13th Cheque" is a button, but what does "building" mean? Am I supposed to do something every day? Every week? Only when I have a receipt?
  - Tjommie says "Snap your slips as you go" but there is no camera/receipt feature in the app. This sets an expectation that is immediately broken.
  - No mention of when the tax year starts/ends in plain language. "Tax year ends 28 Feb" is stated, but "The tax year runs March to February" is clearer context.
- **Emotional read:** Excited and rewarded. The animated number, the dreams list, and Tjommie's message all create a positive feeling. This screen delivers on the promise from the opening. Good screen.
- **Would they continue?** YES -- strong emotional payoff.
- **Fix suggestion:** (1) Add a line about what to do next: "Start by logging your phone contract or a recent work purchase. Every rand counts." (2) Remove the "snap your slips" reference until receipt upload is built. (3) Show a simple timeline: "Log expenses as you go --> We calculate your refund --> Hand your summary to a tax practitioner in August."

**Severity: LOW** -- Good emotional screen, minor follow-through issues.

---

## SCREEN: Home (S_Home)

- **Friction score:** 2/5
- **Confusion points:**
  - The greeting "Good morning/afternoon/evening, [Name]" is generic. Tjommie's personality is not present here -- it reads like any banking app.
  - "Living Money R20,381 left this month" -- the term "Living Money" is not defined anywhere. Is this my salary minus tax? Minus savings? Minus work expenses? The number is derived from `income - tax/12` but this is not explained.
  - The "Savings" card shows the savings goal, not actual savings. The progress bar shows `livingLeft / savGoal` which conflates "money not yet spent" with "money saved." These are not the same thing.
  - The Tjommie tip when there are no expenses ("No expenses logged yet. Every work slip you add grows your 13th Cheque. Tap + to start.") is good. But on return visits when expenses exist, Tjommie says a generic "Every R100 you claim saves you RXX in tax." This is not personalised or actionable. Tjommie should reference what I did last time or suggest a specific next action.
  - The "Recent" expenses list shows dates in ISO format (2026-02-20). South Africans write dates as "20 Feb 2026" or "20/02/2026." ISO dates look technical and unfamiliar.
  - The "13th" label on the nav bar is cryptic. First-time users who skipped through setup quickly may not remember what "13th" refers to.
- **Missing guidance:**
  - On first visit after setup, there should be a strong directional prompt: "Right [Name], let's find your money. Want to start with your work expenses or set up your monthly budget first?" Instead, there is just a Tjommie tip. Not enough.
  - No mid-year catch-up prompt. It is February 2026 -- the tax year is almost over. The app should ask: "Have you had work expenses earlier this year you haven't tracked yet?"
  - No reminder setup. There is no way to set a weekly reminder to log expenses.
- **Emotional read:** Promising but passive. The 13th Cheque card is visually strong, the gold number is compelling. But after the excitement of setup, the home screen feels like a dashboard waiting for me to figure out what to do. It needs Tjommie to drive action.
- **Would they continue?** MAYBE -- users who are self-motivated will explore. Users who need guidance will stare at the dashboard and not know what to tap first.
- **Fix suggestion:** (1) First visit: Tjommie should give a specific directive, not a tip. "Let's start with your phone contract -- that's usually the biggest deduction people miss. Tap + to log it now." (2) Returning visits: Reference the last action: "You logged R450 for data yesterday. That added R117 to your 13th Cheque. Keep going." (3) Format dates as "20 Feb" not "2026-02-20." (4) Rename "13th" nav label to "Refund" or "13th Cheque" (abbreviations lose meaning).

**Severity: HIGH** -- The home screen is where users return every session. If it does not actively direct them, they will open the app, stare, and close it. This is the retention screen.

---

## SCREEN: 13th Cheque Detail (S_Cheque)

- **Friction score:** 2/5
- **Confusion points:**
  - "from R0 in work deductions - 26% marginal rate" -- the phrase "marginal rate" appears again without explanation. For a user who does not know tax, this is noise.
  - When no expenses are logged, the screen shows "R 0" in large gold text with "from R 0 in work deductions." This feels deflating. An empty state should be motivating, not a zero.
  - The "dreams" section only appears when cheque > 0. On first visit with no expenses, this section is hidden. But this is exactly when aspirational motivation is most needed.
  - The "+ Add work expense" button at the top right is small (6px 12px padding, 11px font). For the primary action on this screen, it should be larger and more prominent.
  - There is no "Download my tax summary" button. No way to export or share this information with a tax practitioner.
- **Missing guidance:**
  - No explanation of how the refund estimate is calculated. Users may distrust the number if they cannot understand where it comes from.
  - No guidance on what a "work expense" is for someone who has never claimed before.
  - Empty state Tjommie says "Start with your phone contract" -- this is good, specific advice. More of this throughout the app.
- **Emotional read:** When populated with expenses, this screen is deeply satisfying -- the growing gold number, the category breakdown, the dreams list. When empty, it is bleak. The empty state needs more energy.
- **Would they continue?** YES (if populated), MAYBE (if empty -- the zero is discouraging).
- **Fix suggestion:** (1) Replace "marginal rate" with "your tax rate" everywhere. (2) In the empty state, show the dreams list anyway: "Log your first work expense and start building toward these." (3) Make the "+ Add work expense" button full-width and prominent. (4) Add a "Download tax summary" button for users with expenses logged.

**Severity: MEDIUM** -- Solid screen when populated, needs better empty state and terminology.

---

## SCREEN: Add Expense (S_Add)

- **Friction score:** 3/5
- **Confusion points:**
  - Amount comes BEFORE category. This is backwards. I need to say "what did I buy" before "how much." Real-world flow: "I bought data" --> "it was R399." The current flow asks for the number first, which requires me to hold the amount in my head while selecting a category.
  - Amount is another raw `type="number"` input with no currency formatting.
  - The work/personal toggle at the top is not immediately clear. "Builds 13th Cheque" and "Tracks budget" are helpful sub-labels, but on a quick glance the two boxes look like categories, not a type selector.
  - The category dropdown (`<select>`) uses the default browser select element, which on Samsung Android will look like a native picker -- inconsistent with the app's custom styling.
  - No receipt/camera upload button. Tjommie said "snap your slips" during setup, but there is no way to do it. This is a broken promise.
  - The date input defaults to today, which is correct. But there is no easy way to add past expenses (e.g., "I bought a laptop in November"). The date picker works, but there is no prompt or encouragement to log historical expenses.
  - After saving, the success screen says "Logged!" with a green checkmark. For work expenses, it shows "+ R[amount] added to your 13th Cheque" which is the emotional reward moment. This is good. But for personal expenses, it just says "R[amount] logged against your [category] budget" -- flat and unrewarding. Every expense log should feel like progress, not admin.
- **Missing guidance:**
  - No Tjommie on this screen. He should be here with contextual tips: "Remember, your phone data is a work expense if you use it for work."
  - No guidance on what counts as a work expense vs personal expense for borderline cases (phone used for both work and personal, car used for both, etc).
  - No receipt upload option despite Tjommie's earlier promise.
- **Emotional read:** Functional but cold. This is the core action of the entire app -- logging an expense -- and it feels like a form. The success screen for work expenses is good, but the journey to get there is not enjoyable.
- **Would they continue?** MAYBE -- users will log a few expenses, but the friction of opening the app, tapping +, filling in 4 fields, and saving is enough to make people "do it later" and then never do it.
- **Fix suggestion:** (1) **CRITICAL:** Reorder fields: Category first, then amount, then description, then date. (2) Add a receipt/camera button at the top with a "scan" animation (even if it just auto-fills test data for the prototype). (3) Add a Tjommie tip on this screen based on the selected category. (4) Format the amount input with currency display. (5) Make the personal expense success screen more rewarding: "Nice -- you're R[amount] closer to understanding your spending this month."

**Severity: HIGH** -- The core action of the app has too much friction and field ordering is wrong. Missing receipt upload breaks Tjommie's earlier promise.

---

## SCREEN: My Spending (S_Spending)

- **Friction score:** 2/5
- **Confusion points:**
  - "Money flow this month" shows Gross income, Tax (PAYE estimate), Work expenses, Living money, Spent so far, Remaining. This is a lot of numbers for one card. Many users will glaze over this. The hierarchy of information is flat -- every line looks the same.
  - "Work expenses" is shown as a deduction from living money. This is technically correct (you spent the money), but it conflicts with the 13th Cheque framing where work expenses are presented as positive (they grow your refund). Seeing work expenses as a negative number here is confusing.
  - Budget categories are the same inadequate set from setup: Groceries, Eating Out, Fuel, Entertainment, Clothing, Medical, Other. No rent. No utilities. The "Other" category will be a dumping ground.
- **Missing guidance:**
  - No guidance on what to do if over budget. The red "over budget" label is punitive. Tjommie should offer help: "Looks like entertainment is running hot this month. Want me to suggest where to trim?"
  - No way to edit budget limits from this screen. I have to go to Settings, but settings only shows a read-only view. There is actually NO way to edit the budget after setup without resetting all data.
- **Emotional read:** Informative but passive. It tells me where my money went, but does not help me make decisions. The budget bars turning red feel punitive, not helpful.
- **Would they continue?** YES -- this screen serves its purpose, but it does not drive engagement.
- **Fix suggestion:** (1) Use the corrected South African budget categories. (2) Make budget limits editable from this screen (tap to edit). (3) Add Tjommie tips when over budget. (4) Visually differentiate work expenses -- show them as positive (they earn refund) rather than as a deduction from living money, or at least flag them with the gold colour and a note.

**Severity: MEDIUM** -- Functional but not actionable. Budget categories are inadequate.

---

## SCREEN: Tjommie Chat (S_Tjommie)

- **Friction score:** 2/5
- **Confusion points:**
  - The chat requires an API call to Anthropic. This uses data. On a prepaid plan with R8 left, each message costs money. There is no warning about data usage.
  - The API call sends user financial data (income, expenses, occupation) to an external server. There is no privacy notice or consent for this. The 45-year-old teacher in Pretoria who is suspicious of giving a random app her income details would be horrified if she knew her data was being sent to an API.
  - Quick question buttons disappear after the first message is sent. If I want to ask a preset question after chatting, I cannot.
  - Error handling: "Ag, something went wrong. Try again?" is appropriately South African and friendly. Good.
  - API key: The code calls `https://api.anthropic.com/v1/messages` but there is no API key visible in the code. The request will fail unless the key is injected elsewhere. In the prototype, every chat message will fail silently.
- **Missing guidance:**
  - No indication that this uses internet/data.
  - No disclaimer that Tjommie is an AI and not a registered tax practitioner.
  - No indication of what Tjommie can and cannot help with.
- **Emotional read:** Warm and personal when it works. The chat interface is clean, the quick questions are good starting points. Tjommie's personality comes through. But the data/privacy concerns are serious.
- **Would they continue?** YES (if the chat works and they have data), NO (if it fails or they are data-conscious).
- **Fix suggestion:** (1) Add a small disclaimer at the top of the chat: "Tjommie is an AI assistant, not a tax advisor. Uses mobile data." (2) Add a persistent quick-actions bar. (3) Address the API key issue for the prototype (either mock responses or handle the auth).

**Severity: HIGH** -- Privacy concern around sending financial data to an external API without disclosure. Data cost concern for prepaid users.

---

## SCREEN: Settings (S_Settings)

- **Friction score:** 3/5
- **Confusion points:**
  - Settings is READ-ONLY except for the reset button. I cannot change my name, income, occupation, employment type, or savings goal after setup. If I made a mistake during setup (very likely given the friction on those screens), my only option is to reset ALL data and start over.
  - "Marginal tax rate: 26%" is shown without explanation. Again, jargon.
  - The disclaimer "provides estimates for guidance only and does not constitute professional tax advice" is good and necessary. But it is buried in settings where most users will never see it. This should be visible on the 13th Cheque screen as well.
- **Missing guidance:**
  - No edit functionality. This is a critical missing feature. After setup, nothing can be changed except by full reset.
  - No data export option.
  - No "contact us" or "get help" link.
  - No reminder settings.
  - No notification preferences.
- **Emotional read:** Frustrating. If I realise my income was wrong, I have to delete everything and start over. That is punitive.
- **Would they continue?** YES (they will avoid settings), but frustration will build over time.
- **Fix suggestion:** (1) **CRITICAL:** Make every profile field editable from Settings. (2) Add budget editing. (3) Add a reminder/notification setup. (4) Add a data export option. (5) Add a help/FAQ section.

**Severity: HIGH** -- No ability to edit profile after setup is a major usability failure. Users who made mistakes during the rushed setup flow are trapped.

---

## SCREEN: All Expenses / History (S_History)

- **Friction score:** 1/5
- **Confusion points:**
  - Dates are in ISO format (2026-02-20). Should be "20 Feb 2026" or "20 Feb."
  - The delete button (trash icon) is small and close to the expense amount. Accidental deletion risk. There is no confirmation dialog.
  - No edit functionality. If I logged the wrong amount, I have to delete and re-add.
  - Filter tabs (All / Work / Personal) work well.
- **Missing guidance:**
  - No way to edit an expense, only delete.
  - No bulk actions (delete all, export).
- **Emotional read:** Clean and functional. This screen does what it needs to do.
- **Would they continue?** YES.
- **Fix suggestion:** (1) Format dates as "20 Feb." (2) Add a confirmation dialog for delete. (3) Add edit functionality. (4) Increase delete button touch target.

**Severity: LOW** -- Minor usability issues.

---

## CROSS-CUTTING ISSUES

### Data Cost
- The Google Fonts import loads Sora and DM Sans on every app open. These are approximately 100-200KB combined. For a user with R8 of data, this is a cost. Fonts should be cached or bundled.
- The Anthropic API call in the Tjommie chat sends and receives JSON. Each chat message is probably 2-5KB. Low cost per message, but it adds up for prepaid users who are not expecting data usage from what looks like an offline app.
- There is no offline indicator or warning when connectivity is lost.

### Load Shedding / State Persistence
- localStorage is used for persistence, which is good. Data will survive power cuts.
- However, the setup flow does NOT save progress. If power cuts during Step 3 of 4, all setup progress is lost. The user starts from the language screen again.
- Expenses are saved immediately on "Save expense," which is correct.

### No Back Button in Setup
- The setup flow has no back button. If I am on Step 3 (Deductions) and realise I chose the wrong employment type in Step 1, I cannot go back. I must complete setup and then reset everything.

### Navigation Stack Bug
- The `go()` function pushes to navStack every time. If a user taps Home -> Cheque -> Home -> Cheque -> Home repeatedly from the nav bar, the navStack grows indefinitely. The back button will cycle through all of these, which is not expected behaviour.

### No Retirement Annuity (RA) Category
- RA contributions are the single biggest tax deduction most South Africans miss (up to 27.5% of income, max R350k/year). There is no RA category in the deductions list and no callout about it anywhere in the app.

---

## OVERALL DROP-OFF RISK

**Screen with highest drop-off: Budget & Savings (S_Budget)**

This is where the app shifts from "exciting money discovery" to "fill in this spreadsheet." The budget categories do not match South African reality (no rent, no utilities, no school fees, no family support). The raw number inputs are tedious. There is no skip option. Users who only care about the 13th Cheque feature are forced through a budget exercise they did not ask for. Combined with the friction from the income input on the previous screen, this is the point where users who "tried two financial apps before and deleted both because they felt like homework" will delete this one too.

Secondary drop-off risk: **Your Money (S_Money)** -- the raw income input with no formatting, pre-filled value, and unexplained tax jargon is a significant friction wall.

---

## TOP 3 FIXES

### 1. Fix the Income Input (S_Money) -- CRITICAL
Replace the raw `type="number"` input with a formatted currency field that displays "R 25,000" as the user types. Remove the pre-filled default value. Add a privacy assurance ("stays on your phone"). Add Tjommie to explain what gross income means. This is the most sensitive moment in the app and it currently feels like a government form.

### 2. Replace Budget Categories with South African Reality (S_Budget) -- CRITICAL
The current categories (Groceries, Eating Out, Fuel, Entertainment, Clothing, Medical, Other) miss the biggest expenses in a South African household. Replace with: Housing (Rent/Bond), Utilities (Electricity/Water), Groceries, Eating Out, Transport (Fuel/Taxi/Uber), Medical Aid, Insurance, School Fees, Clothing, Entertainment, Savings, Family Support, Other. Add a "Skip for now" option so users can get to the 13th Cheque without doing budget homework.

### 3. Make Profile Editable After Setup (Settings) + Add Back Navigation in Setup -- HIGH
Users cannot change their income, employment type, or any profile field after setup without resetting all data. Add edit functionality to Settings. Add back buttons to the setup flow so users can correct mistakes without starting over. This single fix prevents a cascade of frustration that builds over days of use.

---

## ADDITIONAL HIGH-PRIORITY ITEMS (not in top 3 but close)

4. **Reorder Add Expense fields:** Category before amount. This matches how people think about spending.
5. **Add receipt upload button** (even a prototype placeholder) to honour Tjommie's "snap your slips" promise.
6. **Add RA contribution category** with a prominent callout -- this is the biggest deduction most users are missing.
7. **Home screen direction:** Tjommie must give a specific first action on the first visit, not a generic tip.
8. **Privacy disclosure for Tjommie chat:** Users need to know their financial data is being sent to an external API.
9. **Explain PAYE, gross income, marginal rate** at point of use, not in a glossary no one will read.
10. **Mid-year catch-up prompt:** Ask users about historical expenses from earlier in the tax year.

---

*Report generated by User Agent, Iteration 1.*
*Persona: Lerato, 34, graphic designer, Johannesburg.*
*"I've deleted two financial apps before. Don't make this the third."*
