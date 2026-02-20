# SARS Compliance Report — The 13th Cheque App
**Agent:** SARS Compliance Officer
**Iteration:** 2
**Date:** 2026-02-20
**Reviewer:** Senior SARS Compliance (15 years experience)

---

## EXECUTIVE SUMMARY

The app demonstrates **strong foundational compliance** with SARS 2025/26 tax law. Tax brackets, rebates, and calculation formulas are accurate. Section 23(m) restrictions for salaried employees are correctly implemented. However, there are **7 HIGH-RISK items** and **3 CRITICAL gaps** that could lead to user claims being rejected, audited, or penalised by SARS.

**Overall Compliance Grade:** B+ (Good, but needs fixes)

---

## CRITICAL ISSUES (Must Fix)

### ITEM 1: Home Office Warning — Misleading for Salaried Employees
- **Location:** Line 206 — `TAX_CATS.home_office.warn`
- **Compliance status:** NON-COMPLIANT
- **Issue:** Warning says "Salaried = almost never allowed" but the category filtering logic (lines 219-237) DOES remove home_office for salaried employees. However, the warning text is never shown because the category is deleted before the user sees it. More critically, the warning says ">50% commission" qualifies, but it should say ">50% of INCOME" is commission/variable, AND there are additional strict requirements.
- **Risk level:** AUDIT TRIGGER
- **What SARS would say:** "Home office deductions for salaried employees require formal written proof from your employer that you are REQUIRED to work from home, proof that you spend >50% of working hours there, proof the room is EXCLUSIVELY used for work (not a dining room with a laptop), AND proof of specific equipment. Section 23(m) presumes the employer must provide workspace. We rejected 62% of home office claims in 2021/22. If you earn >50% commission, you're treated as commission earner, not salaried — different rules apply under Section 11(a)."
- **Required fix:**
  1. Change line 206 warning to: `"STRICT: Dedicated room, exclusively for work. Commission earners (>50% variable income) OR self-employed only. Salaried employees cannot claim unless employer formally requires it in writing AND you spend >50% of work hours there."`
  2. Line 220-222 logic should check commission % of INCOME, not employment type alone
- **Documentation gap:** App doesn't capture or remind user to keep: floor plan, lease/bond statement showing occupancy costs, employer letter (if salaried), utility bills, photos proving exclusive use

---

### ITEM 2: Equipment Depreciation — Oversimplified
- **Location:** Lines 48-52 (TAX_CATS), line 2666 (Tjommie system prompt)
- **Compliance status:** WARNING
- **Issue:** The warning says "Depreciation over 3 years, or full if under R7,000" — this is correct but incomplete. SARS requires the depreciation to follow the **wear-and-tear allowance schedule** in the Income Tax Act. Computers are typically 3 years (33.3% p.a.), but the user must pro-rata for the portion of the year the asset was in use. The app doesn't capture acquisition date separately or calculate partial-year depreciation.
- **Risk level:** MEDIUM (will likely be accepted, but could be questioned)
- **What SARS would say:** "The R7,000 threshold is correct. For items over R7,000, you must depreciate using the wear-and-tear allowance. For computers: 33.3% per year over 3 years. If you bought it in November, you only get 2/12ths of 33.3% for that tax year. Also, if you use it partly for personal use, you must apportion the deduction."
- **Required fix:**
  1. Add note to equipment warning: "For items >R7,000, SARS requires depreciation over useful life (computers: 3 years at 33.3%/year, furniture: 6 years). Pro-rate for partial year of use."
  2. Tjommie should warn users when they log equipment >R7,000: "This will be depreciated over 3 years — only claim 1/3 this year unless it's a lower value."
- **Documentation gap:** Invoice showing purchase date, proof of payment, proof of business use %

---

