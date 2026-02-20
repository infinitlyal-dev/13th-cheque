# Financial Literacy & Trust Agent Report -- Iteration 1

**Agent**: Financial Literacy & Trust Agent
**Date**: 2026-02-20
**Build Reviewed**: `thirteenth-cheque-v2.jsx`
**Perspective**: Consumer rights advocate and financial inclusion specialist with experience in low-income South African communities

---

## Executive Summary

The 13th Cheque app collects highly sensitive financial data (income, occupation, employment type, expense history) and transmits a portion of it to a third-party AI provider (Anthropic) without any disclosure, consent mechanism, or privacy statement. There is no POPIA compliance layer whatsoever. The app makes several financial literacy assumptions that will exclude users who most need it. While the tone is warm and the "Tjommie" personality is non-threatening, the absence of basic trust infrastructure means users are being asked to hand over their financial lives to an app that tells them nothing about what happens to their data.

**Overall Trust Rating**: HIGH RISK -- multiple critical gaps in privacy, consent, and inclusion.

---

## Detailed Item Review

---

### ITEM 1: Opening Promise Screen (S_Promise)

**Screen copy**: "SARS owes the average South African R18,400 every year. Unclaimed."

- **Trust signal**: SPENDS -- This is a specific, authoritative-sounding financial claim with no source citation. It implies a guarantee ("SARS owes"). Users who have been burned by investment schemes will recognise this pattern: "You're owed money, we'll help you get it." This is the language of financial fraud in South Africa.
- **POPIA status**: N/A (no data collected on this screen)
- **Literacy assumption**: TOO HIGH -- "Unclaimed" assumes the user understands that tax refunds exist and that they have a mechanism to be claimed. Many South Africans below the tax threshold do not know this.
- **SARS fear factor**: AMPLIFIES FEAR -- Telling someone "SARS owes you" triggers the immediate follow-up fear: "But what do I owe SARS?" This screen does not address that fear at all. For users with informal income or past non-compliance, this is a red flag that might cause them to close the app.
- **Inclusion gap**: Anyone earning below the tax threshold (R95,750/year or roughly R7,979/month) is excluded from this promise entirely. The app does not acknowledge this. A domestic worker earning R4,500/month will see "R18,400" and feel lied to once the app calculates their actual refund as R0.
- **Fix**: (1) Add a source for the R18,400 figure or change to softer language: "Many South Africans can claim back money from SARS -- let's see if you can too." (2) Add a line acknowledging that not everyone will qualify. (3) Address SARS fear directly: "This is about money SARS already has that belongs to you. Tracking your expenses is not the same as filing a return."

**Severity**: HIGH

---

### ITEM 2: No Privacy Statement or Consent Screen Before Data Collection

The app begins collecting personal data at Step 1 (S_EmpType -- employment type) and intensifies at Step 2 (S_Money -- name, occupation, income). At no point before or during data collection is the user informed of:
- What data is being collected
- Why it is being collected
- Where data is stored
- Who has access to data
- How long data is retained
- Their right to access, correct, or delete data
- That data will be transmitted to Anthropic's API

- **Trust signal**: SPENDS -- critically. A financial app that asks for your income without first explaining what happens to that information will lose the users who need the most convincing. South Africans who have experienced data breaches, vishing attacks, or employer exploitation will not enter their real income into an app that says nothing about privacy.
- **POPIA status**: NON-COMPLIANT -- This is a direct violation of POPIA Section 18 (notification), Section 11 (consent), and the principle of purpose limitation. The app processes personal information without any informed consent mechanism.
- **Literacy assumption**: N/A
- **SARS fear factor**: AMPLIFIES FEAR -- Users who fear creating a paper trail will be more fearful when they see no explanation of where their data goes. The absence of a privacy statement is itself a trust-destroying signal.
- **Inclusion gap**: Users who have been victims of financial fraud (a significant portion of the South African population) will be most likely to abandon the app at this point.
- **Fix**: Add a clear, plain-language privacy/consent screen before Step 1. It must state: (1) All data stays on your device (localStorage). (2) When you chat with Tjommie, your financial summary is sent to an AI service (Anthropic) to generate responses -- no data is stored by them beyond the conversation. (3) The app is not connected to SARS, your employer, or any bank. (4) You can delete all your data at any time from Settings. (5) Explicit consent button: "I understand and agree."

