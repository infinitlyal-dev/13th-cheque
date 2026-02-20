# SARS Compliance Agent Report -- Iteration 1

**Agent:** SARS Compliance Officer (15 years experience)
**File reviewed:** `thirteenth-cheque-v2.jsx`
**Tax year:** 2025/26 (1 March 2025 -- 28 February 2026)
**Date of review:** 20 February 2026

---

## 1. TAX BRACKETS AND REBATES

**ITEM: Tax brackets (BRACKETS constant, lines 13-21)**
- Compliance status: COMPLIANT
- Issue: None. The seven brackets match the 2025/26 Income Tax Act tables exactly.
- Risk level: LOW
- What SARS would say: "These are the correct brackets."
- Required fix: None.
- Documentation gap: None.

**ITEM: Primary rebate (line 22)**
- Compliance status: COMPLIANT
- Issue: R17,235 is correct for taxpayers under 65 for 2025/26.
- Risk level: LOW
- What SARS would say: Correct.
- Required fix: None. However, the app does not account for secondary rebate (R9,444 for age 65-74) or tertiary rebate (R3,145 for age 75+). This is acceptable for an app primarily targeting working-age taxpayers, but a note would be helpful.
- Documentation gap: No age input is captured. If a user is 65+, the rebate is wrong and the threshold is wrong (R148,217 for 65-74, R165,689 for 75+).

**ITEM: Tax threshold (line 23)**
- Compliance status: COMPLIANT
- Issue: R95,750 is correct for under-65 taxpayers for 2025/26.
- Risk level: LOW
- What SARS would say: Correct for under-65.
- Required fix: Consider noting the threshold only applies to under-65.
- Documentation gap: None.

---

## 2. TAX CALCULATION LOGIC

**ITEM: calcTax function (lines 25-31)**
- Compliance status: COMPLIANT
- Issue: The marginal rate calculation is correctly applied. The function finds the correct bracket, applies the base amount plus the marginal rate on the excess, then subtracts the primary rebate. This is the correct SARS calculation method.
- Risk level: LOW
- What SARS would say: The calculation methodology is correct.
- Required fix: None for the core maths.
- Documentation gap: None.

**ITEM: Tax year boundary calculation -- daysLeft() and taxYearPct() (lines 38-48)**
- Compliance status: WARNING
- Issue: The `daysLeft()` function uses `new Date(yr,1,28)` which is correct for the end of the tax year (28 February). However, the logic `n.getMonth() <= 1` treats January (0) and February (1) as belonging to the current calendar year's tax year end, which is correct. The `taxYearPct()` function correctly calculates from 1 March to 28 February. However, in a leap year, the tax year end date would still be 28 February (not 29 February) -- SARS uses 28 February regardless. This is correct as implemented.
- Risk level: LOW
- What SARS would say: Tax year runs 1 March to 28/29 February. The end date should technically be the last day of February, which varies by leap year. The current implementation using 28 Feb is close enough for estimation purposes.
- Required fix: Minor -- could use `new Date(yr+1, 2, 0)` to get the actual last day of February (handles leap years), but this is not a compliance issue for an estimation tool.
- Documentation gap: None.

---

## 3. REFUND ESTIMATION -- CRITICAL AREA

**ITEM: "Average refund" promise screen -- S_Promise (lines 231-253)**
- Compliance status: NON-COMPLIANT
- Issue: The screen displays "SARS owes the average South African R18,400 every year. Unclaimed." This is a specific, unverified claim attributed to SARS. SARS does not publish this figure. The phrase "SARS owes" implies a guaranteed entitlement. Many South Africans are owed nothing. The R18,400 figure appears to be fabricated or at best an unverifiable estimate.
- Risk level: HIGH
- What SARS would say: "SARS does not owe anyone anything by default. A refund is the result of overpaid tax relative to allowable deductions. We do not recognise the R18,400 figure. This copy is misleading and could constitute misrepresentation of SARS's position."
- Required fix: Change to factual, qualified language. Example: "Many South Africans overpay tax every year because they don't claim legitimate work deductions. Your refund depends on your actual expenses." Do NOT attribute a specific rand figure to SARS. Alternatively, cite a verifiable source or use "estimated average" with clear qualification.
- Documentation gap: No source citation for the R18,400 figure.