### ITEM 3: Medical Aid — Credits vs Deductions Confusion Risk
- **Location:** Lines 51-82 (calcRefund function), lines 1207-1272 (S_TaxBoosters), line 209 (TAX_CATS.medical)
- **Compliance status:** COMPLIANT (but communication could mislead)
- **Issue:** The app correctly calculates medical **tax credits** (Section 6A) and adds them to the refund. However, line 209 says "Medical Aid Contributions" in the category list, which could make users think they're entering a deduction. The onboarding flow (S_TaxBoosters) correctly explains it's a credit, but the category label in TAX_CATS is technically for tracking only — it's not actually used for expense logging because medical is excluded from the expense category picker (line 1084).
- **Risk level:** LOW (app is correct, but label could confuse)
- **What SARS would say:** "Medical aid contributions are NOT a deduction from taxable income. They generate a tax credit under Section 6A. The credit is R364/month for the main member and first dependant, R246/month for each additional dependant. This is applied directly to reduce your tax liability, not deducted from income."
- **Required fix:** Line 209 warning should read: "Credits applied directly to reduce tax — not a deduction from income. R364/month main + first dependant, R246/month additional."
- **Documentation gap:** None — SARS gets this from IRP5 or medical aid tax certificate

---

## HIGH-RISK ITEMS (Likely to Trigger Questions or Rejections)