**Severity**: CRITICAL

---

### ITEM 3: Income Input (S_Money) -- Raw Number Field

The income field is a plain `type="number"` HTML input. The user is asked "Monthly gross income" with no explanation.

- **Trust signal**: NEUTRAL -- The field itself is not deceptive, but the lack of context makes it feel extractive.
- **POPIA status**: REQUIRES REVIEW -- Income data is sensitive personal information. Collection is justified for the app's purpose, but consent has not been obtained (see Item 2).
- **Literacy assumption**: TOO HIGH -- "Monthly gross income" assumes the user knows the difference between gross and net. Many South Africans, especially those in informal employment or those who receive a single "salary" amount, do not distinguish between gross and net. A domestic worker who receives R5,000 cash does not know if that is "gross" or "net." A salaried worker who sees R18,000 on their bank statement may not know their gross is R25,000.
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: (1) Users who are paid in cash or informally may not know their "monthly income" as a fixed number. (2) Users with variable income (commission earners, informal traders) cannot meaningfully enter a single number. (3) The raw number input with no formatting is hard to use on mobile -- entering "25000" without commas or a "R" prefix makes it easy to make errors (250000 vs 25000).
- **Fix**: (1) Add a plain-language explainer: "This is the total amount your employer pays before tax. If you're not sure, check your payslip under 'gross salary' or 'total earnings.' If you get paid cash with no payslip, just enter what you receive." (2) Format the input with commas and a R prefix. (3) For commission earners, allow an average or range. (4) Add a "I don't know my gross income" option that provides guidance.

**Severity**: HIGH

---

### ITEM 4: Employment Type Selection (S_EmpType)

Three options: "I work for myself," "I earn commission," "I get a salary."

- **Trust signal**: BUILDS -- The plain-language descriptions are good. "I get a salary -- Fixed monthly, employer deducts PAYE" is clear.
- **POPIA status**: REQUIRES REVIEW -- employment type is personal data being collected without consent.
- **Literacy assumption**: APPROPRIATE for formal economy workers. TOO HIGH for others -- see inclusion gap.
- **SARS fear factor**: NEUTRAL -- The warning for salaried employees ("stricter rules") is informative but the word "stricter" could be anxiety-inducing. Consider "different rules" instead.
- **Inclusion gap**: SIGNIFICANT. There is no option for: (1) Unemployed / receiving grants (UIF, SASSA). (2) Mixed income (salaried + side hustle). (3) Informal employment (domestic worker, gardener, street vendor). (4) Part-time or contract work that does not fit neatly into "freelancer." A domestic worker paid R4,500/month in cash has no idea if they are a "freelancer" or "salaried." A construction worker who gets paid per job is neither. These users will either pick the wrong option (leading to incorrect tax guidance) or abandon the app.
- **Fix**: (1) Add a fourth option: "It's complicated / I have more than one income" with a Tjommie-guided follow-up. (2) Add a brief explanation of what PAYE is for those who don't know. (3) Change "stricter rules" to "different rules" to reduce anxiety. (4) Consider adding: "Not earning yet or between jobs? You can still check if you're owed money from a previous tax year."

**Severity**: HIGH

---

### ITEM 5: Tjommie Chat -- Anthropic API Data Transmission (S_Tjommie)

The Tjommie chat feature sends a detailed financial profile to Anthropic's API as a system prompt, including: name, occupation, employment type, monthly income, annual income, tax amount, marginal rate, deduction categories, total work expenses, estimated refund amount, and days left in tax year.