**ITEM: Estimated 13th Cheque on S_Money screen (line 296)**
- Compliance status: WARNING
- Issue: The formula `Math.round(annual * 0.1 * marginalRate)` assumes 10% of annual income will be deductible. This is a crude assumption with no basis in any user data. For a salaried employee on R300,000/year, this gives ~R7,800 at the 26% bracket. A salaried employee under Section 23(m) would typically claim far less. For a freelancer on R300,000, 10% might be reasonable or even low. The same estimate is shown regardless of employment type.
- Risk level: HIGH
- What SARS would say: "A refund estimate must be based on actual deductions, not assumed percentages. Showing people inflated estimates before they have entered any expenses is irresponsible."
- Required fix: Either (a) show the estimate ONLY after actual expenses are entered, or (b) differentiate the assumption by employment type (salaried: ~3-5%, freelancer: ~10-15%, commission: ~8-12%), or (c) clearly label this as "if you claim 10% of your income in work deductions" so the user understands the assumption.
- Documentation gap: The assumption basis is not disclosed to the user.

**ITEM: Estimated 13th Cheque on S_Ready screen (line 416)**
- Compliance status: WARNING
- Issue: Formula is `Math.round(annual * 0.09 * marginal * Math.max(enabled, 1) / 4)`. This is a different formula from S_Money, creating inconsistency. It uses 9% of annual income, divided by 4, multiplied by number of enabled categories. This produces volatile and potentially misleading results -- enabling more categories inflates the estimate without any actual expenses.
- Risk level: HIGH
- What SARS would say: "The estimate changes based on categories toggled, not actual expenses incurred. This is misleading."
- Required fix: Make the estimate consistent and based on actual data. Before any expenses are logged, either show no estimate or show a clearly qualified range. After expenses are logged, use actual expense totals multiplied by marginal rate.
- Documentation gap: The formula basis is not disclosed.

**ITEM: Refund calculation on Home/Cheque screens (lines 452, 546)**
- Compliance status: COMPLIANT (with warning)
- Issue: The formula `workExp.reduce((s,e) => s+e.amount, 0) * marginalRate` is conceptually correct -- the refund from deductions equals the deduction total multiplied by the marginal tax rate. This is how tax deductions work: they reduce taxable income, saving tax at the marginal rate.
- Risk level: MEDIUM
- What SARS would say: "This is a simplification. If deductions are large enough to push the taxpayer into a lower bracket, the marginal rate on those deductions would be lower for the portion that crosses the bracket boundary. For small deductions relative to income, this is acceptable as an estimate."
- Required fix: Add a disclaimer that this is an estimate and actual refund may vary. For large deductions (>10% of income), consider a more sophisticated calculation that accounts for bracket crossings.
- Documentation gap: No disclaimer on the home or cheque screens that this is an estimate subject to SARS assessment.

**ITEM: "Estimated refund from SARS" label (line 559)**
- Compliance status: WARNING
- Issue: The words "Estimated refund from SARS" are acceptable because they say "estimated." However, the prominent display with gold formatting, animation, and "what it could cover" dream items below creates an impression of guaranteed money. The phrase "estimated SARS refund" on the home screen (line 477) is similarly borderline.
- Risk level: MEDIUM
- What SARS would say: "A refund is not guaranteed until assessed. Using our name in conjunction with specific amounts -- even labelled as estimates -- creates an expectation we may not fulfil."
- Required fix: Add a small disclaimer near the estimate: "Subject to SARS assessment. Actual refund may differ." This already exists on the Settings page (line 873) but is not visible where estimates are shown.
- Documentation gap: The disclaimer should be visible wherever an estimate is displayed, not buried in settings.

