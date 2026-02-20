# SA Tax Consultant Agent Report — Iteration 2
**Date**: 2026-02-20
**Build**: thirteenth-cheque-final.jsx (3435 lines)
**Tax Year**: 2025/26 (verified SARS brackets, rebates, rates)

---

## Executive Summary

This app is SARS-compliant and legally sound. The tax math is correct, the brackets are current, and Section 23(m) restrictions are properly enforced. **However**, compliance is not the same as optimisation. The app does the minimum — it helps users track what they've spent, but it doesn't actively help them find money they're leaving on the table.

**The gap**: A good tax practitioner doesn't just validate deductions. They ask: "What else could this person be claiming that they haven't thought of yet?" This app isn't asking that question enough.

---

## Detailed Review

### ✅ ITEM: Tax calculation engine (calcTax, calcRefund functions)
- **Advice quality**: OPTIMAL
- **What a good practitioner would add**: Nothing — this is correct
- **Assessment**: 2025/26 brackets verified, rebates correct, thresholds accurate. RA cap (R350k), RA rate (27.5%), medical credits (R364/R246) all match current SARS rules. The marginal rate calculation is used correctly throughout.

---

### ✅ ITEM: Section 23(m) enforcement (salaried employee restrictions)
- **Advice quality**: OPTIMAL
- **What a good practitioner would add**: The warning text is clear and accurate
- **Assessment**: The app correctly removes home_office, travel, and equipment for pure salaried employees. The >50% commission threshold for expanded deductions is correctly implemented. This matches SARS interpretation.

---

### ⚠️ ITEM: RA (Retirement Annuity) surfacing in setup
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Scenario modeling — "If you started an RA today at R1,500/month, your refund would grow by approximately R6,500/year. That's R542/month back from SARS."
- **Missed opportunity**: The setup shows the benefit if they're already contributing, but doesn't model "what if I started now?" Most users don't have an RA yet. Show them the exact saving if they started one.
- **Improvement**: Add a "Don't have an RA yet?" prompt with a calculator showing: "R500/month → saves you R2,000/year at your tax rate" with a live slider.

---

### ⚠️ ITEM: Career-aware deduction suggestions (S_CareerSuggestions screen)
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Specific annual value estimates per category
- **Missed opportunity**: The career profiles are good (teacher, IT, creative, healthcare, sales, legal, trades, driver), but they don't tell the user *how much* each category typically adds up to. A teacher doesn't know that stationery + reference books typically = R3,000-R5,000/year. An IT worker doesn't know their laptop + courses = R8,000-R12,000/year.
- **Career relevance**: Profiles are accurate and well-matched to SA occupations
- **Improvement**: Add typical annual values next to each suggested category: "Stationery & Printing (typically R2,000-R4,000/year for teachers)"

---

### 🚨 ITEM: Out-of-pocket medical expenses — completely missing
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: A medical expenses category that tracks:
  - Dentist visits (not covered by aid)
  - Optometrist / glasses (not covered)
  - Specialist co-payments
  - Medication (chronic or acute, not covered)
  - Medical aid gap cover premiums
- **Missed opportunity**: This is a HUGE one. Medical aid *credits* are correctly applied (R364/R246 per month), but the app doesn't track qualifying *out-of-pocket* medical expenses. Under Section 18, amounts above 7.5% of taxable income become deductible. For someone earning R40k/month (R480k/year), the threshold is R36,000. Anything above that is deductible. A family with braces, specs, and chronic meds can easily hit R50k-R60k. That's R14k-R24k in deductions = R5k-R9k back.
- **Improvement**: Add "Out-of-pocket medical" as a work expense category with a Tjommie explainer: "Medical costs NOT covered by your aid — above 7.5% of your income, these become tax deductible. Track dentist, optometrist, meds, specialists."

---