- **Trust signal**: SPENDS -- critically. This is the most sensitive data in the app being transmitted to a third-party server with zero disclosure. The user taps "Ask Tjommie anything" with no idea that their complete financial profile is being sent to an external AI company. If a user discovered this independently, it would destroy all trust in the app permanently.
- **POPIA status**: NON-COMPLIANT -- This is a clear violation of POPIA Section 18 (notification of third-party processing), Section 11 (consent for third-party data sharing), and Section 72 (transborder information flows -- Anthropic servers are outside South Africa). Financial data is being transmitted to a US-based company without informed consent.
- **Literacy assumption**: N/A
- **SARS fear factor**: AMPLIFIES FEAR -- If users knew their income and expense data was being sent to an external server, those who fear creating a paper trail would be deeply alarmed. The lack of disclosure makes this worse, not better.
- **Inclusion gap**: Users with low digital literacy may not understand what an "AI" is or that their conversation involves an external service.
- **Fix**: (1) Before first Tjommie chat use, show a clear disclosure: "Tjommie uses AI to answer your questions. When you chat, a summary of your financial info is sent to our AI partner (Anthropic) to generate helpful answers. They don't store your data after the conversation. Your detailed expense records stay on your phone." (2) Give users the option to use Tjommie without the API (pre-scripted responses for common questions). (3) Minimize data sent -- does Tjommie need the exact income figure, or would a bracket suffice?

**Severity**: CRITICAL

---

### ITEM 6: API Key Handling

The fetch call to `https://api.anthropic.com/v1/messages` in S_Tjommie does not include an API key in the visible code. The headers only include `Content-Type`. This means either: (a) the API call will fail (no authentication), or (b) the key is injected at runtime by the hosting environment, or (c) the call is proxied.

- **Trust signal**: NEUTRAL to SPENDS -- If the API key is somehow exposed client-side (embedded in the artifact environment), this is a security vulnerability. If the call simply fails, Tjommie is non-functional.
- **POPIA status**: REQUIRES REVIEW -- Depends on how the key is provided and whether the hosting environment adds headers.
- **Literacy assumption**: N/A
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: N/A
- **Fix**: Clarify the API key mechanism. If the key must be client-side, add a clear note that this is a prototype limitation. In production, API calls must be proxied through a backend to avoid key exposure.

**Severity**: MEDIUM

---

### ITEM 7: Tax Terminology Throughout the App

The app uses the following financial terms without explanation:
- "Marginal rate" (S_Money, S_Home, S_Cheque, S_Settings, Tjommie system prompt)
- "Tax bracket" (S_Money)
- "PAYE" (S_EmpType, S_Spending)
- "Deduction" / "deductions" (S_Deductions, S_Cheque, throughout)
- "Gross income" (S_Money)
- "Net" (not used explicitly, but implied by "living money")
- "Annual" (S_Money quick calculation)
- "Section 23(m)" and "Section 11(a)" (Tjommie system prompt -- would appear in chat responses)
- "Effective rate" (calculated but not displayed)
- "Primary rebate" (in code, not shown to user)
- "Tax threshold" (in code, not shown to user)

- **Trust signal**: NEUTRAL -- Technical language does not build or spend trust directly, but confusion erodes confidence.
- **POPIA status**: N/A
- **Literacy assumption**: TOO HIGH -- "Marginal rate" is jargon that most South Africans, including many university graduates, do not understand. Displaying "Tax bracket: 26%" means nothing to someone who does not know what a tax bracket is. The Home screen says "R100 you claim saves you R26 in tax" which is clearer, but the terminology elsewhere undermines this.
- **SARS fear factor**: AMPLIFIES FEAR -- Tax jargon is intimidating. Every unexplained term reinforces the feeling that "this is complicated and I'm going to get it wrong."
- **Inclusion gap**: Anyone who has not engaged with formal tax processes (the majority of the target market) is excluded from understanding key displays in the app.
- **Fix**: (1) Replace "Marginal rate: 26%" with "For every R100 you claim, you save R26." (2) Replace "Tax bracket" with a simpler framing or add a tap-to-explain tooltip. (3) Never use section references in user-facing text -- Tjommie's system prompt should instruct it to explain in plain language, not cite SARS sections. (4) Add a small "What's this?" button next to any financial term.

**Severity**: HIGH

---

### ITEM 8: Data Deletion (Settings Screen)

The Settings screen offers a "Reset all data" button with a confirmation dialog.