---

## 4. DEDUCTION CATEGORIES -- SECTION 23(m) COMPLIANCE

**ITEM: Phone & Internet for salaried employees (lines 51-65, 332)**
- Compliance status: COMPLIANT
- Issue: The app correctly restricts "phone_internet" for salaried employees by greying it out. Section 23(m) does not allow salaried employees to claim phone and internet expenses -- these are the employer's responsibility.
- Risk level: LOW
- What SARS would say: Correct restriction.
- Required fix: None.
- Documentation gap: None.

**ITEM: Stationery for salaried employees (line 332)**
- Compliance status: COMPLIANT
- Issue: Correctly restricted for salaried employees.
- Risk level: LOW
- What SARS would say: Correct.
- Required fix: None.
- Documentation gap: None.

**ITEM: Subscriptions for salaried employees (line 332)**
- Compliance status: WARNING
- Issue: "Subscriptions" is blanket-restricted for salaried employees. However, professional body subscriptions (e.g., SAICA membership for accountants, HPCSA for health professionals, Law Society for lawyers) ARE deductible for salaried employees under Section 11(a) read with Section 23(m)(3). The current implementation blocks ALL subscriptions, which causes salaried employees to miss legitimate deductions.
- Risk level: MEDIUM
- What SARS would say: "Professional body subscriptions that are a condition of employment are allowable deductions, even for salaried employees."
- Required fix: Split "Subscriptions" into two categories: "Professional Body Memberships" (allowed for salaried) and "Software/Other Subscriptions" (restricted for salaried).
- Documentation gap: No guidance on which subscriptions are claimable by salaried employees.

**ITEM: Marketing for salaried employees (line 332)**
- Compliance status: COMPLIANT
- Issue: Correctly restricted. Salaried employees do not market their own services.
- Risk level: LOW
- What SARS would say: Correct.
- Required fix: None.
- Documentation gap: None.

**ITEM: Client Entertainment for salaried employees (line 332)**
- Compliance status: WARNING
- Issue: Blanket-restricted for salaried employees. However, some salaried employees (especially in sales roles) do incur client entertainment expenses that their employer does not reimburse. If the employer formally requires the employee to entertain clients and does not reimburse, this could be deductible. The blanket restriction is overly conservative.
- Risk level: LOW (conservative is safer than permissive)
- What SARS would say: "Generally not claimable for salaried employees, but case-by-case exceptions exist."
- Required fix: Optional -- could add a note saying "If your employer requires you to entertain clients at your own cost, speak to a tax practitioner."
- Documentation gap: None significant.

**ITEM: Home Office categories (lines 57-58)**
- Compliance status: NON-COMPLIANT
- Issue: Home office rent and utilities are available to ALL employment types with NO warning about the strict requirements. For salaried employees, home office claims are near-automatic audit triggers. The home office categories are NOT in the restricted set for salaried employees (line 332). SARS disallowed R1.8 billion of R2.9 billion in home office claims in 2021/22. The requirements are: (1) employer must formally require home work in writing, (2) employee must spend >50% of working hours there, (3) the room must be EXCLUSIVELY used for work, (4) the room must be specifically equipped for work.
- Risk level: AUDIT TRIGGER
- What SARS would say: "Home office claims from salaried employees are one of our highest-audit categories. An app that allows salaried employees to freely claim home office expenses without any verification of the legal requirements is facilitating non-compliant claims."
- Required fix: CRITICAL. Either (a) restrict home office categories for salaried employees entirely, or (b) add a mandatory gating questionnaire before a salaried employee can enable home office: "Does your employer require you to work from home in writing?", "Do you spend more than 50% of your working hours in your home office?", "Is the room used ONLY for work -- no TV, no guest bed, no shared use?", "Is the room specifically equipped for your work?" If all four are "yes," allow the claim with a prominent warning. If any are "no," block the claim.
- Documentation gap: No capture of employer letter, floor plan, exclusive-use declaration, or percentage of work hours at home.