### 🚨 ITEM: Interest income exemption — not mentioned
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: A prompt during setup or in Tjommie: "Do you have savings or investments earning interest? The first R23,800 is tax-free (under 65). If you're earning more than that, we should track it."
- **Missed opportunity**: Most South Africans with a savings account or money market fund don't declare interest income, and they don't know the first R23,800 is exempt. The app should surface this.
- **Improvement**: Add an "Other income" section in setup asking: "Do you earn interest, dividends, or rental income?" with a clear "First R23,800 interest = tax-free" explainer.

---

### ⚠️ ITEM: Travel / logbook requirement (TAX_CATS travel warning)
- **Advice quality**: OPTIMAL (warning text is correct)
- **What a good practitioner would add**: Practical logbook guidance
- **Assessment**: The warning "Keep a SARS logbook — they WILL ask for it" is accurate and appropriately stern. However, most users don't know what a compliant logbook looks like.
- **Improvement**: Add a Tjommie response for travel claims: "You need to track: date, destination, business purpose, and km. SARS will reject the claim without a logbook. Keep it in your car or use an app like MileageCount."

---

### ⚠️ ITEM: Home office deduction (TAX_CATS home_office warning)
- **Advice quality**: OPTIMAL
- **What a good practitioner would add**: Calculation helper
- **Assessment**: The warning is strict and correct: "STRICT: You need a dedicated room used >50% for work AND your income must be >50% commission. Salaried = almost never allowed."
- **Missed opportunity**: For users who *do* qualify (commission >50% or self-employed), the app doesn't help them calculate it. A compliant home office claim requires: (room size / total house size) × (bond interest + rates + electricity + insurance). Most users don't know how to do this.
- **Improvement**: For qualifying users, add a home office calculator: "Your office is 12m² and your house is 120m². That's 10%. Apply it to your bond interest, rates, electricity, and insurance. We'll guide you."

---

### ⚠️ ITEM: Depreciation on equipment (TAX_CATS computer warning)
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Year-by-year depreciation tracking
- **Assessment**: The warning "Depreciation over 3 years, or full if under R7,000" is correct, but the app doesn't track multi-year assets. If a user bought a R15,000 laptop in 2024, they can claim R5,000 this year, R5,000 next year, R5,000 the year after. The app logs it once and forgets it.
- **Improvement**: Add an "Asset register" for items >R7k with automatic annual depreciation reminders: "Your 2024 laptop still has R10,000 to claim (R5k this year, R5k next year)."

---

### ⚠️ ITEM: Donations (Section 18A) — present but underpromoted
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Context on which organisations qualify
- **Assessment**: Donations category exists with correct 10% cap warning, but most users don't know which donations qualify. Church tithes? No (unless to an 18A-approved church entity). School fees? No. Charity donations? Only if the org has 18A status.
- **Improvement**: Tjommie should explain: "Only donations to approved PBOs (Public Benefit Organisations) qualify. Ask the charity for an 18A certificate. School fees and church donations usually don't qualify unless the org is registered."

---

### 🚨 ITEM: Mid-year scenario planning — completely missing
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: "What if?" modeling
- **Missed opportunity**: A smart practitioner helps clients make decisions *during* the year, not just track history. The app doesn't answer questions like:
  - "If I start an RA now, how much will my refund grow?"
  - "If I buy a new laptop for R12,000, how much do I save this year?"
  - "Should I accelerate my medical expenses into this tax year or spread them?"
- **Improvement**: Add a "Tax Planner" screen where users can model decisions: "Thinking of buying a laptop? Enter the cost and see the tax impact."

---

### ⚠️ ITEM: Tax practitioner / accountant fees — not surfaced
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Explicit reminder
- **Missed opportunity**: The cost of filing your tax return (if you use a practitioner or accountant) is itself deductible. The app has "professional_fees" but it's positioned as SAICA/LSSA/HPCSA fees, not "the accountant who does my tax return."
- **Improvement**: Add a Tjommie prompt in Jan/Feb: "Reminder: If you're paying someone to file your tax return this year, that fee is deductible. Log it as a work expense."