- **Trust signal**: BUILDS -- The presence of a data deletion option is a positive trust signal. The confirmation dialog with "Can't be undone" is honest.
- **POPIA status**: REQUIRES REVIEW -- Partially compliant. POPIA requires the right to deletion (met), but also the right to access and correct data (not met -- there is no way to edit profile information after setup, no data export, and no way to see exactly what data is stored). Additionally, the deletion mechanism does not address data already sent to Anthropic via the chat feature.
- **Literacy assumption**: APPROPRIATE
- **SARS fear factor**: NEUTRAL to BUILDS -- Knowing you can delete everything provides some reassurance.
- **Inclusion gap**: The "Reset all data" button uses destructive red styling which is appropriate, but the flow is all-or-nothing. There is no way to delete individual pieces of data (e.g., delete my income but keep my expenses, or delete chat history but keep my profile).
- **Fix**: (1) Add ability to edit profile information from Settings (name, income, occupation). (2) Add a "Download my data" option for POPIA compliance. (3) Add a note: "This deletes all data from your device. If you've chatted with Tjommie, those conversations were processed by our AI partner but are not stored by them." (4) Add selective deletion (clear expenses, clear chat history, etc.).

**Severity**: HIGH

---

### ITEM 9: "Estimated" Language for Refund Amounts

The app uses "estimated" and "potential" language in some places but not consistently:
- S_Promise: "SARS owes the average South African R18,400" -- NO estimate qualifier
- S_Ready: "Your potential 13th Cheque" -- GOOD
- S_Home: "estimated SARS refund" -- GOOD
- S_Cheque: "Estimated refund from SARS" -- GOOD
- S_Money: "Estimated 13th Cheque" -- GOOD
- S_Settings disclaimer: "provides estimates for guidance only" -- GOOD

- **Trust signal**: MIXED -- The main app screens are appropriately qualified. The opening promise screen is not.
- **POPIA status**: N/A
- **Literacy assumption**: APPROPRIATE where used. The word "estimate" is widely understood.
- **SARS fear factor**: NEUTRAL where used. The opening promise screen's lack of qualification could create false expectations that then amplify frustration/distrust.
- **Inclusion gap**: N/A
- **Fix**: (1) Qualify the opening screen claim. (2) Add a consistent disclaimer on every screen that shows a Rand amount: a small "estimated" tag. (3) In Tjommie's system prompt, the instruction "Never guarantee a refund" is present -- good. Ensure it is reflected in all static UI copy as well.

**Severity**: MEDIUM

---

### ITEM 10: Disclaimer in Settings

The disclaimer reads: "The 13th Cheque provides estimates for guidance only and does not constitute professional tax advice. Consult a registered SARS tax practitioner for your specific situation."

- **Trust signal**: BUILDS -- This is the right thing to say. However, it is buried in Settings where most users will never see it.
- **POPIA status**: N/A
- **Literacy assumption**: APPROPRIATE
- **SARS fear factor**: NEUTRAL -- "Consult a registered SARS tax practitioner" is good advice but may intimidate users who cannot afford one.
- **Inclusion gap**: Users who cannot afford a tax practitioner (the majority of the target market) are told to consult one with no alternative pathway. SARS offers free assistance at branch offices and via eFiling -- this should be mentioned.
- **Fix**: (1) Show this disclaimer during onboarding, not just in Settings. (2) Add: "SARS also offers free help at any SARS branch or via eFiling (www.sarsefiling.co.za). You don't need to pay someone." (3) Consider showing a brief version of this disclaimer on the 13th Cheque screen itself: "This is an estimate. Your actual refund depends on your full tax return."

**Severity**: MEDIUM

---

### ITEM 11: Budget Categories (DEFAULT_BUDGET)

The default budget categories are: Groceries, Eating Out, Fuel, Entertainment, Clothing, Medical, Other.

- **Trust signal**: NEUTRAL
- **POPIA status**: N/A
- **Literacy assumption**: APPROPRIATE for the categories shown.
- **SARS fear factor**: N/A
- **Inclusion gap**: SIGNIFICANT. Missing categories that reflect South African household reality: (1) Rent/Bond -- the single largest expense for most South Africans. (2) Electricity/Water/Rates -- a separate and significant expense, especially with load shedding. (3) School fees -- a major financial commitment for parents. (4) Transport beyond fuel (taxi fare, Uber, bus) -- many South Africans do not own cars. (5) Family support -- sending money to parents, siblings, extended family is a cultural obligation. (6) Airtime/Data -- a non-negotiable expense. (7) Insurance -- car, home, life. (8) Debt repayment -- many South Africans are servicing store accounts, personal loans, or credit cards. The absence of "Rent" as a budget category means the app cannot meaningfully track the finances of anyone who pays rent, which is the majority of the target market.
- **Fix**: Replace with comprehensive SA-specific categories as specified in the CLAUDE.md requirements. The absence of "Family Support" is particularly exclusionary -- it renders invisible a financial obligation that is central to many South African households.