**ITEM: Bank Charges (line 55)**
- Compliance status: WARNING
- Issue: Bank charges are listed as a deduction category for ALL employment types, including salaried employees. For salaried employees, personal bank charges are NOT deductible. Only freelancers and sole proprietors can claim bank charges on a business account. The app does not distinguish between personal and business banking.
- Risk level: MEDIUM
- What SARS would say: "Personal bank charges are not deductible for salaried employees. Only bank charges on accounts used exclusively or primarily for business purposes may be deducted by self-employed taxpayers."
- Required fix: Restrict bank charges for salaried employees, or add a qualifier that only business account charges are claimable and only for self-employed persons.
- Documentation gap: No guidance on separating personal from business banking charges.

**ITEM: Equipment & Software (line 53)**
- Compliance status: WARNING
- Issue: Available to all employment types. For salaried employees under Section 23(m), equipment is only deductible if the employer does not provide it AND the employee is required to use their own. The app shows no warning or gating question. Additionally, the app does not implement the R7,000 threshold rule: items under R7,000 can be fully deducted in the year of purchase, items over R7,000 must be depreciated (typically 3 years for computers). The app allows any amount as a single deduction.
- Risk level: HIGH
- What SARS would say: "Equipment deductions for salaried employees must demonstrate the employer does not provide the equipment. Equipment over R7,000 must be depreciated, not claimed in full in one year."
- Required fix: (a) Add a gating question for salaried employees: "Does your employer provide this equipment?" If yes, block the claim. (b) When an equipment expense exceeds R7,000, warn the user that SARS expects depreciation over 3 years and calculate accordingly (1/3 per year, or straight-line over the asset life).
- Documentation gap: No capture of employer equipment policy, no depreciation schedule, no asset register.

**ITEM: Work Travel (line 56)**
- Compliance status: WARNING
- Issue: Work travel is available to all employment types with the note "Business travel (not commuting)." The exclusion of commuting is correct. However, SARS requires a completed logbook for ALL travel deductions -- no logbook means zero deduction, period. The app does not capture logbook data (date, destination, purpose, km, odometer readings) and does not warn users that a logbook is mandatory.
- Risk level: HIGH
- What SARS would say: "No logbook, no deduction. This is not negotiable. We cross-reference odometer readings and expect detailed records."
- Required fix: (a) Add a prominent warning when the work_travel category is enabled: "SARS requires a completed travel logbook. Without it, your travel claim will be rejected outright." (b) Ideally, build a simple logbook capture: date, from, to, km, purpose. (c) At minimum, remind users on every travel expense entry that they need to maintain a separate logbook.
- Documentation gap: CRITICAL. No logbook functionality or logbook requirement warning. This is the single biggest documentation gap in the app.

**ITEM: Training & Education (line 59)**
- Compliance status: COMPLIANT (with note)
- Issue: Training is allowed for all employment types, which is generally correct. Training and education costs directly related to current employment are deductible. However, training for a NEW career or unrelated field is NOT deductible.
- Risk level: LOW
- What SARS would say: "Training must be directly related to the taxpayer's current income-earning activities."
- Required fix: Add a note: "Only training related to your current work is deductible."
- Documentation gap: No capture of course certificates, proof of relevance to work.

**ITEM: Professional Services (line 54)**
- Compliance status: COMPLIANT
- Issue: Accountant, legal, and consulting fees related to income production are deductible.
- Risk level: LOW
- What SARS would say: Correct, provided they relate to income production.
- Required fix: None.
- Documentation gap: None significant.

---

## 5. MISSING DEDUCTION CATEGORIES