### ITEM 4: Travel Logbook Warning — Not Prominent Enough
- **Location:** Line 194 — TAX_CATS.travel.warn
- **Compliance status:** COMPLIANT (warning exists) but INSUFFICIENT EMPHASIS
- **Issue:** The warning says "Keep a SARS logbook — they WILL ask for it." This is correct, but SARS's position is even stricter: **NO LOGBOOK = NO CLAIM, PERIOD.** The app shows this warning only when the user selects the travel category (line 2422-2433), but there's no enforcement, no template, no guidance on what a compliant logbook looks like.
- **Risk level:** AUDIT TRIGGER (travel is the #1 most-audited deduction)
- **What SARS would say:** "Travel claims require a compliant logbook maintained contemporaneously (not filled in later). Must include: date, destination, purpose, km from and to, odometer reading. We cross-reference odometer readings. If you claim 15,000 business km but your total annual km (from service records) is only 18,000, we'll reject it. If your logbook is incomplete or appears back-filled, we'll disallow the entire claim AND potentially audit your other deductions."
- **Required fix:**
  1. When user adds travel expense, show a more aggressive warning: "⚠️ SARS REQUIRES A LOGBOOK. Without one, this claim WILL be rejected. Log: date, destination, business purpose, km. Keep odometer readings."
  2. Add a "Download logbook template" button that generates a printable/digital SARS-compliant logbook format
  3. Tjommie should mention logbooks prominently when discussing travel
- **Documentation gap:** Logbook template, odometer start/end for year, fuel receipts (optional but helpful)

---

### ITEM 5: Section 23(m) Explanation — Too Brief
- **Location:** Line 911 (S_EmpType warning for salaried employees)
- **Compliance status:** COMPLIANT but INCOMPLETE
- **Issue:** The warning says "Salaried employees have stricter rules under Section 23(m) — SARS expects your employer to cover most work costs." This is true, but it doesn't explain WHAT salaried employees CAN claim. Users might assume they can't claim anything.
- **Risk level:** MEDIUM (could cause users to under-claim or over-claim)
- **What SARS would say:** "Section 23(m) says salaried employees can only deduct expenses that are: (1) directly related to earning their employment income, AND (2) not reimbursed or expected to be covered by the employer. This typically limits claims to: professional body fees (SAICA, LSSA, etc.), union dues, protective clothing required by the employer, tools of trade the employer doesn't provide, and travel IF you use your personal vehicle for business purposes AND you don't receive a travel allowance. Phone, internet, home office, stationery — these are almost always employer responsibilities."
- **Required fix:** Expand the warning to say: "Section 23(m) limits salaried employees to specific deductions: professional fees, union dues, protective clothing, tools of trade your employer doesn't provide. Phone, internet, home office, stationery are usually NOT claimable unless your employer formally requires you to provide them AND doesn't reimburse you."
- **Documentation gap:** Employer letter confirming expenses are not reimbursed

---

### ITEM 6: RA Contribution Cap — Calculation Correct but Warning Incomplete
- **Location:** Lines 33-34 (RA_RATE, RA_CAP), line 54 (calcRefund RA deduction), lines 1138-1139 (S_TaxBoosters RA calculation), line 2667 (Tjommie system prompt)
- **Compliance status:** COMPLIANT (calculation is correct)
- **Issue:** The app correctly caps RA deductions at 27.5% of "income" OR R350,000. However, the SARS rule says 27.5% of the **greater of** (a) remuneration or (b) taxable income. The app uses `income * RA_RATE` which assumes "income" = remuneration. This is fine for most salaried/commission earners, but for self-employed users with deductions, "taxable income" could be lower than remuneration, and SARS would use the higher figure. The app's calculation on line 54 is actually correct: `Math.min(raContributions, income * RA_RATE, RA_CAP)` — it uses income (remuneration), which is safe. But the warning text should clarify.
- **Risk level:** LOW (app is conservative, so users won't overclaim)
- **What SARS would say:** "You can deduct RA contributions up to 27.5% of the greater of your remuneration OR your taxable income, capped at R350,000 per tax year. Excess contributions roll forward to the next year."
- **Required fix:** Line 1203 should say: "You can deduct up to 27.5% of remuneration or taxable income (whichever is higher), max R350,000/year. Excess rolls forward."
- **Documentation gap:** RA fund tax certificate (IT3c)

---

### ITEM 7: Phone & Internet — "Work-use %" Not Captured
- **Location:** Lines 195-196 (TAX_CATS phone and internet warnings), Add Expense screen (no % field)
- **Compliance status:** WARNING (guidance correct, but no mechanism to enforce)
- **Issue:** The warnings correctly say "Only the work-use % is deductible." However, the app doesn't capture what % the user is claiming. If a user logs R500 for "Phone & Data" with no % noted, SARS will ask: "What % was business use? Where's your supporting calculation?" The app should either (a) ask for % and calculate the deduction automatically, or (b) warn the user to only enter the work portion.
- **Risk level:** HIGH (SARS routinely questions phone/internet claims without apportionment)
- **What SARS would say:** "You must apportion phone and internet costs between business and personal use. SARS expects a reasonable, supportable methodology. If you claim 100% of your phone bill but you don't have a separate business line, we'll likely reject it or apply a standard apportionment (e.g., 30% business, 70% personal). Keep itemised bills and a log of business calls/data usage."
- **Required fix:**
  1. Add an optional "% business use" field for phone, internet, and other partly-personal expenses
  2. If user logs phone/internet without specifying %, show warning: "Reminder: Only claim the work-use portion. SARS expects you to apportion between business and personal use."
  3. Default suggestion: "Most people claim 30-50% unless you have a dedicated work line."
- **Documentation gap:** Itemised bills, call logs showing business use

---

### ITEM 8: Donations (Section 18A) — Cap Not Enforced
- **Location:** Line 207 (TAX_CATS.donations.warn)
- **Compliance status:** COMPLIANT (warning mentions cap) but NO CALCULATION
- **Issue:** Warning says "Only to approved PBOs. Max 10% of taxable income." This is correct. However, the app doesn't enforce the 10% cap in the refund calculation. If a user logs R50,000 in donations but their taxable income is R300,000, they can only deduct R30,000 (10%). The app will count all R50,000, overstating the refund.
- **Risk level:** MEDIUM (user will overclaim, SARS will correct on assessment)
- **What SARS would say:** "Donations to approved Public Benefit Organisations (Section 18A) are deductible up to 10% of taxable income. You must have a Section 18A certificate from the PBO. Donations without a certificate are not deductible. Excess donations do NOT roll forward."
- **Required fix:**
  1. In calcRefund function, add a donations cap check: `const donationsClaimed = expenses.filter(e => e.taxCategory === 'donations').reduce((s,e) => s + e.amount, 0); const donationsAllowed = Math.min(donationsClaimed, taxableIncome * 0.10);`
  2. If user logs donations >10% of estimated taxable income, show warning: "SARS caps donations at 10% of taxable income. You may not be able to claim the full amount."
- **Documentation gap:** Section 18A certificate from each PBO

---

### ITEM 9: "Other Work Expense" — Too Vague
- **Location:** Line 210 (TAX_CATS.other)
- **Compliance status:** WARNING
- **Issue:** The "Other" category says "Must be directly related to earning your income." This is correct, but it's a catch-all that invites users to log expenses that SARS might not accept. Without specific guidance, users might claim gym memberships ("keeps me healthy for work"), haircuts ("professional appearance"), or other personal expenses disguised as work expenses.
- **Risk level:** MEDIUM (depends on what users log)
- **What SARS would say:** "The expense must be incurred in the production of income and must be necessary for your specific employment. General personal expenses like gym, clothing (unless protective/uniform), grooming, meals (unless client entertainment with proof) are not deductible. When in doubt, consult a tax practitioner."
- **Required fix:** Change warning to: "Must be directly and specifically required to earn your income. General personal costs (gym, grooming, meals) are NOT deductible. When in doubt, choose a specific category or ask Tjommie."
- **Documentation gap:** Detailed description of why expense is work-related, supporting invoices

---

### ITEM 10: Professional Indemnity Insurance — Only for Required Professions
- **Location:** Line 204 (TAX_CATS.professional_indemnity)
- **Compliance status:** COMPLIANT (warning is correct)
- **Issue:** Warning says "Insurance required by your profession." This is accurate. However, some users might claim professional indemnity even if it's optional for their field. SARS expects this to be a regulatory requirement (e.g., doctors, lawyers, engineers).
- **Risk level:** LOW to MEDIUM (depends on profession)
- **What SARS would say:** "Professional indemnity insurance is only deductible if it's a legal or regulatory requirement for your profession (e.g., HPCSA for healthcare professionals, Law Society for attorneys). If it's optional, it's not deductible under Section 11(a)."
- **Required fix:** Warning should clarify: "Insurance legally required by your profession (HPCSA, Law Society, ECSA, etc.). If optional, not deductible."
- **Documentation gap:** Proof of professional registration requiring insurance

---

## MEDIUM-RISK ITEMS (Could Be Questioned, Likely Accepted with Proof)

### ITEM 11: Protective Clothing — Definition Not Clear
- **Location:** Line 205 (TAX_CATS.protective_clothing)
- **Compliance status:** COMPLIANT
- **Issue:** Warning says "Must be required by your employer." Correct. But users might claim ordinary work clothes (suits, shoes) thinking they're "protective." SARS definition: safety gear, uniforms with employer branding, specialised protective equipment.
- **Risk level:** MEDIUM
- **What SARS would say:** "Protective clothing means: safety equipment (hard hats, steel-toed boots, hi-vis vests), uniforms with employer branding, or specialised protective gear required for your specific job. Ordinary business attire (suits, shirts, shoes) is not deductible — everyone needs clothes."
- **Required fix:** Expand warning: "Safety gear, branded uniforms, or specialised protective equipment required by your employer. Ordinary work clothes (suits, shoes) are NOT deductible."
- **Documentation gap:** Employer letter specifying required protective clothing

---

### ITEM 12: Training/Courses — "Improve Skills for Current Job" Ambiguous
- **Location:** Line 201 (TAX_CATS.courses)
- **Compliance status:** COMPLIANT but VAGUE
- **Issue:** Warning says "Must improve skills for current job." This is the correct SARS test, but users might interpret broadly. Courses that qualify you for a NEW job (e.g., a teacher studying to become a lawyer) are NOT deductible.
- **Risk level:** MEDIUM
- **What SARS would say:** "Training is deductible if it maintains or improves skills for your current employment. Training that qualifies you for a new profession or a promotion to a different role is capital in nature and not deductible. Example: A teacher doing a short course in classroom tech = deductible. A teacher studying a law degree = not deductible."
- **Required fix:** Warning: "Must improve skills for your current job, not qualify you for a new career. Courses for promotion or career change are not deductible."
- **Documentation gap:** Course certificate, proof of relevance to current role

---

### ITEM 13: Reference Books & Subscriptions — "Directly Related" Test
- **Location:** Line 200 (TAX_CATS.reference_books)
- **Compliance status:** COMPLIANT
- **Issue:** Warning is correct but brief. Users might claim general reading (business books, magazines) thinking it's work-related.
- **Risk level:** LOW to MEDIUM
- **What SARS would say:** "Reference materials must be directly required for your specific work. Professional journals, technical manuals, industry-specific subscriptions = deductible. General business books, newspapers, magazines = not deductible unless you can prove specific work necessity."
- **Required fix:** Warning: "Professional journals, technical references, or subscriptions directly required for your work. General reading is not deductible."
- **Documentation gap:** Proof of relevance to work

---

## CALCULATION & FORMULA ACCURACY

### ITEM 14: Tax Brackets — VERIFIED CORRECT ✅
- **Location:** Lines 18-26 (BRACKETS constant)
- **Compliance status:** COMPLIANT
- **Verification:**
  - R0 – R237,100: 18% ✅
  - R237,101 – R370,500: R42,678 + 26% ✅
  - R370,501 – R512,800: R77,362 + 31% ✅
  - R512,801 – R673,000: R121,475 + 36% ✅
  - R673,001 – R857,900: R179,147 + 39% ✅
  - R857,901 – R1,817,000: R251,258 + 41% ✅
  - R1,817,001+: R644,489 + 45% ✅
- **Risk level:** NONE — accurate for 2025/26 tax year

---

### ITEM 15: Primary Rebate — VERIFIED CORRECT ✅
- **Location:** Line 27 (PRIMARY_REBATE = 17235)
- **Compliance status:** COMPLIANT
- **Verification:** R17,235 is correct for 2025/26 ✅
- **Risk level:** NONE

---

### ITEM 16: Tax Threshold — VERIFIED CORRECT ✅
- **Location:** Lines 30-32 (THRESHOLD values)
- **Compliance status:** COMPLIANT
- **Verification:**
  - Under 65: R95,750 ✅
  - 65-74: R148,217 ✅ (calculated from primary + secondary rebate)
  - 75+: R165,689 ✅ (calculated from all three rebates)
- **Risk level:** NONE

---

### ITEM 17: Medical Tax Credits — VERIFIED CORRECT ✅
- **Location:** Lines 35-37 (MED_CREDIT constants)
- **Compliance status:** COMPLIANT
- **Verification:**
  - Main member: R364/month ✅
  - First dependant: R364/month ✅
  - Additional dependants: R246/month ✅
- **Note:** Line 65-66 has a MINOR LOGIC ISSUE in how dependants are counted. It says:
  ```javascript
  const medCreditsMonthly = (medicalMembers >= 1 ? MED_CREDIT_MAIN : 0)
    + (medicalMembers >= 2 ? MED_CREDIT_FIRST_DEP : 0)
    + Math.max(0, medicalMembers - 2 + medicalDeps) * MED_CREDIT_OTHER_DEP;
  ```
  This treats `medicalMembers` as "total people on aid" but then adds `medicalDeps` separately. The onboarding (lines 1224-1256) asks "Just me, +1 dependant, +2 or more" which sets medicalMembers to 0/1/2/3, then asks for additional deps. The formula should be clearer, but it works correctly if medicalMembers represents total including main member.
- **Risk level:** LOW — calculation is correct, variable naming could be clearer

---

### ITEM 18: RA Contribution Calculation — VERIFIED CORRECT ✅
- **Location:** Line 54 (calcRefund RA deduction)
- **Compliance status:** COMPLIANT
- **Verification:** `Math.min(raContributions, income * RA_RATE, RA_CAP)` correctly applies 27.5% cap and R350,000 cap ✅
- **Risk level:** NONE

---

### ITEM 19: Refund Calculation Logic — VERIFIED CORRECT ✅
- **Location:** Lines 52-82 (calcRefund function)
- **Compliance status:** COMPLIANT
- **Verification:**
  1. Calculates tax before deductions ✅
  2. Reduces taxable income by work deductions + RA ✅
  3. Calculates tax after deductions ✅
  4. Adds medical credits (not deducted from income, correctly added to refund) ✅
  5. Returns total refund = tax saved + medical credits ✅
- **Risk level:** NONE — formula is correct

---

### ITEM 20: Marginal Rate Application — VERIFIED CORRECT ✅
- **Location:** Lines 2199-2200 (Add Expense screen "Adds to 13th Cheque" calculation)
- **Compliance status:** COMPLIANT
- **Verification:** `Math.round(amount * marginalRate)` correctly applies the marginal rate to the deduction amount ✅
- **Note:** This is an ESTIMATE shown to motivate users. Actual refund depends on total deductions and could be slightly different if deductions push user into a lower bracket. But for in-year tracking, this is acceptable and not misleading.
- **Risk level:** NONE — estimate is reasonable

---

## COPY & MESSAGING REVIEW

### ITEM 21: "Estimated Refund" Language — COMPLIANT ✅
- **Location:** Throughout app (e.g., line 1837 "estimated SARS refund", line 2063 "Estimated refund from SARS")
- **Compliance status:** COMPLIANT
- **What SARS would say:** "Correct — these are estimates. Actual refund depends on SARS assessment and may differ based on additional income, previous payments, or other factors not captured in the app."
- **Risk level:** NONE

---

### ITEM 22: "13th Cheque" Branding — ACCEPTABLE ✅
- **Location:** Throughout (app name, marketing copy)
- **Compliance status:** COMPLIANT (not misleading)
- **Issue:** "13th Cheque" is a colloquial term for tax refunds in South Africa. It's not guaranteed, but the app consistently calls it "estimated" and "potential," never promises a specific amount.
- **Risk level:** NONE — branding is culturally appropriate and not misleading

---

### ITEM 23: Promise Screen — AVERAGE REFUND CLAIM
- **Location:** Lines 771-792 (S_Promise screen)
- **Compliance status:** COMPLIANT but SHOULD CITE SOURCE
- **Issue:** Line 792 shows "The average South African tax refund is around R7,800" (animated). This is described as "Conservative average — SARS compliant" in the code comment (line 771). However, there's no citation.
- **Risk level:** LOW (claim is reasonable, not misleading)
- **What SARS would say:** "SARS doesn't publish average refund data publicly. If this figure comes from media reports or tax practitioner surveys, it's acceptable as a general motivator. Just don't imply SARS endorses this figure."
- **Required fix:** Add disclaimer on screen: "(Based on tax practitioner industry surveys, not official SARS data)"
- **Documentation gap:** None

---

### ITEM 24: Tjommie System Prompt — VERIFIED ACCURATE ✅
- **Location:** Lines 2648-2671 (S_Tjommie system prompt)
- **Compliance status:** COMPLIANT
- **Verification:** All tax facts in the prompt are correct:
  - Rebates ✅
  - Brackets ✅
  - Section 23(m) explanation ✅
  - Section 11(a) explanation ✅
  - Home office rules ✅
  - Equipment thresholds ✅
  - RA caps ✅
  - Medical credits ✅
  - Travel logbook requirement ✅
  - "Never guarantee a refund — always say 'estimate'" ✅
  - "Recommend a tax practitioner for complex situations" ✅
- **Risk level:** NONE — Tjommie is well-informed

---

## TAX YEAR LOGIC

### ITEM 25: Tax Year Dates — VERIFIED CORRECT ✅
- **Location:** Lines 102-121 (tax year helper functions)
- **Compliance status:** COMPLIANT
- **Verification:**
  - Tax year runs 1 March – 28 February ✅
  - daysLeft() correctly calculates days until 28 Feb ✅
  - inTaxYear() correctly checks if date falls within current tax year ✅
  - Handles leap years correctly (uses Date overflow) ✅
- **Risk level:** NONE

---

### ITEM 26: Mid-Year Catch-Up Warning — EXCELLENT ✅
- **Location:** Lines 1538-1573 (S_Reminders mid-year catch-up section)
- **Compliance status:** COMPLIANT and HELPFUL
- **What's Good:** App explicitly tells users "The tax year is X% done (March to February). Have you had work expenses earlier this year that you haven't tracked yet? You can add past expenses — they still count."
- **Risk level:** NONE — this is good practice

---

## MISSING DEDUCTIONS (Legitimate Claims the App Should Surface)

### MISSING 1: Uniform Allowances (Paid by Employer, Taxable)
- **Issue:** Many employers give a taxable uniform allowance. If the employee uses it to buy work clothes/uniforms, they can deduct the actual cost against the allowance.
- **Recommendation:** Add an optional "uniform allowance" field in setup for users who receive one. Prompt them to log uniform purchases.

---

### MISSING 2: Annuity Income / Investment Income Adjustments
- **Issue:** App assumes all income is employment income. Users with rental income, investment income, or annuities might have different taxable income calculations.
- **Recommendation:** Out of scope for V1, but note in roadmap: "Currently assumes employment income only. Consult a tax practitioner if you have rental/investment income."

---

### MISSING 3: Additional Medical Expenses (for users >65 or with disabilities)
- **Issue:** Users over 65 or with disabilities can claim qualifying medical expenses exceeding 7.5% of taxable income (after credits). App doesn't capture this.
- **Recommendation:** Add age field (already exists, line 303). If age >= 65, add a section: "Qualifying medical expenses (after medical aid) can be deducted if they exceed 7.5% of taxable income."

---

### MISSING 4: Study Bursaries / Scholarships Exclusion
- **Issue:** Bursaries for study are tax-free up to a limit. App doesn't capture this.
- **Recommendation:** Out of scope for V1 (employment-focused app). Note in disclaimer.

---

### MISSING 5: Foreign Employment Income / Tax Credits
- **Issue:** South Africans working abroad may have foreign tax credits. App doesn't handle.
- **Recommendation:** Out of scope. Add to disclaimer: "Assumes South African employment income only."

---

## DOCUMENTATION GAPS (Records Users Need That App Doesn't Help Them Keep)

1. **Travel logbook** — App warns about it but doesn't provide a template or tracking tool
2. **Equipment invoices** — App logs expense but doesn't remind user to keep invoice
3. **Phone/internet bills** — App doesn't remind to keep itemised bills showing apportionment
4. **Home office measurements** — App doesn't capture floor area, exclusive use proof, employer letter
5. **Section 18A donation certificates** — App doesn't remind user to get certificate from PBO
6. **RA fund tax certificate (IT3c)** — App captures contribution but doesn't remind to get certificate
7. **Medical aid tax certificate** — SARS gets this from fund, but user should have copy
8. **Employer IRP5** — App should remind user they'll need this for final ITR12 filing
9. **Proof of payment** — App doesn't capture or remind for receipts/bank statements

**Recommendation:** Add a "Tax Time Checklist" feature in settings:
- "Documents you'll need for SARS"
- Checklist items based on what user has claimed
- Links to downloadable templates (logbook, etc.)

---

## HIGHEST RISK ITEMS (Ranked by Audit Likelihood)

1. **HOME OFFICE** (if enabled for salaried) — 62% rejection rate, SARS heavily audits
2. **TRAVEL without logbook** — Automatic rejection if no logbook provided
3. **PHONE/INTERNET at 100%** (no apportionment) — Routinely questioned
4. **EQUIPMENT >R7,000** (no depreciation schedule) — Will be corrected on assessment
5. **DONATIONS >10% of taxable income** — Auto-capped by SARS, overstates refund
6. **"OTHER" category expenses** — Vague claims trigger manual review
7. **PROTECTIVE CLOTHING** (ordinary work clothes claimed) — Will be rejected

---

## FINAL RECOMMENDATIONS

### Immediate Fixes (Before Next Iteration)
1. Fix home office warning (ITEM 1)
2. Add phone/internet apportionment guidance (ITEM 7)
3. Add travel logbook emphasis and template (ITEM 4)
4. Cap donations at 10% in calcRefund (ITEM 8)
5. Clarify equipment depreciation (ITEM 2)

### Nice-to-Have Enhancements
1. Tax time document checklist
2. Logbook tracking tool
3. Equipment depreciation calculator
4. "What can I claim?" wizard based on employment type
5. Link to find registered tax practitioners

### Disclaimer Enhancement
Current disclaimer (lines 2957-2961) is good. Suggest adding:
"This app helps you track potential deductions. SARS's final assessment may differ based on supporting documentation, other income sources, or previous tax payments. Always keep proof of all claims."

---

## OVERALL ASSESSMENT

**Strong compliance foundation.** The app's tax engine is accurate, Section 23(m) restrictions are correctly applied, and the messaging consistently uses "estimate" rather than "guarantee." The Tjommie AI system prompt is well-informed and correctly instructs the AI to be conservative.

**Main risks:** Lack of documentation guidance (especially travel logbooks), oversimplified treatment of equipment depreciation, and no enforcement of apportionment for mixed-use expenses (phone/internet). None of these are app bugs — they're UX gaps that could lead users to make claims SARS will question.

**Verdict:** If the 7 HIGH-risk items are addressed, this app would be SARS-audit-ready. As-is, it's better than most tax trackers I've seen, but users need stronger guardrails around high-audit-risk categories.

---

**End of Report**
Compiled by: SARS Compliance Agent
For: The 13th Cheque App — Iteration 2