**Severity**: HIGH

---

### ITEM 12: Dreams/Goals Framing

The DREAMS array shows aspirational items the 13th Cheque "could cover": flights to Cape Town, weekend away, new laptop, etc.

- **Trust signal**: MIXED -- For users who can relate, this builds motivation. For users in financial distress, showing "weekend away for two - R4,500" when they are struggling to pay rent could feel tone-deaf or manipulative.
- **POPIA status**: N/A
- **Literacy assumption**: APPROPRIATE
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: The dreams are aspirational middle-class items. There is no dream that reflects the reality of many South Africans: paying off a store account, catching up on electricity arrears, paying school fees for the term, or putting food on the table for the month. The "six months of groceries" entry is the closest, but the framing is still aspirational rather than practical.
- **Fix**: Add more grounded items: "Catch up on three months of school fees," "Clear store account debt," "Emergency fund for the family." Allow users to add their own dream/goal. The current list should be dynamically filtered based on income level -- someone earning R8,000/month should not see "weekend away for two - R4,500" as a realistic use of a potential R800 refund.

**Severity**: MEDIUM

---

### ITEM 13: No Offline/Data-Storage Reassurance

The app uses localStorage (device-only storage), which is a positive privacy feature. However, nowhere in the app does it tell the user this. The user has no way of knowing that their financial data stays on their phone.

- **Trust signal**: SPENDS (by omission) -- The app has a strong privacy story (local storage only, except for Tjommie chat) but does not tell it. This is a missed opportunity to build trust.
- **POPIA status**: REQUIRES REVIEW -- Even local storage of personal information triggers POPIA obligations.
- **Literacy assumption**: N/A
- **Inclusion gap**: Users with low digital literacy may assume any app sends their data to "the cloud" or "the company." Not addressing this assumption means losing users who would be reassured by the truth.
- **Fix**: During onboarding and in Settings, clearly state: "Your financial data stays on this device. We don't have a server. We can't see your information." This is the single most powerful trust statement the app could make, and it is completely absent.

**Severity**: HIGH

---

### ITEM 14: Tjommie's Persona and Trust Boundary

Tjommie is positioned as a "warm South African financial assistant" and a "knowledgeable friend." The system prompt instructs it to "Speak like a knowledgeable friend -- direct, warm, plain South African English."

- **Trust signal**: MIXED -- The warm persona builds initial comfort, but there is a trust boundary problem. Tjommie is an AI chatbot powered by a US company, but it presents as "a friend." Users who discover this discrepancy may feel deceived. The persona does not acknowledge that it is an AI.
- **POPIA status**: REQUIRES REVIEW -- If users believe they are talking to a human or a local service, they may share information they would not share with a US-based AI. POPIA requires transparency about automated decision-making.
- **Literacy assumption**: N/A
- **SARS fear factor**: NEUTRAL to BUILDS -- The system prompt includes good instructions about reassurance. "Never guarantee a refund" and "Recommend a tax practitioner for complex situations" are appropriate.
- **Inclusion gap**: Users with low digital literacy may not understand what an AI chatbot is.
- **Fix**: (1) Add a clear label: "Tjommie is an AI assistant -- not a human, not a tax practitioner." (2) On first chat interaction, have Tjommie introduce itself: "I'm Tjommie, an AI assistant built into this app. I can help you understand your tax situation, but I'm not a registered tax practitioner. For complex situations, I'll always recommend you talk to a real person." (3) The system prompt's instruction to avoid "corporate speak" is good but should also include: "If asked, be transparent that you are an AI."

**Severity**: MEDIUM

---

### ITEM 15: Work Expense Deduction Categories and Salaried Restrictions

The deductions screen (S_Deductions) shows all 13 tax categories for freelancers and greys out 5 for salaried employees. The greyed-out message says: "Greyed-out categories can't be claimed by salaried employees -- SARS expects your employer to cover these."