**ITEM: Retirement Annuity (RA) Contributions -- MISSING**
- Compliance status: NON-COMPLIANT (by omission)
- Issue: RA contributions are one of the single largest tax deductions available to South Africans. The deduction is 27.5% of the greater of remuneration or taxable income, capped at R350,000 per year. This deduction is available to ALL employment types. The app does not mention RA contributions anywhere. This is a major omission.
- Risk level: HIGH (missed opportunity, not audit risk)
- What SARS would say: "RA contributions are a legitimate and significant deduction. Not surfacing this option means users may miss thousands of rands in tax savings."
- Required fix: Add an RA contribution category with a prominent callout. When the user enters their income, calculate the maximum allowable RA deduction and show the potential tax saving. Example: For income of R300,000, maximum RA deduction is R82,500 (27.5%), saving R21,450 at the 26% marginal rate.
- Documentation gap: No capture of RA contribution amounts, fund name, or contribution certificates.

**ITEM: Medical Aid Tax Credits -- MISSING**
- Compliance status: NON-COMPLIANT (by omission)
- Issue: Medical tax credits are available to all taxpayers who contribute to a registered medical scheme. The credits are: R364/month for the main member, R364/month for the first dependent, R246/month for each additional dependent. Additionally, qualifying medical expenses above 7.5% of taxable income can provide additional tax relief. The app has "Medical" only in the personal budget category, not as a tax deduction.
- Risk level: HIGH (missed opportunity)
- What SARS would say: "Medical tax credits are a standard part of the ITR12 return. Most employers already apply them via payroll, but taxpayers who pay medical aid directly or have additional qualifying expenses may be entitled to further credits."
- Required fix: Add medical aid contributions and medical tax credits. Capture: monthly medical aid contribution, number of dependents. Calculate the credit. Note that most employers already factor this into PAYE, so the user should check their IRP5 before claiming additional credits.
- Documentation gap: No capture of medical aid membership details, contribution amounts, number of dependents, or additional qualifying medical expenses.

**ITEM: Donations (Section 18A) -- MISSING**
- Compliance status: WARNING (by omission)
- Issue: Donations to approved Section 18A organisations are deductible up to 10% of taxable income. Many South Africans make church or charity donations that qualify.
- Risk level: LOW (nice to have)
- What SARS would say: "Section 18A donations are a legitimate deduction, provided the donor receives a valid Section 18A receipt."
- Required fix: Consider adding a donations category. Not critical but beneficial.
- Documentation gap: No capture of Section 18A receipts.

**ITEM: Wear and Tear / Depreciation Schedule -- MISSING**
- Compliance status: NON-COMPLIANT (by omission for equipment claims)
- Issue: As noted in the equipment section, assets over R7,000 must be depreciated. The app has no depreciation tracking or asset register.
- Risk level: MEDIUM
- What SARS would say: "An asset register with acquisition dates, costs, and annual depreciation is required for equipment claims."
- Required fix: For equipment expenses over R7,000, calculate annual depreciation (typically 33.3% for computers, 16.67% for furniture) and only count the current year's portion toward the refund estimate.
- Documentation gap: No asset register, no depreciation schedule.

---

## 6. TJOMMIE AI COMPLIANCE

**ITEM: Tjommie system prompt (lines 766-786)**
- Compliance status: COMPLIANT (with caveats)
- Issue: The system prompt correctly instructs Tjommie to never guarantee a refund and to recommend tax practitioners for complex situations. It correctly outlines Section 23(m) restrictions and key SARS facts. However, the prompt includes "RA contributions: up to 27.5% of income, max R350k/year -- huge deduction" while the app itself has no RA feature. Tjommie may recommend RA contributions that users cannot track in the app.
- Risk level: LOW
- What SARS would say: The instructions to the AI are appropriately conservative.
- Required fix: Minor -- ensure Tjommie's knowledge and the app's features are aligned. If Tjommie mentions RA contributions, the app should have a way to track them.
- Documentation gap: None for the prompt itself.