---

### ⚠️ ITEM: Tjommie chat system prompt (line 2648-2671)
- **Advice quality**: ADEQUATE → OPTIMAL
- **What a good practitioner would add**: More strategic guidance, less reactive
- **Assessment**: The system prompt is accurate and comprehensive. Tjommie knows SARS rules, brackets, Section 23(m), Section 11(a), home office requirements, equipment depreciation, RA caps, medical credits. **However**, the prompt is defensive ("never guarantee a refund", "recommend a tax practitioner for complex situations"). This is legally safe but strategically passive.
- **Career relevance**: Prompt doesn't adjust tone or examples based on user's occupation
- **Improvement**: Make Tjommie more proactive. Instead of waiting for questions, have him periodically ask:
  - "Have you had any big medical bills this year? Let's see if they're deductible."
  - "As a [occupation], here are three things people in your field often miss: [1, 2, 3]"
  - "You're halfway through the tax year. Let's do a quick check — anything big coming up you should plan for?"

---

### ⚠️ ITEM: Refund breakdown on 13th Cheque screen
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: "Next R1,000 in deductions would add R360 to your refund (at your 36% rate)"
- **Missed opportunity**: The breakdown shows what they've earned so far (work expenses, RA, medical credits), but it doesn't show the marginal value of the next rand. A user at 36% doesn't know that every extra R100 in expenses = R36 back. Make that visible.
- **Improvement**: Add a line: "Every R100 more you claim = R[marginal × 100] extra refund at your rate"

---

### ⚠️ ITEM: Annual tax summary download (generateSummary function)
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Practitioner-ready formatting with section references
- **Assessment**: The text summary is clear and includes category breakdowns, RA, medical credits, and a disclaimer. However, it doesn't include SARS section references (e.g., "Travel — Section 8(1)(b)(ii)"). A practitioner receiving this summary would need to re-code everything.
- **Improvement**: Add section references to each category in the download. Format it like a draft ITR12 schedule.

---

### ✅ ITEM: Employment type decision tree (S_EmpType screen)
- **Advice quality**: OPTIMAL
- **What a good practitioner would add**: Nothing — this is excellent
- **Assessment**: The three-way split (self-employed / commission / salaried) is correct. The commission % threshold (>50% = full deductions) is accurate. The salaried warning about Section 23(m) is clear. The commission explainer ("earning >50% commission means you qualify for the full range of deductions, including travel and home office") is spot-on.

---

### ⚠️ ITEM: Tax year date validation (inTaxYear function, lines 115-121)
- **Advice quality**: OPTIMAL (validation is correct)
- **What a good practitioner would add**: Grace period awareness
- **Assessment**: The validation correctly identifies the tax year as 1 Mar – 28 Feb. The warning on out-of-range dates is accurate. However, the app doesn't acknowledge that users can often *amend* previous years' returns within a window.
- **Improvement**: For expenses dated in the previous tax year (Mar 2024 – Feb 2025), add: "This is last year. If you haven't filed yet, you can still claim it. If you've filed, you may be able to amend (check SARS eFiling)."

---

### 🚨 ITEM: Self-employed users — no business expense guidance
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: Comprehensive business deduction guidance
- **Missed opportunity**: The app treats self-employed users the same as commission earners. But self-employed people have access to a *much* wider range of deductions under Section 11(a). They can claim:
  - Bank charges on business accounts
  - Accounting / bookkeeping fees
  - Business insurance
  - Marketing / advertising
  - Website hosting
  - Business travel (domestic and international, with proof of business purpose)
  - Client entertainment (within limits)
  - Bad debts written off
  - Protective clothing / uniforms
  - License renewals / permits

  The current category list doesn't surface most of these.