- **Trust signal**: BUILDS -- Being transparent about what salaried employees cannot claim is honest and prevents false expectations.
- **POPIA status**: N/A
- **Literacy assumption**: APPROPRIATE for the explanations given. Each category has a short description.
- **SARS fear factor**: NEUTRAL -- The restriction messaging is factual without being threatening.
- **Inclusion gap**: Users who are misclassified by their employers (e.g., classified as salaried but actually functioning as independent contractors) will not know which rules apply to them. This is a common South African labour issue.
- **Fix**: (1) Add a Tjommie tip: "Not sure if you're really salaried or a contractor? If your employer doesn't give you a payslip with PAYE deductions, you might be misclassified. A tax practitioner can help sort this out." (2) The category descriptions are good but could be more specific about limits -- e.g., "Home Office: must be a dedicated room used only for work."

**Severity**: LOW

---

### ITEM 16: No Explanation of How the 13th Cheque Estimate Works

The app calculates the 13th Cheque estimate as `workExpenses * marginalRate`. This is a simplification (the actual refund depends on total taxable income, not just marginal rate applied to expenses). The user is shown a growing number with no explanation of how it is calculated.

- **Trust signal**: SPENDS -- A financial app that shows you a number and does not explain how it arrived at that number is asking for blind trust. Users who are suspicious of financial products will wonder: "How do they know? Are they making this up?"
- **POPIA status**: N/A
- **Literacy assumption**: TOO HIGH -- The user sees "R2,340 estimated SARS refund" with no understanding of the relationship between their expenses, their tax bracket, and the refund.
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: Users who want to verify the number cannot. Users who want to understand the logic are not helped.
- **Fix**: Add a "How is this calculated?" expandable section on the 13th Cheque screen: "You've logged R9,000 in work expenses. At your tax bracket (26%), each R100 of work expenses means R26 less tax. So R9,000 x 26% = R2,340 estimated refund." This would be enormously trust-building and educational.

**Severity**: HIGH

---

### ITEM 17: No Data Portability or Export

There is no way to export data from the app. If a user's phone is lost, all data is lost. There is no backup, no export, no PDF summary.

- **Trust signal**: SPENDS -- Users who invest time logging expenses may lose everything. This creates anxiety and reduces the incentive to use the app seriously.
- **POPIA status**: REQUIRES REVIEW -- POPIA Section 24 gives data subjects the right to access their personal information in a reasonable format. The app does not provide this.
- **Inclusion gap**: Users with older or shared phones are at higher risk of data loss.
- **Fix**: (1) Add a "Download my data" button in Settings that exports a JSON or PDF. (2) Add a "Download tax summary" button on the 13th Cheque screen (as specified in CLAUDE.md requirements). (3) Consider a simple backup mechanism (export to file, email to self).

**Severity**: HIGH

---

### ITEM 18: No Acknowledgment of Informal Economy

The app assumes all users have a single, formal income source with a fixed monthly amount. It does not acknowledge or accommodate:
- Cash income with no payslip
- Multiple income sources
- Seasonal or irregular income
- Grant recipients (SASSA)
- Unpaid domestic/care work

- **Trust signal**: SPENDS -- By not acknowledging these realities, the app signals "this is not for you" to a significant portion of the South African population.
- **POPIA status**: N/A
- **Literacy assumption**: TOO HIGH -- Assumes understanding of formal employment structures.
- **SARS fear factor**: AMPLIFIES FEAR -- Users with informal income may fear that entering it into any app creates a record that could trigger a tax liability.
- **Inclusion gap**: CRITICAL. This is the single biggest inclusion failure. The people who most need help understanding their tax position (informal workers who may be owed refunds, or who may not need to file at all) are completely excluded by the app's data model.
- **Fix**: (1) Add support for multiple income sources. (2) Add an option: "My income changes month to month" with an average/range input. (3) For users below the tax threshold, acknowledge this explicitly: "Based on your income, you may not need to file a tax return at all. But if your employer has been deducting PAYE, you could still be owed money." (4) Address the informal economy fear: "If you earn cash with no payslip, tracking your finances here does not report anything to SARS. This app is not connected to SARS."

**Severity**: HIGH

---

### ITEM 19: Language Selection Screen

Only English is available. isiZulu, isiXhosa, Sesotho, and Afrikaans are listed as "coming soon."