**ITEM: Tjommie on home screen -- "Every R100 you claim saves you RXX in tax" (line 512)**
- Compliance status: WARNING
- Issue: This is technically correct but only for deductions that SARS actually accepts. The phrasing could encourage overclaiming by implying every expense logged automatically becomes a tax saving. Not every logged expense will be accepted by SARS.
- Risk level: MEDIUM
- What SARS would say: "Every R100 SARS accepts as a legitimate deduction saves tax at the marginal rate. Not every expense claimed is accepted."
- Required fix: Add qualification: "Every R100 in legitimate work deductions saves you RXX in tax."
- Documentation gap: None.

**ITEM: Tjommie on cheque screen -- phone contract suggestion (line 609)**
- Compliance status: NON-COMPLIANT (conditional)
- Issue: "Start with your phone contract -- it's usually the biggest deduction most people miss." This advice is WRONG for salaried employees. Under Section 23(m), salaried employees CANNOT claim phone contracts. The app correctly restricts the category in the deductions screen, but Tjommie still suggests it regardless of employment type.
- Risk level: HIGH
- What SARS would say: "Advising salaried employees to claim their phone contract is incorrect and could lead to rejected claims."
- Required fix: Make Tjommie's advice conditional on employment type. For salaried employees: suggest professional subscriptions or tools the employer doesn't provide. For freelancers: phone contract is appropriate advice.
- Documentation gap: None.

---

## 7. COPY AND MESSAGING

**ITEM: "Find my 13th Cheque" button (line 403)**
- Compliance status: WARNING
- Issue: The phrase "find my 13th Cheque" implies the refund already exists and merely needs to be discovered. In reality, the refund is built through legitimate expense tracking and claiming. The framing creates an entitlement expectation.
- Risk level: LOW
- What SARS would say: "Taxpayers do not 'find' refunds. Refunds result from legitimate deductions properly claimed and verified by SARS."
- Required fix: Minor -- consider "Start building my 13th Cheque" (which is already used on the Ready screen, line 440). The inconsistency itself is confusing.
- Documentation gap: None.

**ITEM: "Your 13th Cheque could cover..." dream items (lines 77-85, 549-605)**
- Compliance status: WARNING
- Issue: Showing specific purchases the refund could cover (flights, laptop, rent) is a motivational tool. However, when combined with inflated or unverified estimates, it creates concrete expectations about money the user may never receive. If a user sees "Your R8,000 refund could cover return flights to Cape Town" and SARS assesses R2,000, there is reputational and user-trust risk.
- Risk level: MEDIUM
- What SARS would say: "We have no issue with the motivational framing, but the estimates driving these comparisons must be accurate and clearly qualified."
- Required fix: Ensure dream items are only shown when backed by ACTUAL logged expenses, not inflated early estimates. The current filter `d.cost <= cheque * 1.2` (line 549) even inflates by 20% -- remove the 1.2 multiplier.
- Documentation gap: None.

**ITEM: Settings disclaimer (lines 872-875)**
- Compliance status: COMPLIANT
- Issue: The disclaimer "provides estimates for guidance only and does not constitute professional tax advice" is appropriate and necessary.
- Risk level: LOW
- What SARS would say: This is the appropriate disclaimer.
- Required fix: None, but this disclaimer should appear in more locations (onboarding, cheque screen).
- Documentation gap: None.

---

## 8. TAX YEAR AND DATE HANDLING

**ITEM: Mid-year backdating (expense date input, line 671)**
- Compliance status: COMPLIANT (with note)
- Issue: The date input allows users to select any date, enabling backdating of expenses to earlier in the tax year. This is correct -- users should be able to log past expenses. However, there is no validation that the expense date falls within the current tax year (1 March 2025 -- 28 February 2026). A user could enter a date from a prior tax year and the app would include it in the current refund estimate.
- Risk level: MEDIUM
- What SARS would say: "Expenses must be claimed in the tax year they were incurred. Prior-year expenses belong in an amended prior-year return."
- Required fix: Add validation that expense dates fall within the current tax year (1 March to 28 February). Warn if a user enters a date outside this range.
- Documentation gap: No tax year boundary enforcement.