- **Career relevance**: Self-employed users need a different deduction checklist than commission earners
- **Improvement**: If empType === "self", add categories: "Bank charges (business account)", "Accounting fees", "Marketing / advertising", "Business insurance", "Client entertainment". Add a Tjommie explainer: "As a self-employed person, you can deduct anything 'wholly and exclusively' incurred to produce income. That's a much wider range than salaried or commission earners."

---

### ⚠️ ITEM: Quarterly tax planning for self-employed (provisional tax)
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: Provisional tax reminders and estimates
- **Missed opportunity**: Self-employed and high-earning commission users are required to pay *provisional tax* in two instalments (Aug + Feb). The app doesn't mention this. A self-employed user tracking expenses all year may not realise they need to submit IRP6 returns and pay estimated tax twice a year, or they'll face penalties and interest.
- **Improvement**: For empType === "self" or commission >50%, add a Tjommie reminder in Jul: "You need to file provisional tax by end of Aug. Based on your income and deductions so far, here's a rough estimate of what you'll owe: [calculation]. Consult your accountant for the exact IRP6 amount."

---

### ⚠️ ITEM: Tax directive awareness (for large refunds)
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Tax directive explainer for users expecting R10k+ refunds
- **Missed opportunity**: Users with large anticipated refunds (especially those with big RA contributions or medical expenses) can apply for a *tax directive* mid-year to reduce their monthly PAYE deductions. Instead of waiting for a lump sum refund in July, they can increase their take-home pay now. The app doesn't mention this.
- **Improvement**: If estimated refund >R12,000, add a Tjommie prompt: "Your refund is looking big. Did you know you can apply for a tax directive to reduce your monthly PAYE instead of waiting for a lump sum? Your employer adjusts your deductions, and you see the money now. Worth chatting to HR or your tax practitioner."

---

### ⚠️ ITEM: Capital allowances (Section 12C, 12E wear-and-tear)
- **Advice quality**: SUBOPTIMAL
- **What a good practitioner would add**: Write-off schedules for vehicles, machinery, tools
- **Missed opportunity**: The app handles small equipment (<R7k = immediate deduction, >R7k = 3-year depreciation), but it doesn't handle vehicles or other capital assets correctly. A self-employed tradesperson buying a R200k bakkie can claim wear-and-tear over time (Section 12C: 20% per year on vehicles). The app doesn't track this.
- **Improvement**: For self-employed users, add a "Vehicle" category with depreciation tracking. "Your 2024 bakkie (R200k purchase price) → claim R40k/year for 5 years under Section 12C."

---

### ⚠️ ITEM: Foreign income and tax credits (Section 6quat)
- **Advice quality**: N/A (not addressed)
- **What a good practitioner would add**: Prompt for foreign income
- **Missed opportunity**: Many South Africans work remotely for foreign companies or earn foreign investment income. Foreign employment income above R1.25m is taxable in SA. The app doesn't ask about this.
- **Improvement**: Add a setup question: "Do you earn income from outside South Africa (salary, freelance, or investments)?" with a Tjommie explainer about the R1.25m exemption and foreign tax credit claims.

---