- **Trust signal**: NEUTRAL -- Listing future languages shows intent, but English-only is a significant barrier.
- **POPIA status**: N/A
- **Literacy assumption**: TOO HIGH -- The entire app is in English. Financial concepts are already difficult; reading them in a second or third language makes them harder. Many South Africans are conversant in English but do not read financial English fluently.
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: SIGNIFICANT. South Africa has 11 official languages. isiZulu (25% of population), isiXhosa (16%), and Afrikaans (13%) are the most spoken home languages. English is the home language of only 8.1% of South Africans. The app is currently accessible only in the home language of 8.1% of the population, though many more can read English to varying degrees.
- **Fix**: This is acknowledged as a future feature. For now: (1) Use simpler English throughout. (2) Avoid idioms and complex sentence structures. (3) Ensure Tjommie's system prompt instructs it to use simple, clear English. (4) Prioritise isiZulu translation as the next language.

**Severity**: MEDIUM (acknowledged as future work, but significant barrier)

---

### ITEM 20: Settings Screen -- No Profile Editing

After onboarding, the user cannot edit their name, income, occupation, employment type, or savings goal. The Settings screen displays these as read-only values.

- **Trust signal**: SPENDS -- If you entered the wrong income (or your income changes), the only option is to reset ALL data and start over. This is punitive and creates anxiety about getting the initial setup right.
- **POPIA status**: NON-COMPLIANT -- POPIA Section 24 gives data subjects the right to correct their personal information. The app does not provide this.
- **Literacy assumption**: N/A
- **SARS fear factor**: NEUTRAL
- **Inclusion gap**: Users whose income changes (commission earners, seasonal workers, anyone who gets a raise or loses a job) cannot update without destroying all their expense data.
- **Fix**: Make all profile fields editable from Settings. This is both a usability requirement and a POPIA compliance requirement.

**Severity**: HIGH

---

## Summary Tables

### Trust Signal Inventory

| Screen/Feature | Trust Signal | Severity |
|---|---|---|
| Opening promise ("R18,400 owed") | SPENDS | HIGH |
| No privacy statement | SPENDS | CRITICAL |
| Income input (no context) | NEUTRAL | HIGH |
| Employment type options | BUILDS | HIGH (inclusion) |
| Tjommie API data transmission | SPENDS | CRITICAL |
| Data deletion option | BUILDS | HIGH (incomplete) |
| Estimate language | MIXED | MEDIUM |
| Settings disclaimer | BUILDS (but buried) | MEDIUM |
| No offline/local storage reassurance | SPENDS (by omission) | HIGH |
| No calculation explanation | SPENDS | HIGH |
| Deduction restrictions transparency | BUILDS | LOW |
| No data export | SPENDS | HIGH |
| No profile editing | SPENDS | HIGH |

---

## BIGGEST TRUST RISKS

1. **No privacy statement or consent mechanism before collecting sensitive financial data.** This is the single biggest trust failure. Every user is entering income, occupation, and expense data into an app that tells them nothing about what happens to it. For users who have experienced financial fraud (a large proportion of the South African population), this is a dealbreaker.

2. **Undisclosed third-party data transmission via Tjommie.** The user's complete financial profile is sent to Anthropic's US-based servers without any disclosure. If a user discovered this through other means, it would permanently destroy trust in the app and potentially expose the developer to POPIA enforcement action.

3. **Opening promise creates false expectations.** "SARS owes the average South African R18,400" with no qualification or source citation reads like a financial scheme pitch. This is particularly dangerous in a country where investment fraud has been widespread.

4. **No explanation of how estimates are calculated.** Users are shown a growing number with no transparency about the underlying math. This requires blind trust -- the opposite of what a financial app should demand.

---

## POPIA GAPS

1. **No informed consent mechanism** (Section 11) -- data is collected without any consent process.
2. **No notification of processing** (Section 18) -- users are not told what data is collected, why, or by whom.
3. **No disclosure of third-party processing** (Section 18, 72) -- Anthropic API usage is completely undisclosed.
4. **No transborder data flow compliance** (Section 72) -- financial data is sent to US servers without consent or adequate safeguards.
5. **No right to correction** (Section 24) -- profile information cannot be edited after setup.
6. **No right to access in portable format** (Section 24) -- no data export capability.
7. **Incomplete right to deletion** (Section 24) -- local data can be deleted, but data sent to Anthropic cannot be recalled. This limitation is not disclosed.
8. **No purpose limitation statement** -- the app does not state the purpose for which data is collected.
9. **No data retention policy** -- it is unclear how long data persists (localStorage has no expiry by default).
10. **No Information Officer contact** -- POPIA requires a responsible party to be identified.