---

## 9. DOCUMENTATION AND RECORD-KEEPING

**ITEM: Receipt/invoice capture -- MISSING**
- Compliance status: NON-COMPLIANT (by omission)
- Issue: SARS requires supporting documentation for ALL deductions: invoices, receipts, proof of payment, contracts. The app captures only amount, description, date, and category. There is no receipt upload, photo capture, or document storage. Without documentation, every claim is vulnerable to rejection on audit.
- Risk level: HIGH
- What SARS would say: "Every deduction must be supported by documentary evidence. An app that tracks amounts without attaching evidence is not preparing users for a SARS audit."
- Required fix: Add receipt photo/upload capability. Even in a prototype, a camera button with "attach receipt" functionality (or a note reminding users to keep the receipt) is essential.
- Documentation gap: CRITICAL. No receipt or invoice storage.

**ITEM: Work-vs-personal split documentation -- MISSING**
- Compliance status: WARNING
- Issue: For expenses like phone and internet, SARS requires evidence of the work/personal split. The app captures a full amount without asking what percentage is for work use.
- Risk level: MEDIUM
- What SARS would say: "If you claim your phone bill as a work expense, what percentage is for work? Show us the calculation."
- Required fix: For phone/internet and similar dual-use expenses, add a "% used for work" slider or input. Calculate only the work portion as a deduction.
- Documentation gap: No work-use percentage capture for dual-use expenses.

**ITEM: Home office proportional calculation -- MISSING**
- Compliance status: NON-COMPLIANT (if home office is claimed)
- Issue: Home office deductions require a proportional calculation: (office floor area / total home floor area) x annual occupancy costs. The app captures a flat amount with no guidance on the proportional calculation. SARS cross-references floor plans, utility bills, and lease agreements.
- Risk level: AUDIT TRIGGER
- What SARS would say: "Show us the floor plan. What is the total area of the home? What is the area of the office? What are the total occupancy costs? Show us the calculation."
- Required fix: If home office is kept as a category, build a calculator: total home size (sqm), office size (sqm), monthly rent/bond, monthly utilities. Calculate the proportional deduction automatically.
- Documentation gap: No floor measurements, no utility bills, no lease agreements, no proportional calculation.

---

## 10. EMPLOYMENT TYPE HANDLING

**ITEM: Commission earner definition (line 259)**
- Compliance status: WARNING
- Issue: "Variable or performance-based pay" is not a sufficient definition. For SARS purposes, a commission earner who can claim broader deductions under Section 11(a) must earn MORE THAN 50% of their remuneration from commission or variable pay. The app does not verify this threshold. A person earning 20% commission and 80% salary would be treated as salaried for deduction purposes, but the app would treat them as a commission earner with broader claim rights.
- Risk level: HIGH
- What SARS would say: "Commission earners must demonstrate that more than 50% of their total remuneration is derived from commission. Those who do not meet this threshold are treated as salaried employees under Section 23(m)."
- Required fix: Add a verification question for commission earners: "Is more than 50% of your total pay from commission or variable performance-based income?" If no, reclassify as salaried for deduction purposes.
- Documentation gap: No verification of the >50% commission threshold.

---

## 11. API AND DATA CONCERNS

**ITEM: Anthropic API call without API key (line 797)**
- Compliance status: N/A (not a tax compliance issue)
- Issue: The API call to Anthropic does not include an API key header (`x-api-key`). This call will fail in production. Not a tax compliance issue, but Tjommie is the primary source of tax guidance in the app. If the chatbot is non-functional, users lose their primary tax advice channel.
- Risk level: N/A for SARS compliance, but HIGH for app functionality.
- Required fix: Not in my scope. Flagging for the product team.
- Documentation gap: N/A.

---

## SUMMARY

### HIGHEST RISK ITEMS (ranked by likelihood of causing user problems at tax time)