### ⚠️ ITEM: Tjommie response quality in actual chat (S_Tjommie screen)
- **Advice quality**: ADEQUATE (depends on Claude API's response quality)
- **What a good practitioner would add**: Preprogrammed "smart shortcuts" for common questions
- **Assessment**: Tjommie's system prompt is strong, but actual advice quality depends on the API response, which can be generic or miss key details. The quick questions ("How do I claim more?", "Am I on track?") are good starting points.
- **Improvement**: Add hard-coded expert responses for the top 10 questions instead of relying on the LLM every time:
  - "What can I claim as a salaried employee?" → hard-coded Section 23(m) explainer
  - "How does an RA work?" → hard-coded RA explainer with user's specific numbers
  - "What's my marginal rate?" → hard-coded calculation with examples
  This ensures consistency and accuracy.

---

### ⚠️ ITEM: Year-end tax filing reminder (Feb deadline awareness)
- **Advice quality**: ADEQUATE
- **What a good practitioner would add**: Explicit filing checklist
- **Assessment**: The app shows "X days until 28 Feb" and mentions the deadline, but it doesn't prepare the user for *what happens next* (filing season, IRP5, ITR12, supporting documents).
- **Improvement**: In January, add a Tjommie checklist:
  - "The tax year ends 28 Feb. Here's what to do next:"
  - "March: Get your IRP5 from your employer"
  - "March–Oct: SARS filing season opens — file your ITR12"
  - "You'll need: your IRP5, proof of all deductions (bank statements, invoices), medical aid certificate, RA contribution certificate"
  - "Your 13th Cheque summary is ready to download — give it to your tax practitioner or use it to complete your ITR12."

---

## HIGHEST VALUE MISSED DEDUCTIONS

Ranked by potential refund impact for typical users:

1. **Out-of-pocket medical expenses** (>7.5% of income threshold)
   *Potential value*: R3,000–R9,000 refund for families with braces, chronic meds, specs
   *Why it's missed*: Most people think "medical aid" = done. They don't track the gap.

2. **RA contributions** (for users not currently contributing)
   *Potential value*: R2,000–R10,000+ refund depending on contribution level
   *Why it's missed*: People don't know 27.5% of income is deductible, or that R500/month = R2k+ back

3. **Tax practitioner / accountant fees**
   *Potential value*: R500–R2,000 refund
   *Why it's missed*: People don't realise the cost of filing is itself deductible

4. **Interest income exemption** (first R23,800 tax-free)
   *Potential value*: R0 refund but avoids overpayment of tax on savings
   *Why it's missed*: Most people don't declare interest, or they declare it all as taxable

5. **Bank charges (business account, for self-employed)**
   *Potential value*: R400–R1,200 refund
   *Why it's missed*: Self-employed users don't think of monthly bank fees as deductible

6. **Depreciation carry-forward** (laptops, tools, vehicles bought in previous years)
   *Potential value*: R1,500–R5,000/year for 2-3 years
   *Why it's missed*: Users log the purchase once, then forget they can claim it again next year

7. **Professional indemnity insurance** (doctors, lawyers, accountants)
   *Potential value*: R2,000–R8,000 refund
   *Why it's missed*: Often paid annually and forgotten

8. **Marketing / advertising costs** (for self-employed / commission earners)
   *Potential value*: R1,000–R5,000 refund
   *Why it's missed*: Facebook ads, Google ads, business cards, flyers — all deductible, rarely tracked

---

## CAREER PROFILES NEEDED

Current profiles (teacher, IT, creative, healthcare, sales, legal, trades, driver) are good. Here's what needs expansion:

### **Self-employed / freelancer** (currently lumped with commission)
Needs its own profile with:
- Bank charges (business account)
- Accounting / bookkeeping fees
- Marketing / advertising
- Website / domain / hosting
- Business insurance
- Co-working space rental (if applicable)
- Client entertainment (within limits)
- Bad debts written off (with proof)

### **Real estate agent** (currently under "sales" but needs specific treatment)
Needs:
- MLS / PropData / Lightstone subscriptions
- Vehicle (with logbook — business km very high for agents)
- Marketing materials (for-sale boards, flyers, photography)
- License renewal fees (FFC, estate agency registration)
- Commission split to agency (if applicable)

### **Retail / hospitality worker** (not currently covered)
Needs:
- Uniform costs (if not employer-provided)
- Safety shoes (if required)
- Transport costs (if shift work and no employer transport)
Most retail/hospitality workers are salaried and have minimal deductions, but the app should still surface what's available.

### **Remote worker** (growing category, not currently addressed)
Needs:
- Home office (if self-employed or commission >50%)
- Internet / fibre (work portion)
- Electricity (work portion, if home office qualifies)
- Co-working day passes (if used for work)

### **Commission earner >50%** (currently treated identically to self-employed)
Needs differentiation:
- Commission earners still have an employer, so some employer-provided benefits (phone, vehicle allowance) may affect what they can claim
- Vehicle claims are common and high-value — needs specific logbook guidance
- Entertainment claims are valid but need to be business-related and documented

---

## TJOMMIE KNOWLEDGE GAPS

Tjommie's system prompt is comprehensive, but here are topics where his advice could be deeper:

### 1. **Practical compliance** (not just legal rules)
- Tjommie knows *what* is deductible, but not always *how* to document it properly
- Example: He knows travel requires a logbook, but he doesn't explain what a SARS-compliant logbook looks like or recommend tools (MileageCount, TripLogger, Excel template)

### 2. **Tax directive process**
- Tjommie mentions reducing PAYE mid-year for large refunds, but doesn't explain the IRP3(sd) form or how to apply via eFiling

### 3. **Provisional tax mechanics** (for self-employed)
- Tjommie knows self-employed users face different rules, but doesn't explain the IRP6 process, payment deadlines, or penalty calculation

### 4. **Multi-year planning**
- Tjommie is focused on the current tax year, but good tax planning involves looking ahead: "Should I accelerate this expense into this year or defer it to next year when my income will be higher?"

### 5. **SARS audit red flags**
- Tjommie should be able to answer: "Is this claim likely to trigger scrutiny?" (e.g., claiming 100% of your phone bill as work = audit risk; claiming 40% = reasonable)

### 6. **Alternative structures for high earners**
- For users earning >R1m/year, Tjommie should suggest: "At your income level, you might benefit from structuring via a personal services company (Pty Ltd). Speak to a tax practitioner about whether this makes sense for you."

### 7. **Regional variations** (provinces, municipalities)
- Rates, refuse removal, and some levies vary by municipality. Tjommie should acknowledge: "Property-related deductions depend on your municipality's billing structure."

---

## SUMMARY: Compliance vs. Optimisation

**Compliance score**: 9.5/10 — The app is legally sound, SARS-accurate, and won't get users in trouble.

**Optimisation score**: 6.5/10 — The app helps users track what they know about, but it doesn't actively find money they're leaving on the table.

**The gap**:
- Out-of-pocket medical expenses: completely missing (R3k–R9k left on table for many families)
- RA scenario modeling: absent (users don't see "what if I started one today?")
- Self-employed business expenses: under-surfaced (bank fees, accounting, marketing)
- Depreciation carry-forward: not tracked (users log a laptop once, forget it can be claimed for 3 years)
- Tax practitioner fees: not explicitly prompted
- Interest income exemption: not mentioned

**Recommendation**: The app has the foundation. Now layer on *proactive discovery*. Instead of waiting for users to know what to claim, Tjommie should periodically ask:
- "Any big medical bills this year? Let's see if they're deductible."
- "Bought any work equipment in the past 2 years? You might still be able to claim depreciation."
- "As a [occupation], here are three things people in your field often miss: [1, 2, 3]."

Make Tjommie a practitioner who *finds* money, not just a system that *validates* what the user already logged.

---

**Overall assessment**: This is a good app that's safe and accurate. With the additions above, it could become a *great* app that actively maximises refunds instead of just tracking them.

**Priority fixes for next iteration**:
1. Add out-of-pocket medical expenses category (>7.5% threshold)
2. Add RA scenario modeling ("What if I started R500/month today?")
3. Expand self-employed deduction categories (bank charges, accounting, marketing)
4. Add depreciation carry-forward tracking for multi-year assets
5. Add explicit tax practitioner fee reminder in Jan/Feb
6. Surface interest income exemption (R23,800 threshold) in setup

---

*Report completed by SA Tax Consultant Agent*
*Next review: After fixes implemented*