---

## LITERACY BARRIERS

1. **"Marginal rate"** -- The most confusing term used prominently throughout the app. Most South Africans do not know what this means. Replace with "For every R100 you claim, you save RX."
2. **"Gross income"** -- Many users do not distinguish between gross and net. Needs a plain-language explanation and a "what if I don't know?" pathway.
3. **"Tax bracket"** -- Displayed as a percentage without context. Needs human-readable explanation.
4. **"Deductions"** -- The concept that spending money on work reduces your tax is not intuitive. The app uses this term without ever explaining the underlying mechanism.
5. **"PAYE"** -- Used in employment type descriptions and spending breakdowns without definition. Not all users know that their employer deducts tax on their behalf.
6. **SARS section references in Tjommie's system prompt** -- Will surface in chat responses. Users do not benefit from hearing "Section 23(m)" -- they need plain language.
7. **The 13th Cheque calculation itself** -- The relationship between "work expenses," "tax rate," and "refund" is the core value proposition but is never explained.

---

## INCLUSION RECOMMENDATIONS

1. **Add informal economy support.** Allow users to indicate cash income, multiple income sources, and variable/seasonal income. Acknowledge users below the tax threshold explicitly and guide them appropriately (they may still be owed refunds if PAYE was over-deducted).

2. **Add a privacy and consent layer before any data collection.** This is both a legal requirement and the single most impactful trust-building change. State clearly: data stays on device, Tjommie uses external AI, app is not connected to SARS.

3. **Address SARS fear directly and early.** During onboarding, Tjommie should say: "I know SARS can feel scary. Let me be clear: this app is not connected to SARS. Tracking your expenses here doesn't file anything or create any record with SARS. You're in control. When you're ready to file, you choose how and when."

4. **Replace financial jargon with plain language and explanations.** Every financial term should either be replaced with a human-readable equivalent or have a tap-to-explain tooltip. The target audience should be someone with a Grade 8 education reading in their second language.

5. **Add "Family Support" as a budget category.** This is not optional -- it reflects a financial reality that affects millions of South African households and its absence signals that the app was not designed for them.

6. **Add "How is this calculated?" transparency to the 13th Cheque estimate.** Show the simple math. This builds trust, teaches financial literacy, and empowers users to verify the app's claims.

7. **Make profile information editable.** Life changes. Income changes. The app must accommodate this without requiring a full data reset.

8. **Add a pathway for users who cannot afford a tax practitioner.** Mention SARS branch offices, eFiling, and free assistance. Do not assume the user can pay for professional help.

9. **Prioritise isiZulu translation.** 25% of South Africans speak isiZulu as a home language. Financial literacy content in mother tongue is dramatically more effective.

10. **Add data export capability.** Users should be able to see and take their data with them. This serves both POPIA compliance and practical trust-building.

---

## Final Assessment

The 13th Cheque app has a strong emotional design and a genuinely valuable core proposition. Tjommie's persona is warm and the gold-number-growing mechanic creates real motivation. However, the app has **zero trust infrastructure**. There is no privacy statement, no consent mechanism, no disclosure of third-party data processing, no explanation of calculations, and no acknowledgment of the legitimate fears that South African financial consumers carry.

The irony is that the app has a genuinely good privacy story to tell (data stays on device, except for chat). It simply does not tell it. The silence is more damaging than any bad practice would be, because silence invites the worst assumptions.

**The app needs to earn trust before it asks for data.** Currently, it asks for data and never addresses trust at all.

**Issues by Severity:**
- CRITICAL: 2 (no privacy/consent, undisclosed API data transmission)
- HIGH: 8 (opening promise, income input literacy, employment type inclusion, tax terminology, data deletion gaps, no local storage disclosure, no calculation transparency, no profile editing, no data export, informal economy exclusion)
- MEDIUM: 4 (API key handling, estimate language consistency, dreams framing, language availability, Tjommie AI disclosure, disclaimer placement)
- LOW: 1 (deduction restriction messaging)