1. **Home office claims without gating or documentation (AUDIT TRIGGER)** -- Salaried employees can freely enable home office categories with zero verification of the four legal requirements. This will lead to rejected claims and potential audits.

2. **No travel logbook functionality or warning (HIGH)** -- Travel deductions without a logbook are automatically rejected by SARS. The app allows travel claims with no logbook warning.

3. **No receipt/document storage (HIGH)** -- Every deduction needs supporting evidence. The app captures numbers only.

4. **Misleading "R18,400 owed" promise screen (HIGH)** -- Attributes a specific, unverified figure to SARS. Creates false expectations.

5. **Inflated refund estimates before any expenses logged (HIGH)** -- Multiple different formulas produce different estimates, none based on actual user data.

6. **Equipment depreciation not handled (MEDIUM)** -- Items over R7,000 claimed in full instead of depreciated over 3 years.

7. **Commission earner >50% threshold not verified (HIGH)** -- Users who earn <50% commission may be claiming deductions they are not entitled to.

8. **Bank charges available to salaried employees (MEDIUM)** -- Personal bank charges are not deductible for salaried employees.

9. **Tjommie recommends phone contract to salaried employees (HIGH)** -- Directly contradicts Section 23(m) restrictions the app itself enforces.

10. **Home office proportional calculation missing (AUDIT TRIGGER)** -- Even if the gating questions are added, the actual calculation method (floor area ratio) is not implemented.

### MISSING DEDUCTIONS (legitimate deductions the app should surface but does not)

1. **Retirement Annuity (RA) contributions** -- 27.5% of income, capped at R350,000/year. This is the single biggest tax deduction most South Africans can access. Its omission is a major gap.

2. **Medical Aid Tax Credits** -- R364/month main member + R364 first dependent + R246 subsequent dependents. Standard on virtually every tax return.

3. **Section 18A Donations** -- Up to 10% of taxable income for donations to approved organisations.

4. **Professional body subscriptions for salaried employees** -- Currently blanket-blocked under "Subscriptions." These are legitimate claims for salaried employees.

5. **Wear and tear / Depreciation** -- Not a missing category per se, but the depreciation calculation is missing, meaning equipment deductions are overstated.

### DOCUMENTATION GAPS (records users will need that the app is not helping them keep)

1. **Receipts and invoices** -- No photo/upload/attachment capability for any expense.
2. **Travel logbook** -- No logbook capture (date, from, to, km, purpose, odometer).
3. **Home office floor plan and measurements** -- No capture of office area, total area, or proportional calculation.
4. **Employer letter (home office, salaried)** -- No prompt to obtain or upload employer confirmation of home working requirement.
5. **Work-use percentage** -- No capture of business vs. personal split for dual-use expenses (phone, internet, equipment).
6. **RA contribution certificates** -- Cannot capture because RA is not a category.
7. **Medical aid certificates** -- Cannot capture because medical aid credits are not a feature.
8. **Asset register** -- No tracking of equipment purchase dates, costs, expected life, or annual depreciation.
9. **Tax year validation** -- No enforcement that expenses fall within the current 1 March -- 28 February tax year.
10. **IRP5 / IT3 documents** -- No prompt for users to upload or reference their employer tax certificates, which are essential for accurate refund calculation.

---

**Overall compliance assessment: The app's tax calculation engine is mathematically sound. The bracket tables, rebate, and marginal rate logic are all correct. However, the deduction categories have significant compliance gaps, particularly around home office claims for salaried employees, missing travel logbook requirements, and the absence of RA and medical aid deductions. The copy makes claims that SARS would not endorse. The app needs substantial work on documentation capture before it can be considered a tool that prepares users for a compliant SARS filing.**

**Recommendation: Fix the home office gating, add travel logbook warnings, add RA and medical aid, fix the misleading estimates, and add receipt capture. These are the minimum requirements for SARS compliance.**
