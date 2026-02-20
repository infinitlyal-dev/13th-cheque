# SA Tax Consultant Agent Report -- Iteration 1

**Agent:** Registered Tax Practitioner (SAIT), 20 years experience
**Date:** 2026-02-20
**File reviewed:** `thirteenth-cheque-v2.jsx`
**Severity scale:** CRITICAL / HIGH / MEDIUM / LOW

---

## Executive Summary

This app has the right idea but, from a practitioner's standpoint, it is leaving **thousands of rands on the table** for virtually every user. The deduction categories are narrowly focused on freelancer operating expenses and entirely miss the highest-value tax reducers available to ordinary South Africans: Retirement Annuity contributions, medical expense credits, travel allowance optimisation, and donation deductions. The refund calculation is a crude estimate that ignores all of these. Tjommie's system prompt contains solid basics, but the app itself never acts on most of what it knows. Career-aware suggestions are entirely absent from the build -- the occupation field is captured but never used to surface personalised deductions. For a product promising to "find your money," this is a serious gap.

---

## Detailed Review

---

### ITEM: Tax Brackets and Calculation Engine (lines 13-31)

- **Advice quality:** ADEQUATE
- **What a good practitioner would add:** The brackets appear to be 2025/26 values. The primary rebate of R17,235 is correct. However, the calculation only applies the primary rebate. There is **no secondary rebate** (R9,444 for taxpayers 65+) or **tertiary rebate** (R3,145 for 75+). While the app likely targets younger users, age is never asked, and older users will get incorrect estimates.
- **Missed opportunity:** The tax threshold of R95,750 is only applicable to under-65 taxpayers. For 65-74 it is R148,217; for 75+ it is R165,689. The app hard-codes R95,750 only.
- **Career relevance:** N/A -- applies to all users.
- **Improvement:** Add an age bracket question (under 65 / 65-74 / 75+) during onboarding. Apply secondary and tertiary rebates accordingly. This is a one-line addition to the tax calc but affects refund accuracy significantly for older users.
- **Severity:** MEDIUM (most users will be under 65, but incorrect for those who aren't)

---

### ITEM: Refund Estimation Logic (lines 296, 416, 452-453)

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** The app estimates the 13th Cheque using three different formulas at different points:
  1. **Onboarding (line 296):** `annual * 0.1 * marginalRate` -- assumes 10% of income as deductions. This is a wild guess. A teacher earning R25,000/month likely has R5,000-R8,000 in deductions; a freelancer might have R80,000+.
  2. **Ready screen (line 416):** `annual * 0.09 * marginal * max(enabled,1) / 4` -- even more arbitrary, dividing by 4 and scaling by enabled categories.
  3. **Home/Cheque screens (line 452):** `workTotal * marginalRate` -- this is the only correct formula, but it only counts logged expenses. It ignores RA contributions, medical credits, and any other tax reducer.

  A user contributing R5,000/month to an RA sees zero impact on their 13th Cheque estimate. That is R21,600/year at a 36% marginal rate being ignored.
- **Missed opportunity:** The refund calculation should be: `(totalDeductions * marginalRate) + (medicalCredits) + (RA tax saving)`. At minimum, it needs to include RA contributions and medical aid credits as reducers.
- **Career relevance:** Affects all users. Freelancers are most impacted because they have the broadest deduction base.
- **Improvement:** Build a proper refund estimator that factors in: (a) logged work expenses, (b) RA contributions (if entered), (c) medical aid credits, (d) any other known reducers. Show each component separately on the 13th Cheque screen so users understand where the money comes from.
- **Severity:** CRITICAL -- the core promise of the app (showing your refund growing) is based on an incomplete calculation

---

### ITEM: Retirement Annuity (RA) Contributions -- COMPLETELY ABSENT

- **Advice quality:** MISLEADING by omission
- **What a good practitioner would add:** RA contributions are the single highest-value tax deduction available to most South Africans. The SKILL.md explicitly calls this out. A user earning R40,000/month contributing R5,000/month to an RA saves R21,600/year at the 36% marginal rate. The app:
  - Has no RA input field anywhere
  - Has no RA deduction category
  - Has no RA prompt from Tjommie during onboarding
  - Has no "what-if" scenario for RA contributions
  - Mentions RA in the Tjommie system prompt but never surfaces it proactively

  This is the biggest single failure in the app from a tax optimisation perspective. Most users of a tax app will not know to ask Tjommie about RAs. The app must surface this automatically.
- **Missed opportunity:** For a user on R30,000/month (R360,000 annual), the max RA deduction is R99,000/year (27.5%). At 31% marginal rate, that is R30,690 in tax savings. Most users won't contribute the max, but even R2,000/month = R7,440 back. This should be the **first thing the app talks about** after basic setup.
- **Career relevance:** Applies to everyone -- salaried, commission, and freelance. Especially important for freelancers who have no employer pension fund.
- **Improvement:**
  1. Add an RA question in onboarding: "Do you contribute to a Retirement Annuity?" with amount input.
  2. If no: Tjommie must surface an RA callout with a specific savings calculation: "If you put R2,000/month into an RA, SARS would give you back R[X] this year."
  3. Add RA to the 13th Cheque calculation.
  4. Add a "What if?" simulator: "What if I contribute R[X] more per month to my RA?"
- **Severity:** CRITICAL -- highest-value feature missing entirely

---

### ITEM: Medical Aid Credits and Out-of-Pocket Medical -- ABSENT

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** Medical aid tax credits (Section 6A/6B) are worth R364/month for the main member + R364 for the first dependant + R246 for each additional dependant (2025/26). These are credits, not deductions -- they reduce tax directly. Additionally, qualifying out-of-pocket medical expenses exceeding 7.5% of taxable income (for under-65 with medical aid) become additional deductions.

  The app has "Medical" as a budget category (line 73) but not as a tax deduction category. It never asks:
  - Are you on medical aid?
  - How many dependants?
  - Do you have out-of-pocket medical expenses not covered?
- **Missed opportunity:** A family of four on medical aid gets R1,338/month in credits (R16,056/year). If they also have R15,000 in uncovered dental, optical, and specialist bills, and their taxable income is R400,000, the additional medical deduction kicks in above R30,000 (7.5% of R400,000) -- so no extra in this case. But for lower-income users or those with high medical expenses, this can be significant.
- **Career relevance:** Universal. Particularly relevant for users NOT on employer-provided medical aid (freelancers, contractors).
- **Improvement:**
  1. Ask during onboarding: "Are you on medical aid?" and "How many people on your plan?"
  2. Calculate the medical aid credit automatically.
  3. Add "Out-of-pocket medical" as a deduction category for tracking uncovered expenses.
  4. Include medical credits in the 13th Cheque total.
- **Severity:** HIGH -- universally applicable tax reducer being ignored

---

### ITEM: Employment Type Handling and Section 23(m) (lines 255-287, 324-361)

- **Advice quality:** ADEQUATE
- **What a good practitioner would add:** The app correctly warns salaried employees about Section 23(m) restrictions and greys out inappropriate categories. This is good. However:
  1. The restricted set (line 332) blocks `phone_internet`, `stationery`, `subscriptions`, `marketing`, `client_entertainment`. This is mostly correct, but **marketing** is not a typical employee claim anyway, so blocking it adds no value. More importantly, the app does NOT restrict `home_office_rent` and `home_office_utilities` for salaried employees, which is wrong -- salaried employees can only claim home office if they have a dedicated office AND their employer requires them to work from home AND they earn commission income. The blanket allowance here is an audit risk.
  2. Commission earners are a hybrid -- they can claim more than pure salaried but less than freelancers. The app treats "commission" as a separate type but applies no specific logic for it.
- **Missed opportunity:** Commission earners with travel allowances need specific guidance on whether actual cost or the SARS deemed rate table is more beneficial. This is one of the highest-value optimisation exercises for sales staff and the app entirely ignores it.
- **Career relevance:** Critical for commission earners and salaried employees.
- **Improvement:**
  1. Add home office restrictions for salaried employees (or add a qualifying question: "Does your employer require you to work from home?").
  2. Add commission-earner-specific logic: travel allowance optimisation, logbook tracking prompt, actual vs deemed cost comparison.
  3. For salaried employees, make the "what you CAN claim" messaging more prominent than "what you can't claim" -- focus on the opportunity, not the restriction.
- **Severity:** HIGH -- home office for salaried employees without qualification is an audit risk

---

### ITEM: Career-Aware Deduction Suggestions -- NOT IMPLEMENTED

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** The app captures occupation (line 305) but never uses it. A teacher, a graphic designer, and an Uber driver all see the same generic list of 13 deduction categories. This is a major missed opportunity.

  In my practice, I would immediately surface different deduction profiles:
  - **Teacher:** Professional development, classroom supplies, educational materials, SACE registration
  - **IT professional:** Software licences, certifications (AWS, Azure, etc.), home lab equipment, cloud computing costs
  - **Sales rep:** Vehicle logbook, fuel, phone, client entertainment, travel
  - **Healthcare worker:** HPCSA registration, indemnity insurance, CPD courses, medical journals
  - **Creative professional:** Equipment, software (Adobe, etc.), portfolio hosting, reference materials
  - **Tradesperson:** Tools, PPE, work vehicle, trade-specific clothing

  The occupation field is captured and passed to Tjommie's system prompt, so Tjommie *could* give career-specific advice if asked. But the app itself never proactively shows "As a [designer], here's what you can likely claim..."
- **Missed opportunity:** Career-specific suggestions would dramatically increase the average number of deduction categories activated and the total claimed amount. Most people don't know what they can claim -- that's the entire point of this app.
- **Career relevance:** This IS the career relevance item. Without it, the app is generic.
- **Improvement:**
  1. After the user enters their occupation, show a screen: "As a [occupation], here's what most [occupations] claim:" with a pre-checked list of likely deduction categories.
  2. Map common occupations to deduction profiles (teacher, nurse, developer, designer, driver, accountant, lawyer, sales, tradesperson, etc.).
  3. Include a fallback for unrecognised occupations that uses Tjommie/AI to suggest relevant categories.
- **Severity:** CRITICAL -- this is explicitly required by the CLAUDE.md spec (item 6) and is the primary differentiation of the app

---

### ITEM: Deduction Categories (TAX_CATS, lines 51-65)

- **Advice quality:** ADEQUATE for freelancers, SUBOPTIMAL overall
- **What a good practitioner would add:** The 13 categories are reasonable for a freelancer but miss several important deduction types:
  1. **Retirement Annuity contributions** -- as discussed above
  2. **Professional body/association fees** -- SAIT, SAICA, SACAP, HPCSA, Law Society, ECSA, etc. These are deductible and common.
  3. **Professional indemnity insurance** -- mandatory for many professions
  4. **Protective clothing / uniforms** -- specifically required work clothing (not general "looking professional")
  5. **Donations (Section 18A)** -- up to 10% of taxable income for approved PBOs. Many South Africans donate to churches, charities, schools.
  6. **Vehicle / travel logbook expenses** -- the current "Work Travel" category is vague. Users need to understand the logbook requirement and the choice between actual cost and SARS rates.
  7. **Depreciation of equipment** -- the system prompt mentions the R7,000 threshold but the app has no mechanism to track assets vs expenses or calculate depreciation.
  8. **Bad debts** -- for freelancers who invoice clients
  9. **Interest on business loans** -- deductible for freelancers

  The descriptions are also too vague. "Bank Charges: Monthly fees & transactions" should clarify this is for business account charges only (for freelancers) and is generally not claimable by salaried employees.
- **Missed opportunity:** Section 18A donations alone could be worth thousands to users who tithe or donate regularly.
- **Career relevance:** Categories are one-size-fits-all when they should be profession-specific.
- **Improvement:** Add the missing categories above. For each category, add a one-line SARS rule clarification (e.g., "Must be used exclusively for work" or "Keep your logbook updated").
- **Severity:** HIGH -- missing deduction categories directly reduces users' refunds

---

### ITEM: Travel Allowance and Logbook -- NOT IMPLEMENTED

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** Many salaried and commission employees receive a travel allowance. This is one of the most complex and highest-value areas of personal tax in South Africa. The app has a generic "Work Travel" category but:
  1. Never asks if the user receives a travel allowance
  2. Never prompts for logbook data (business vs personal km)
  3. Never helps the user decide between claiming actual cost vs SARS deemed rate
  4. Never explains the logbook requirement

  A user receiving R6,000/month travel allowance who drives 2,000 business km/month at the SARS rate of R4.64/km (2025/26) would claim R111,360/year against R72,000 received -- creating a significant deduction. Without proper tracking, they claim nothing and get taxed on the full allowance.
- **Missed opportunity:** Travel is often the single largest deduction for commission earners and some salaried employees. The app should be the logbook.
- **Career relevance:** Critical for sales reps, field technicians, estate agents, delivery drivers, medical reps.
- **Improvement:**
  1. Ask during onboarding: "Do you receive a travel or car allowance from your employer?"
  2. If yes: Add a simple logbook feature or at minimum a monthly business km tracker.
  3. Calculate the optimal claim method (actual vs deemed) and show the user which is better.
  4. Surface the SARS deemed rate table.
- **Severity:** HIGH -- affects a large percentage of the target market

---

### ITEM: Donations Deduction (Section 18A) -- ABSENT

- **Advice quality:** MISLEADING by omission
- **What a good practitioner would add:** Donations to approved Section 18A organisations (registered PBOs) are deductible up to 10% of taxable income. This includes churches, schools, charities, and many NPOs. In South Africa, a significant portion of the population tithes or donates to churches -- often 10% of income. For a user earning R30,000/month, that is R36,000/year in donations, of which R36,000 is deductible (under the 10% cap on R360,000 taxable income). At 31% marginal rate, that is R11,160 back from SARS.

  The app never mentions donations. Not in categories, not in Tjommie's prompt, nowhere.
- **Missed opportunity:** For users who donate regularly (especially tithers), this is often the second-largest deduction after RA. The key requirement is a Section 18A tax certificate from the recipient organisation.
- **Career relevance:** Universal.
- **Improvement:**
  1. Add "Donations (Section 18A)" as a deduction category.
  2. Tjommie should ask: "Do you donate to any churches, charities, or schools? If they're SARS-registered, you can claim that back."
  3. Remind users to request Section 18A certificates.
- **Severity:** HIGH -- widely applicable, high value, zero coverage

---

### ITEM: Tjommie System Prompt Quality (lines 766-786)

- **Advice quality:** ADEQUATE
- **What a good practitioner would add:** The system prompt is well-structured and contains correct SARS facts. However:
  1. It mentions RA contributions but Tjommie can only discuss them if the user asks. The app should trigger Tjommie proactively.
  2. It states the equipment depreciation rule (R7k threshold) but the app has no mechanism to apply this.
  3. It correctly warns about Section 23(m) for salaried employees.
  4. It says "Never guarantee a refund" -- good.
  5. It lacks knowledge about: Section 18A donations, medical aid credits/deductions, travel allowance optimisation, interest income exemption, capital gains exclusion, and provisional tax implications for freelancers.
  6. The instruction to "Keep answers short (mobile screen)" may cause Tjommie to omit important tax nuances when they matter.
- **Missed opportunity:** Tjommie should have proactive conversation starters based on the user's profile. E.g., if a user is a freelancer who hasn't logged any home office expenses, Tjommie should ask about it unprompted.
- **Career relevance:** The prompt includes the user's occupation but gives Tjommie no career-specific knowledge to work with.
- **Improvement:**
  1. Add Section 18A, medical credits, travel allowance knowledge to the system prompt.
  2. Add career-specific deduction hints (e.g., "If user is a teacher, suggest: SACE fees, classroom supplies, educational courses").
  3. Add proactive suggestion triggers based on what the user hasn't yet logged.
- **Severity:** MEDIUM -- the foundation is solid but the knowledge base needs expansion

---

### ITEM: Provisional Tax for Freelancers -- NOT MENTIONED

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** Freelancers must register for provisional tax and submit IRP6 returns twice a year (August and February). Failure to do so incurs penalties and interest. The app targets freelancers as a key segment but:
  1. Never asks if they're registered for provisional tax
  2. Never reminds them about IRP6 deadlines
  3. Never helps them estimate their provisional tax payments
  4. Never warns them about underpayment penalties

  A freelancer using this app to track deductions who then misses their provisional tax payment defeats the purpose.
- **Missed opportunity:** Provisional tax reminders and estimation would make the app genuinely essential for freelancers, not just useful.
- **Career relevance:** Critical for all freelancers and sole proprietors.
- **Improvement:**
  1. If employment type is "freelancer," ask: "Are you registered for provisional tax?"
  2. Add IRP6 deadline reminders (August and February).
  3. Help estimate provisional payments based on current income and deductions.
- **Severity:** HIGH -- operational risk for the freelancer segment

---

### ITEM: Home Office Deduction Logic

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** The app has two home office categories -- "Home Office (Rent)" and "Home Office (Utilities)" -- but provides no guidance on how to calculate the deduction correctly. A good practitioner would insist on:
  1. **Exclusive use requirement:** The room must be used regularly and exclusively for work. A spare bedroom that's also a guest room does NOT qualify.
  2. **Area calculation:** Measure the office room and total house area. The deductible percentage = office area / total area.
  3. **What to apply the percentage to:** Bond interest (not repayment), rent, rates and taxes, electricity, insurance, repairs. NOT the bond capital repayment.
  4. **For salaried employees:** Additional requirement that the employer must require you to work from home, AND more than 50% of duties are performed at home, AND you earn commission or income not from salary.

  The app just says "Office share of rent/bond" and "Office share of electricity" without explaining how to calculate the share or what qualifies.
- **Missed opportunity:** Home office can be worth R2,000-R5,000/month in deductions for a freelancer with a proper setup. But overclaiming is the #1 audit trigger I see in practice.
- **Career relevance:** Critical for freelancers, remote workers, and hybrid employees.
- **Improvement:**
  1. Add a home office calculator: input room size, total home size, monthly costs. Auto-calculate the deductible portion.
  2. Add the exclusive use warning prominently.
  3. For salaried employees, add qualifying questions before allowing the claim.
- **Severity:** MEDIUM -- the category exists but guidance is inadequate

---

### ITEM: Interest Income Exemption -- NOT MENTIONED

- **Advice quality:** SUBOPTIMAL by omission
- **What a good practitioner would add:** The first R23,800 of interest income is tax-free for under-65 taxpayers (R34,500 for 65+). Many South Africans don't know this. While this isn't a "deduction" per se, it affects the overall tax position. Users with savings accounts, money market funds, or fixed deposits should know:
  1. The exemption exists and applies automatically
  2. Interest above the threshold is taxable
  3. This interacts with their overall tax calculation
- **Missed opportunity:** For users with meaningful savings, understanding the interest exemption helps them make better decisions about where to keep money (tax-free savings account vs regular savings).
- **Career relevance:** Universal, especially relevant for users with savings goals (the app has a savings feature).
- **Improvement:** Tjommie should mention the interest exemption when discussing savings. Add it to the system prompt knowledge base.
- **Severity:** LOW -- informational rather than actionable within the app

---

### ITEM: Tax-Free Savings Account (TFSA) -- NOT MENTIONED

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** The app has a savings goal feature but never mentions the Tax-Free Savings Account, which allows R36,000/year (R500,000 lifetime) in contributions where all returns (interest, dividends, capital gains) are completely tax-free. This is the most tax-efficient savings vehicle for most South Africans.
- **Missed opportunity:** Users setting savings goals should be told: "Put your first R3,000/month into a TFSA -- it's the most tax-efficient way to save."
- **Career relevance:** Universal.
- **Improvement:** Add TFSA guidance to the savings goal section and Tjommie's knowledge base.
- **Severity:** MEDIUM -- relevant to the savings feature already in the app

---

### ITEM: Year-Round Tax Planning and Mid-Year Scenarios

- **Advice quality:** SUBOPTIMAL
- **What a good practitioner would add:** The app tracks expenses retrospectively but does not help users plan forward. A good tax practitioner would:
  1. Show "If you continue at this rate, your year-end 13th Cheque will be R[X]"
  2. Show "If you increase your RA by R1,000/month, you'll save R[X] more"
  3. Remind users of deadline-sensitive decisions (RA top-up before Feb 28, Section 18A donations before year-end)
  4. Help with mid-year catch-up: "You're 8 months into the tax year. Based on your occupation, you should have approximately R[X] in deductions by now. Are you on track?"
- **Missed opportunity:** Proactive planning is where an app adds value a spreadsheet can't. The app currently doesn't project forward at all.
- **Career relevance:** Universal.
- **Improvement:**
  1. Add a projection: "At your current pace, your year-end 13th Cheque will be R[X]. Here's how to increase it."
  2. Add a "What if?" calculator for RA contributions.
  3. Add year-end reminders: "You have [X] days to top up your RA / make Section 18A donations / submit your provisional return."
- **Severity:** MEDIUM -- this is the difference between a tracker and an advisor

---

### ITEM: Annual Tax Summary / Download Feature -- NOT IMPLEMENTED

- **Advice quality:** N/A (feature absent)
- **What a good practitioner would add:** The CLAUDE.md spec (item 11) requires a "Download my tax summary" button. This is critical for users who hand their information to a tax practitioner. The summary should include:
  1. All work expenses categorised by SARS-standard deduction type
  2. RA contribution totals
  3. Medical aid details
  4. Donation totals with Section 18A certificate status
  5. Travel logbook summary (if applicable)
  6. Income and tax bracket information

  Without this, the app is useful for tracking but breaks the workflow at the most critical moment: actually filing the return.
- **Missed opportunity:** A well-formatted tax summary that a practitioner can work from would be the feature that justifies the app's existence.
- **Career relevance:** Universal.
- **Improvement:** Build the download feature as specified. Format it to match the ITR12 return structure as closely as practical.
- **Severity:** HIGH -- required by spec, high practical value

---

### ITEM: The "R18,400 average unclaimed" statistic (lines 240-243)

- **Advice quality:** ADEQUATE but unverifiable
- **What a good practitioner would add:** The opening screen states "SARS owes the average South African R18,400 every year, unclaimed." This figure is plausible for middle-income earners who aren't claiming RA deductions and have moderate work expenses, but it is not a SARS-published statistic. The app should either:
  1. Source this figure
  2. Clarify it as an estimate
  3. Use a range rather than a specific number

  Overpromising on the refund creates disappointment. Underpromising creates disengagement. The figure should be defensible.
- **Missed opportunity:** Instead of a static number, show a range based on income bracket: "South Africans earning R20k-R40k typically leave R8,000-R22,000 unclaimed."
- **Career relevance:** N/A.
- **Improvement:** Add a disclaimer or source. Consider making the number dynamic based on the user's income once captured.
- **Severity:** LOW -- marketing claim, not tax advice per se

---

### ITEM: Budget Categories vs SA Household Reality (DEFAULT_BUDGET, lines 67-75)

- **Advice quality:** ADEQUATE
- **What a good practitioner would add:** This is primarily a UX issue, but from a tax perspective: the budget categories miss "Family Support" which is a major expense for most South African households (extended family obligations). While family support is generally NOT tax deductible, tracking it matters for understanding why users have less disposable income than expected -- and therefore why every deductible rand matters more.

  The categories also miss Housing (rent/bond), Utilities (separate from other costs), Insurance, and School Fees -- all significant for SA households. The CLAUDE.md spec (item 2) explicitly requires these.
- **Missed opportunity:** School fees paid to registered Section 18A institutions may be partially claimable as donations. The app should flag this.
- **Career relevance:** Universal.
- **Improvement:** Expand budget categories per the CLAUDE.md spec. Flag any budget items that have a tax-deductible component (e.g., school fees to registered institutions, medical expenses).
- **Severity:** MEDIUM -- spec requirement, and there is a tax angle for school fees

---

## Summary Findings

---

### HIGHEST VALUE MISSED DEDUCTIONS

These are listed in order of typical value to a middle-income South African (R25,000-R50,000/month):

1. **Retirement Annuity contributions** -- R7,000 to R30,000+ per year in tax savings. Not mentioned anywhere in the app. This is the single biggest gap.

2. **Section 18A donations (including church tithes)** -- R5,000 to R15,000+ per year for regular donors. Entirely absent.

3. **Travel allowance optimisation** -- R5,000 to R20,000+ per year for employees with travel allowances. No logbook, no rate comparison, no guidance.

4. **Medical aid credits + out-of-pocket medical** -- R4,000 to R16,000+ per year depending on family size. Not tracked, not calculated.

5. **Professional body / association fees** -- R1,000 to R10,000+ per year depending on profession. Not in the deduction categories.

6. **Professional indemnity insurance** -- R2,000 to R8,000 per year for regulated professions. Not in the deduction categories.

7. **Depreciation of equipment over R7,000** -- Variable, but the app treats all equipment as a full deduction when items over R7,000 must be depreciated over 3 years. This could lead to overclaiming in year 1 and underclaiming in years 2-3.

---

### CAREER PROFILES NEEDED

The following occupations need specific deduction profiles built into the app:

| Occupation | Key Deductions to Surface | Estimated Annual Value |
|---|---|---|
| **Teacher / Educator** | SACE registration, classroom supplies, educational courses, reference books, home preparation costs | R5,000 - R15,000 |
| **IT Professional / Developer** | Software licences, cloud computing, certifications (AWS/Azure/GCP), home lab equipment, online courses | R8,000 - R25,000 |
| **Sales / Commission Earner** | Travel logbook + allowance optimisation, phone, client entertainment, fuel, vehicle costs | R15,000 - R50,000+ |
| **Creative Professional (designer, photographer)** | Equipment, software (Adobe suite), portfolio hosting, reference materials, home studio | R10,000 - R30,000 |
| **Healthcare Worker (nurse, doctor, therapist)** | HPCSA registration, professional indemnity, CPD courses, medical journals, specialist equipment | R8,000 - R20,000 |
| **Lawyer / Accountant** | Professional body fees (Law Society/SAICA/SAIT), CPD hours, professional journals, indemnity, client entertainment | R10,000 - R25,000 |
| **Tradesperson (electrician, plumber, builder)** | Tools, PPE, work vehicle, trade-specific clothing, materials, equipment depreciation | R10,000 - R30,000 |
| **Driver (Uber, delivery, truck)** | Vehicle costs (maintenance, tyres, insurance), fuel, phone/data, vehicle depreciation/lease | R20,000 - R60,000 |
| **Estate Agent** | Vehicle + logbook, marketing costs, phone, client entertainment, professional registration, home office | R15,000 - R40,000 |
| **Freelance Consultant** | Full Section 11(a) deductions: office, equipment, travel, phone, internet, professional fees, bad debts | R15,000 - R50,000+ |

---

### TJOMMIE KNOWLEDGE GAPS

Tjommie's system prompt has a solid foundation but lacks knowledge in these areas:

1. **RA contribution optimisation** -- Tjommie knows the rule (27.5%, R350k cap) but cannot proactively calculate the optimal contribution for this specific user or show the tax saving. The app should pre-compute this and feed it to Tjommie.

2. **Medical aid credits** -- Not in the system prompt at all. Tjommie cannot help with medical-related tax questions.

3. **Section 18A donations** -- Not mentioned. Tjommie doesn't know donations are deductible.

4. **Travel allowance / logbook** -- Mentioned only vaguely under "Business travel (not commuting)." Tjommie cannot guide a user through the actual vs deemed cost decision, explain the logbook requirement, or calculate which method is better.

5. **Provisional tax obligations** -- Not mentioned. Tjommie cannot warn freelancers about IRP6 deadlines.

6. **Tax-Free Savings Accounts** -- Not mentioned. Tjommie cannot advise on tax-efficient savings despite the app having a savings feature.

7. **Depreciation rules** -- Mentioned briefly but Tjommie cannot help users understand whether to expense or depreciate a specific purchase.

8. **Career-specific deduction knowledge** -- The occupation is provided but no career-specific deduction lists are included. Tjommie has to guess rather than working from a structured knowledge base.

9. **Year-end tax planning** -- Tjommie knows the days-left countdown but has no knowledge of year-end strategies (RA top-ups, timing of deductible purchases, provisional tax estimates).

10. **When to refer to a practitioner** -- The prompt says "Recommend a tax practitioner for complex situations" but doesn't define what's complex. Tjommie should flag: income from multiple sources, foreign income, capital gains events, rental income, trust distributions, deceased estates, and emigration as situations requiring professional help.

---

## Overall Assessment

**Rating: 4/10 from a tax optimisation perspective**

The app has a charming personality layer (Tjommie), correct basic tax maths, and a reasonable UX concept. But it is fundamentally incomplete as a tax tool. It tracks expenses but misses the highest-value tax reducers (RA, medical, donations, travel). It captures the user's occupation but never uses it. Its refund estimate only counts logged expenses, ignoring everything else.

The gap between "what this app could save a user" and "what it currently helps them find" is often R10,000-R30,000 per year. That's not a polish issue -- that's the core value proposition being unfulfilled.

**Priority fixes (in order of user value):**
1. Add RA contribution tracking and calculation (CRITICAL)
2. Implement career-aware deduction suggestions (CRITICAL)
3. Add medical aid credits to the calculation (HIGH)
4. Add Section 18A donation tracking (HIGH)
5. Fix home office qualification logic for salaried employees (HIGH)
6. Add travel allowance / logbook basics (HIGH)
7. Add professional body fees and indemnity insurance categories (HIGH)
8. Build the tax summary download (HIGH)
9. Add provisional tax reminders for freelancers (HIGH)
10. Expand Tjommie's knowledge base with all the above (MEDIUM)
