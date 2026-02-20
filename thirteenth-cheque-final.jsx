import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// PART 1: IMPORTS, CONSTANTS, TAX MATH, DATA STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════ STORAGE ═══════
const STORE_KEY = "t13_final_v3";
function loadData() {
  try { const s = localStorage.getItem(STORE_KEY); return s ? JSON.parse(s) : null; }
  catch(e) { return null; }
}
function saveData(d) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }
  catch(e) { console.warn("Storage full"); }
}

// ═══════ TAX MATH (2025/26 — SARS verified) ═══════
const BRACKETS = [
  { min: 0,       max: 237100,   base: 0,      rate: 0.18 },
  { min: 237101,  max: 370500,   base: 42678,  rate: 0.26 },
  { min: 370501,  max: 512800,   base: 77362,  rate: 0.31 },
  { min: 512801,  max: 673000,   base: 121475, rate: 0.36 },
  { min: 673001,  max: 857900,   base: 179147, rate: 0.39 },
  { min: 857901,  max: 1817000,  base: 251258, rate: 0.41 },
  { min: 1817001, max: Infinity, base: 644489, rate: 0.45 },
];
const PRIMARY_REBATE = 17235;
const SECONDARY_REBATE = 9444;   // age 65-74
const TERTIARY_REBATE = 3145;    // age 75+
const THRESHOLD = 95750;
const THRESHOLD_65 = 148217;
const THRESHOLD_75 = 165689;
const RA_RATE = 0.275;           // 27.5% of remuneration
const RA_CAP = 350000;           // annual cap
const MED_CREDIT_MAIN = 364;     // per month, member
const MED_CREDIT_FIRST_DEP = 364;// per month, first dependant
const MED_CREDIT_OTHER_DEP = 246;// per month, each additional dependant

function calcTax(annual, age = 30) {
  const threshold = age >= 75 ? THRESHOLD_75 : age >= 65 ? THRESHOLD_65 : THRESHOLD;
  if (annual <= threshold) return { tax: 0, effectiveRate: 0, marginalRate: 0.18 };
  const b = BRACKETS.find(b => annual >= b.min && annual <= b.max) || BRACKETS[6];
  const gross = b.base + b.rate * (annual - b.min);
  const rebate = age >= 75 ? PRIMARY_REBATE + SECONDARY_REBATE + TERTIARY_REBATE
               : age >= 65 ? PRIMARY_REBATE + SECONDARY_REBATE
               : PRIMARY_REBATE;
  const tax = Math.max(0, gross - rebate);
  return { tax, effectiveRate: annual > 0 ? tax / annual : 0, marginalRate: b.rate };
}

// Full refund calc including RA and medical credits
function calcRefund(income, totalDeductions, raContributions = 0, medicalMembers = 0, medicalDeps = 0) {
  // RA deduction (capped at 27.5% of income or R350,000)
  const raDeduction = Math.min(raContributions, income * RA_RATE, RA_CAP);

  // Taxable income BEFORE deductions
  const taxBefore = calcTax(income);

  // Taxable income AFTER deductions
  const taxableAfter = Math.max(0, income - totalDeductions - raDeduction);
  const taxAfter = calcTax(taxableAfter);

  // Medical tax credits (Section 6A)
  const medCreditsMonthly = (medicalMembers >= 1 ? MED_CREDIT_MAIN : 0)
    + (medicalMembers >= 2 ? MED_CREDIT_FIRST_DEP : 0)
    + Math.max(0, medicalMembers - 2 + medicalDeps) * MED_CREDIT_OTHER_DEP;
  const medCreditsAnnual = medCreditsMonthly * 12;

  // Total refund = tax saved from deductions + medical credits
  const taxSaved = taxBefore.tax - taxAfter.tax;
  const totalRefund = taxSaved + medCreditsAnnual;

  return {
    refund: Math.round(totalRefund),
    taxSaved: Math.round(taxSaved),
    raDeduction: Math.round(raDeduction),
    raSaving: Math.round(calcTax(income).tax - calcTax(Math.max(0, income - raDeduction)).tax),
    medCredits: Math.round(medCreditsAnnual),
    marginalRate: taxBefore.marginalRate,
    effectiveRate: taxBefore.effectiveRate,
  };
}

// ═══════ FORMATTERS ═══════
function fmtR(n) { return "R " + Math.round(Math.abs(n)).toLocaleString("en-ZA"); }
function fmtDate(d) {
  const p = new Date(d + "T00:00:00");
  return p.toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}
function fmtDateFull(d) {
  const p = new Date(d + "T00:00:00");
  return p.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

// ═══════ UTILITIES ═══════
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
function todayStr() { return new Date().toISOString().slice(0, 10); }
function monthKey(d) { return d.slice(0, 7); }
function thisMonthStr() { return todayStr().slice(0, 7); }
function daysLeft() {
  const n = new Date();
  const yr = n.getMonth() <= 1 ? n.getFullYear() : n.getFullYear() + 1;
  // Use Feb 28 — handles leap year correctly via Date overflow
  const end = new Date(yr, 1, 28);
  return Math.max(0, Math.ceil((end - n) / 86400000));
}
function taxYearPct() {
  const n = new Date();
  const yr = n.getMonth() <= 1 ? n.getFullYear() - 1 : n.getFullYear();
  const s = new Date(yr, 2, 1), e = new Date(yr + 1, 1, 28);
  return Math.min(100, Math.round((n - s) / (e - s) * 100));
}
function inTaxYear(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const n = new Date();
  const yr = n.getMonth() <= 1 ? n.getFullYear() - 1 : n.getFullYear();
  const s = new Date(yr, 2, 1), e = new Date(yr + 1, 1, 28);
  return d >= s && d <= e;
}
function getMarginal(annual) { return calcTax(annual).marginalRate; }

// ═══════ CAREER PROFILES ═══════
const CAREER_PROFILES = {
  teacher: {
    label: "Teacher / Lecturer",
    keywords: ["teacher", "lecturer", "educator", "tutor", "professor", "hod", "principal"],
    deductions: ["stationery", "reference_books", "computer", "internet", "professional_fees"],
    tip: "Stationery and reference books for your subject are the easiest wins.",
  },
  it: {
    label: "IT / Developer",
    keywords: ["developer", "programmer", "software", "it ", "tech", "engineer", "data", "analyst", "devops", "sysadmin"],
    deductions: ["computer", "internet", "phone", "professional_fees", "courses"],
    tip: "Your laptop, internet, and online courses are all claimable.",
  },
  creative: {
    label: "Creative / Designer",
    keywords: ["designer", "graphic", "creative", "artist", "photographer", "videographer", "writer", "content"],
    deductions: ["computer", "internet", "equipment", "courses", "phone", "stationery"],
    tip: "Your creative tools (software, hardware, camera) are all deductible.",
  },
  healthcare: {
    label: "Healthcare",
    keywords: ["nurse", "doctor", "paramedic", "therapist", "physio", "dentist", "pharmacist", "medical"],
    deductions: ["protective_clothing", "professional_fees", "courses", "professional_indemnity"],
    tip: "Professional registration fees and protective equipment add up fast.",
  },
  sales: {
    label: "Sales / Commission",
    keywords: ["sales", "agent", "broker", "commission", "rep", "business development", "account manager"],
    deductions: ["travel", "phone", "internet", "entertainment", "computer"],
    tip: "If you earn >50% commission, you get the full range of deductions — including travel.",
  },
  legal: {
    label: "Legal / Finance",
    keywords: ["lawyer", "attorney", "advocate", "accountant", "auditor", "legal", "finance", "compliance"],
    deductions: ["professional_fees", "reference_books", "courses", "computer", "internet"],
    tip: "LSSA/SAICA fees + legal reference subscriptions = solid deductions.",
  },
  trades: {
    label: "Trades / Technical",
    keywords: ["electrician", "plumber", "mechanic", "technician", "artisan", "welder", "fitter"],
    deductions: ["tools", "protective_clothing", "travel", "phone"],
    tip: "Your tools, safety gear, and travel to sites are all claimable.",
  },
  driver: {
    label: "Driver / Delivery",
    keywords: ["driver", "delivery", "courier", "transport", "logistics", "uber", "bolt", "trucking"],
    deductions: ["travel", "phone", "protective_clothing"],
    tip: "Keep a logbook — travel is your biggest deduction by far.",
  },
  general: {
    label: "General / Office",
    keywords: [],
    deductions: ["phone", "internet", "stationery", "courses"],
    tip: "Phone and internet used for work are claimable — even partially.",
  },
};

function matchCareer(occupation) {
  const occ = (occupation || "").toLowerCase();
  for (const [key, profile] of Object.entries(CAREER_PROFILES)) {
    if (key === "general") continue;
    if (profile.keywords.some(kw => occ.includes(kw))) return key;
  }
  return "general";
}

// ═══════ TAX DEDUCTION CATEGORIES ═══════
// Section 11(a) & 23(m) compliant categories
const TAX_CATS = {
  travel:              { icon: "🚗", label: "Travel / Km",            warn: "Keep a SARS logbook — they WILL ask for it." },
  phone:               { icon: "📱", label: "Phone & Data",           warn: "Only the work-use % is deductible." },
  internet:            { icon: "🌐", label: "Internet / WiFi",        warn: "Only the work-use % is deductible." },
  computer:            { icon: "💻", label: "Computer / Laptop",      warn: "Depreciation over 3 years, or full if under R7,000." },
  equipment:           { icon: "🔧", label: "Tools & Equipment",      warn: "Must be required for your specific job." },
  stationery:          { icon: "📎", label: "Stationery & Printing",  warn: null },
  reference_books:     { icon: "📚", label: "Books & Subscriptions",  warn: "Must be directly related to your work." },
  courses:             { icon: "🎓", label: "Training & Courses",     warn: "Must improve skills for current job." },
  union:               { icon: "✊", label: "Union Fees",              warn: null },
  professional_fees:   { icon: "📋", label: "Professional Body Fees", warn: "SAICA, LSSA, HPCSA, ECSA, etc." },
  professional_indemnity: { icon: "🛡️", label: "Professional Indemnity", warn: "Insurance required by your profession." },
  protective_clothing: { icon: "🦺", label: "Protective Clothing",    warn: "Must be required by your employer." },
  home_office:         { icon: "🏠", label: "Home Office",            warn: "STRICT: You need a dedicated room used >50% for work AND your income must be >50% commission. Salaried = almost never allowed." },
  donations:           { icon: "💝", label: "Donations (Section 18A)", warn: "Only to approved PBOs. Max 10% of taxable income." },
  retirement:          { icon: "🏦", label: "Retirement Annuity (RA)", warn: "Up to 27.5% of income, capped at R350,000/year. The #1 tax deduction most South Africans miss." },
  medical:             { icon: "🏥", label: "Medical Aid Contributions", warn: "Credits applied directly to tax — not a deduction from income." },
  other:               { icon: "📦", label: "Other Work Expense",     warn: "Must be directly related to earning your income." },
};

// Categories restricted under Section 23(m) for salaried employees
const SALARIED_RESTRICTED = new Set([
  "home_office", "travel", "equipment", "entertainment"
]);

// Get available categories based on employment type
function getAvailableCats(empType, commissionPct = 0) {
  const cats = { ...TAX_CATS };
  if (empType === "salaried" && commissionPct <= 50) {
    // Section 23(m) — salaried can only deduct specific categories
    for (const key of SALARIED_RESTRICTED) {
      if (key === "home_office" || key === "travel") {
        delete cats[key]; // Remove entirely for salaried
      }
    }
  }
  return cats;
}

// ═══════ SOUTH AFRICAN BUDGET CATEGORIES ═══════
const DEFAULT_BUDGET = {
  housing:       { label: "Housing (Rent / Bond)", icon: "🏠", amount: 0,
    subs: ["Rent", "Bond repayment", "Body corporate levy", "Property rates"] },
  utilities:     { label: "Utilities", icon: "💡", amount: 0,
    subs: ["Electricity", "Water", "Rates & taxes", "Refuse removal"] },
  groceries:     { label: "Groceries & Food", icon: "🛒", amount: 0,
    subs: ["Groceries", "Household supplies", "Baby supplies"] },
  eating_out:    { label: "Eating Out & Takeaways", icon: "🍔", amount: 0,
    subs: ["Restaurants", "Takeaways", "Coffee", "Mr D / Uber Eats"] },
  transport:     { label: "Transport", icon: "🚗", amount: 0,
    subs: ["Fuel", "Taxi / minibus", "Uber / Bolt", "Car payment", "Licence & registration", "Tolls / e-tag"] },
  medical:       { label: "Medical Aid & Health", icon: "🏥", amount: 0,
    subs: ["Medical aid premium", "Doctor visits", "Pharmacy", "Dentist", "Optometrist"] },
  insurance:     { label: "Insurance", icon: "🛡️", amount: 0,
    subs: ["Car insurance", "Home / contents", "Life insurance", "Funeral cover"] },
  school:        { label: "School Fees & Education", icon: "📚", amount: 0,
    subs: ["School fees", "Uniforms", "Textbooks", "After-care", "Tertiary / NSFAS"] },
  clothing:      { label: "Clothing & Personal Care", icon: "👕", amount: 0,
    subs: ["Clothing", "Haircare", "Personal hygiene"] },
  entertainment: { label: "Entertainment & Subscriptions", icon: "🎬", amount: 0,
    subs: ["DStv / Showmax", "Netflix / Disney+", "Spotify / Apple Music", "Gym", "Going out"] },
  savings:       { label: "Savings & Investments", icon: "💰", amount: 0,
    subs: ["Emergency fund", "Retirement (RA)", "Tax-free savings", "Stokvel", "Unit trusts"] },
  family:        { label: "Family Support", icon: "👨‍👩‍👧‍👦", amount: 0,
    subs: ["Parents / elders", "Extended family", "Lobola savings", "Black tax"] },
  airtime:       { label: "Airtime & Data", icon: "📱", amount: 0,
    subs: ["Contract", "Prepaid airtime", "Data bundles", "Fibre / WiFi"] },
  other:         { label: "Other", icon: "📦", amount: 0,
    subs: ["Pet expenses", "Donations", "Church / tithe", "Custom..."] },
};

// ═══════ DREAMS — WHAT REFUND COULD BUY ═══════
const DREAMS = [
  { min: 500,   text: "a week of groceries" },
  { min: 1000,  text: "a full tank of petrol" },
  { min: 2000,  text: "new school shoes for the kids" },
  { min: 3000,  text: "a weekend getaway" },
  { min: 5000,  text: "a phone upgrade" },
  { min: 7000,  text: "a month of rent" },
  { min: 10000, text: "that holiday you keep postponing" },
  { min: 15000, text: "a serious dent in your debt" },
  { min: 20000, text: "a deposit on a car" },
  { min: 30000, text: "a year of savings started right" },
  { min: 50000, text: "a proper emergency fund" },
];

function dreamFor(refund) {
  let dream = DREAMS[0];
  for (const d of DREAMS) {
    if (refund >= d.min) dream = d;
  }
  return dream.text;
}

// ═══════ BLANK DATA STRUCTURE ═══════
const BLANK = {
  v: 3,
  lang: "en",
  name: "",
  occupation: "",
  empType: "salaried",       // salaried | commission | self
  commissionPct: 0,          // for commission earners
  income: 0,
  age: 30,
  // Tax deduction fields
  raContribMonthly: 0,       // RA contribution per month
  medicalMembers: 0,         // medical aid: main member + dependants
  medicalDeps: 0,
  medicalMonthly: 0,         // monthly premium amount
  // Budget
  budget: JSON.parse(JSON.stringify(DEFAULT_BUDGET)),
  // Expenses
  expenses: [],
  dream: "",
  // App state
  setupDone: false,
  setupStep: 0,
  // Tjommie chat
  chatHistory: [],
  // Privacy & consent
  consentGiven: false,
  consentDate: null,
  // Reminders
  reminderDay: null,         // 0-6 (Sun-Sat)
  reminderTime: null,        // "HH:MM"
  reminderEnabled: false,
  // Mid-year catch-up
  catchUpAsked: false,
  catchUpDone: false,
  // Streaks & engagement
  lastLogDate: null,
  streakDays: 0,
  totalExpensesLogged: 0,
  firstExpenseLogged: false,
};

// ═══════ COLORS — WCAG AA COMPLIANT ═══════
const C = {
  bg:       "#07101D",
  card:     "#0F1A2B",
  cardHi:   "#162236",
  gold:     "#F0B429",
  goldDim:  "#C4931F",
  green:    "#10B981",
  greenDim: "#0D9668",
  red:      "#EF4444",
  blue:     "#3B82F6",
  white:    "#F8FAFC",
  muted:    "rgba(248,250,252,0.68)",    // FIXED: was 0.45 — now passes WCAG AA (4.6:1)
  faint:    "rgba(248,250,252,0.42)",    // FIXED: was 0.18 — now passes WCAG AA at larger sizes
  border:   "rgba(248,250,252,0.08)",
  overlay:  "rgba(7,16,29,0.85)",
  gradGold: "linear-gradient(135deg, #F0B429 0%, #D4941C 100%)",
  gradGreen:"linear-gradient(135deg, #10B981 0%, #059669 100%)",
};

// ═══════ CSS ═══════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  .app-frame {
    width: 390px; height: 844px; background: ${C.bg}; color: ${C.white};
    font-family: 'DM Sans', sans-serif; overflow: hidden; position: relative;
    border-radius: 20px; display: flex; flex-direction: column;
  }

  .app-frame h1, .app-frame h2, .app-frame h3 {
    font-family: 'Sora', sans-serif; font-weight: 700;
  }

  /* Touch target minimum 44x44px */
  .app-frame button, .app-frame select, .app-frame input[type="checkbox"],
  .app-frame [role="button"] {
    min-height: 44px; min-width: 44px;
  }

  .app-frame button {
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    border: none; outline: none; transition: transform 0.1s, opacity 0.15s;
    -webkit-user-select: none; user-select: none;
  }
  .app-frame button:active { transform: scale(0.97); opacity: 0.85; }

  .app-frame input, .app-frame select, .app-frame textarea {
    font-family: 'DM Sans', sans-serif; font-size: 16px;
    background: ${C.card}; color: ${C.white}; border: 1px solid ${C.border};
    border-radius: 12px; padding: 12px 16px; outline: none;
    transition: border-color 0.2s;
  }
  .app-frame input:focus, .app-frame select:focus, .app-frame textarea:focus {
    border-color: ${C.gold};
  }

  .app-frame select {
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23F8FAFC' stroke-width='2' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 40px;
  }

  .app-frame ::-webkit-scrollbar { width: 0; height: 0; }

  /* Smooth scroll for content areas */
  .scroll-area {
    overflow-y: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .app-frame *, .app-frame *::before, .app-frame *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Focus visible for keyboard navigation */
  .app-frame *:focus-visible {
    outline: 2px solid ${C.gold}; outline-offset: 2px;
  }
`;

// ═══════ SVG ICONS ═══════
const I = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h3v-6h6v6h3a1 1 0 001-1V10"/></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  chart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>,
  chat: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  gear: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  star: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/></svg>,
  back: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
  cam: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  dl: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  bell: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  lock: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trophy: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2"/><path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>,
};

// ═══════ SHARED COMPONENTS ═══════

// Horizontal bar used for progress
function Bar({ pct, color = C.gold, height = 6, style }) {
  return (
    <div style={{ background: C.border, borderRadius: height, height, width: "100%", ...style }}>
      <div style={{
        width: Math.min(100, Math.max(0, pct)) + "%", height: "100%",
        borderRadius: height, background: color,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// Top navigation bar with optional back button
function TopBar({ title, onBack, right, color = C.white }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px 10px", minHeight: 52,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onBack && (
          <button onClick={onBack} style={{
            background: "none", color: C.muted, padding: 4,
            display: "flex", alignItems: "center",
          }} aria-label="Go back">{I.back}</button>
        )}
        <h2 style={{ fontSize: 18, color }}>{title}</h2>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

// Tjommie speech bubble with optional actions
function Tjommie({ msg, actions, compact }) {
  if (!msg) return null;
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: compact ? "12px 16px" : "16px 20px",
      margin: compact ? "0 0 12px" : "0 20px 16px", border: `1px solid ${C.border}`,
      position: "relative",
    }}>
      <div style={{
        display: "flex", gap: 10, alignItems: compact ? "center" : "flex-start",
      }}>
        <span style={{ fontSize: compact ? 20 : 26, flexShrink: 0 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <span style={{
            fontSize: compact ? 12 : 13, fontWeight: 600, color: C.gold,
            display: "block", marginBottom: 4,
          }}>Tjommie</span>
          <p style={{
            fontSize: compact ? 13 : 14, lineHeight: 1.5, color: C.muted, margin: 0,
          }}>{msg}</p>
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div style={{
          display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap",
        }}>
          {actions.map((a, i) => (
            <button key={i} onClick={a.onClick} style={{
              background: i === 0 ? C.gold : "transparent",
              color: i === 0 ? C.bg : C.gold,
              border: i === 0 ? "none" : `1px solid ${C.gold}40`,
              borderRadius: 10, padding: "10px 16px", fontSize: 13,
              fontWeight: 600, flex: actions.length <= 2 ? 1 : "none",
            }}>{a.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// POPIA Privacy badge
function PrivacyBadge({ style }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      fontSize: 11, color: C.faint, ...style,
    }}>
      {I.lock}
      <span>Your data stays on this device only</span>
    </div>
  );
}

// Animated number that counts up on change
function AnimNum({ value, prefix = "", duration = 600, style }) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef(null);
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion.current) { setDisplay(value); return; }
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * ease));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [value]);

  return <span style={style}>{prefix}{Math.round(display).toLocaleString("en-ZA")}</span>;
}

// Formatted currency input — the R-value input experience
function CurrencyInput({ value, onChange, placeholder = "0", label, style }) {
  const [raw, setRaw] = useState(value > 0 ? value.toLocaleString("en-ZA") : "");
  const inputRef = useRef(null);

  function handleChange(e) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    const num = parseInt(digits, 10) || 0;
    setRaw(num > 0 ? num.toLocaleString("en-ZA") : "");
    onChange(num);
  }

  function handlePreset(amount) {
    setRaw(amount.toLocaleString("en-ZA"));
    onChange(amount);
    inputRef.current?.focus();
  }

  return (
    <div style={style}>
      {label && <label style={{
        display: "block", fontSize: 13, color: C.muted, marginBottom: 6, fontWeight: 500,
      }}>{label}</label>}
      <div style={{
        display: "flex", alignItems: "center", background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden",
      }}>
        <span style={{
          padding: "12px 0 12px 16px", fontSize: 18, fontWeight: 700,
          color: C.gold, fontFamily: "Sora, sans-serif",
        }}>R</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            flex: 1, background: "none", border: "none", padding: "12px 16px 12px 8px",
            fontSize: 18, fontWeight: 600, fontFamily: "Sora, sans-serif",
            color: C.white, outline: "none", minHeight: 44,
          }}
        />
      </div>
    </div>
  );
}

// Toggle switch
function Toggle({ value, onChange, label, description }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      width: "100%", background: "none", padding: "12px 0", gap: 12,
    }}>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{description}</div>}
      </div>
      <div style={{
        width: 48, height: 28, borderRadius: 14, padding: 2,
        background: value ? C.green : C.border,
        transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 12, background: C.white,
          transform: value ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
    </button>
  );
}

// Contextual Tjommie home message based on user state
function getTjommieHomeMsg(data) {
  const { name, expenses, firstExpenseLogged, streakDays, totalExpensesLogged, setupDone, occupation } = data;
  const firstName = (name || "").split(" ")[0] || "friend";
  const totalDeductions = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const marginal = getMarginal(data.income);

  if (!firstExpenseLogged) {
    return {
      msg: `Right ${firstName}, let's find your money. Want to start with your work expenses or set up your monthly budget first?`,
      actions: [
        { label: "Add work expense", screen: "add" },
        { label: "Set up budget", screen: "budget_edit" },
      ],
    };
  }

  if (totalExpensesLogged === 1) {
    const saving = Math.round(totalDeductions * marginal);
    return {
      msg: `Nice one! That first expense is already saving you ${fmtR(saving)}. Keep going — every receipt is money back in your pocket.`,
      actions: [{ label: "Add another expense", screen: "add" }],
    };
  }

  if (streakDays >= 3) {
    return {
      msg: `${streakDays}-day streak, ${firstName}! You've logged ${totalExpensesLogged} expenses worth ${fmtR(totalDeductions)} in deductions. Your future self is going to love you at tax time.`,
      actions: [
        { label: "Add expense", screen: "add" },
        { label: "View my 13th Cheque", screen: "cheque" },
      ],
    };
  }

  if (totalDeductions > 5000) {
    return {
      msg: `${firstName}, you've found ${fmtR(totalDeductions)} in work expenses so far. That's roughly ${fmtR(Math.round(totalDeductions * marginal))} back at tax time. Let's keep building.`,
      actions: [
        { label: "Add expense", screen: "add" },
        { label: "View my 13th Cheque", screen: "cheque" },
      ],
    };
  }

  return {
    msg: `Welcome back, ${firstName}. You've got ${daysLeft()} days left in this tax year. Every work expense you log now is money back in February.`,
    actions: [
      { label: "Add expense", screen: "add" },
      { label: "Check my refund", screen: "cheque" },
    ],
  };
}

// Mock receipt data for prototype scanner
const MOCK_RECEIPTS = [
  { cat: "stationery", description: "Printer cartridges - Incredible Connection", amount: 849 },
  { cat: "internet", description: "Fibre internet (work portion) - Vumatel", amount: 450 },
  { cat: "phone", description: "Phone contract (work portion) - MTN", amount: 389 },
  { cat: "computer", description: "USB-C hub - Takealot", amount: 699 },
  { cat: "courses", description: "Online course - Udemy", amount: 249 },
  { cat: "reference_books", description: "Professional handbook - Loot.co.za", amount: 395 },
  { cat: "stationery", description: "Whiteboard markers & flip chart - Waltons", amount: 285 },
  { cat: "travel", description: "Fuel - Engen (client visit)", amount: 620 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PART 2: SETUP / ONBOARDING SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Step 0: POPIA Consent ──────────────────────────────────────────────────────
function S_Consent({ onAccept }) {
  return (
    <div className="scroll-area" style={{ flex: 1, padding: "24px 20px" }}>
      <div style={{ height: 40 }} />
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>{I.lock}</div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Your privacy matters</h1>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6 }}>
          Before we start, here's how we handle your information.
        </p>
      </div>

      <div style={{
        background: C.card, borderRadius: 14, padding: "18px 20px",
        border: `1px solid ${C.border}`, marginBottom: 16,
      }}>
        {[
          { icon: "📱", title: "Everything stays on your phone", desc: "Your financial data is stored locally on this device only. Nothing is uploaded to our servers." },
          { icon: "🤖", title: "Tjommie chat uses AI", desc: "When you chat with Tjommie, your messages are sent to Anthropic's API for processing. No personal financial data is included — only the conversation text." },
          { icon: "🗑️", title: "You're in control", desc: "You can delete all your data at any time from Settings. No account needed, no data retained." },
          { icon: "🇿🇦", title: "POPIA compliant", desc: "We collect only what's needed to calculate your tax refund. Nothing more." },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", gap: 12, padding: "12px 0",
            borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{item.title}</p>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onAccept} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>I understand — let's go</button>

      <PrivacyBadge style={{ justifyContent: "center", marginTop: 16 }} />
    </div>
  );
}

// ── Step 1: Promise / Hook Screen ──────────────────────────────────────────────
function S_Promise({ next }) {
  const [n, setN] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = 7800; // Conservative average — SARS compliant
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / 2200);
      const ease = 1 - Math.pow(1 - p, 3);
      setN(Math.round(ease * target));
      if (p < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  return (
    <div className="scroll-area" style={{
      flex: 1, display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      textAlign: "center", padding: "30px 24px",
    }}>
      <p style={{
        fontSize: 12, color: C.muted, letterSpacing: ".08em",
        textTransform: "uppercase", fontWeight: 600, marginBottom: 18,
      }}>The average South African tax refund is around</p>

      <div style={{
        fontFamily: "Sora, sans-serif", fontSize: 58, fontWeight: 800,
        color: C.gold, lineHeight: 1, marginBottom: 8,
        textShadow: "0 0 50px rgba(240,180,41,.28)",
      }}>
        R <AnimNum value={n} />
      </div>

      <p style={{ fontSize: 14, color: C.muted, marginBottom: 10 }}>
        Many people get more. Some get less.
      </p>
      <p style={{ fontSize: 12, color: C.faint, marginBottom: 36 }}>
        Your actual refund depends on your income, expenses, and deductions.
      </p>

      <div style={{
        background: C.card, borderRadius: 14, padding: "18px 20px",
        border: `1px solid rgba(240,180,41,0.15)`, marginBottom: 36,
        textAlign: "left",
      }}>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: C.muted }}>
          It's called your <strong style={{ color: C.gold }}>13th Cheque</strong> — the
          tax refund most people don't realise they're owed. We'll help you find yours
          and build it up all year long.
        </p>
      </div>

      <button onClick={next} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>Show me mine</button>
    </div>
  );
}

// ── Step 2: Employment Type ────────────────────────────────────────────────────
function S_EmpType({ data, update, next }) {
  const [sel, setSel] = useState(data.empType || "");
  const [commPct, setCommPct] = useState(data.commissionPct || 0);

  const types = [
    { id: "self", icon: "🧾", title: "I work for myself", sub: "Freelancer, sole proprietor, contractor" },
    { id: "commission", icon: "💰", title: "I earn commission", sub: "Variable or performance-based pay" },
    { id: "salaried", icon: "🏢", title: "I get a salary", sub: "Fixed monthly, employer deducts PAYE" },
  ];

  function handleNext() {
    if (!sel) return;
    update({ empType: sel, commissionPct: sel === "commission" ? commPct : 0 });
    next();
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 1 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>How do you earn your money?</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
        This changes what SARS will let you claim.
      </p>

      <Tjommie compact msg="Hey, I'm Tjommie. This first question matters most — be honest, it can only help you." />

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setSel(t.id)} style={{
            width: "100%", textAlign: "left",
            background: sel === t.id ? "rgba(240,180,41,0.08)" : C.card,
            border: `1px solid ${sel === t.id ? "rgba(240,180,41,0.35)" : C.border}`,
            borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", gap: 14,
          }}>
            <span style={{ fontSize: 24 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: C.white }}>{t.title}</p>
              <p style={{ fontSize: 12, color: sel === t.id ? C.gold : C.muted, marginTop: 2 }}>{t.sub}</p>
            </div>
            {sel === t.id && <span style={{ color: C.gold }}>{I.check}</span>}
          </button>
        ))}
      </div>

      {sel === "commission" && (
        <div style={{
          background: C.card, borderRadius: 12, padding: "14px 16px",
          border: `1px solid ${C.border}`, marginBottom: 14,
        }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 8 }}>
            What % of your income is commission?
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {[25, 50, 75, 100].map(p => (
              <button key={p} onClick={() => setCommPct(p)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: commPct === p ? C.gold : "transparent",
                color: commPct === p ? C.bg : C.muted,
                border: `1px solid ${commPct === p ? C.gold : C.border}`,
              }}>{p}%</button>
            ))}
          </div>
          {commPct > 50 && (
            <p style={{ fontSize: 12, color: C.green, marginTop: 10, lineHeight: 1.5 }}>
              Great — earning &gt;50% commission means you qualify for the full range of deductions, including travel and home office.
            </p>
          )}
        </div>
      )}

      {sel === "salaried" && (
        <div style={{
          background: "rgba(239,68,68,0.05)", borderRadius: 12, padding: "12px 14px",
          border: "1px solid rgba(239,68,68,0.14)", marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: "rgba(239,100,100,0.85)", lineHeight: 1.6 }}>
            Salaried employees have stricter rules under Section 23(m) — SARS expects your employer to cover most work costs. We'll guide you through exactly what you can claim.
          </p>
        </div>
      )}

      <button onClick={handleNext} style={{
        width: "100%", background: sel ? C.gradGold : C.card, color: sel ? C.bg : C.muted,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
        opacity: sel ? 1 : 0.5,
      }}>Continue</button>
    </div>
  );
}

// ── Step 3: Your Details (Name, Occupation, Income) ────────────────────────────
function S_Details({ data, update, next }) {
  const [name, setName] = useState(data.name || "");
  const [occ, setOcc] = useState(data.occupation || "");
  const [income, setIncome] = useState(data.income || 0);

  const annual = income * 12;
  const { marginalRate, tax } = calcTax(annual);
  const estimate = annual > 0 ? Math.round(annual * 0.08 * marginalRate) : 0;
  const valid = name.trim().length > 0 && income > 0;

  function handleNext() {
    if (!valid) return;
    update({ name: name.trim(), occupation: occ.trim(), income });
    next();
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 2 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>About you</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>
        Three things to calculate your 13th Cheque.
      </p>

      <label style={{
        fontSize: 12, color: C.muted, fontWeight: 600,
        letterSpacing: ".06em", textTransform: "uppercase",
        display: "block", marginBottom: 6,
      }}>Your first name</label>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="e.g. Lerato"
        style={{ width: "100%", marginBottom: 14 }}
      />

      <label style={{
        fontSize: 12, color: C.muted, fontWeight: 600,
        letterSpacing: ".06em", textTransform: "uppercase",
        display: "block", marginBottom: 6,
      }}>What do you do for work?</label>
      <input
        value={occ} onChange={e => setOcc(e.target.value)}
        placeholder="e.g. Designer, teacher, driver..."
        style={{ width: "100%", marginBottom: 14 }}
      />

      <CurrencyInput
        label="MONTHLY GROSS INCOME (BEFORE TAX)"
        value={income}
        onChange={setIncome}
        placeholder="25,000"
        style={{ marginBottom: 10 }}
      />

      {income > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          padding: "0 2px", marginBottom: 16,
        }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            Tax bracket: <strong style={{ color: C.white }}>{Math.round(marginalRate * 100)}%</strong>
          </span>
          <span style={{ fontSize: 12, color: C.muted }}>
            Monthly tax: <strong style={{ color: C.red }}>~{fmtR(tax / 12)}</strong>
          </span>
        </div>
      )}

      {estimate > 0 && (
        <div style={{
          background: C.card, borderRadius: 14, padding: "16px",
          border: "1px solid rgba(240,180,41,0.15)", marginBottom: 18,
          textAlign: "center",
        }}>
          <p style={{ fontSize: 11, color: C.faint, marginBottom: 6 }}>Potential 13th Cheque</p>
          <div style={{
            fontFamily: "Sora, sans-serif", fontSize: 36, fontWeight: 800, color: C.gold,
          }}>
            <AnimNum value={estimate} prefix="R " />
          </div>
          <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            based on typical deductions at your income level
          </p>
        </div>
      )}

      <button onClick={handleNext} style={{
        width: "100%", background: valid ? C.gradGold : C.card,
        color: valid ? C.bg : C.muted,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
        opacity: valid ? 1 : 0.5,
      }}>Continue</button>
    </div>
  );
}

// ── Step 4: Career-Aware Deduction Suggestions ─────────────────────────────────
function S_CareerSuggestions({ data, update, next }) {
  const careerKey = matchCareer(data.occupation);
  const profile = CAREER_PROFILES[careerKey];
  const availCats = getAvailableCats(data.empType, data.commissionPct);
  const firstName = (data.name || "").split(" ")[0] || "friend";

  // Pre-select career-suggested deductions that are available
  const [selected, setSelected] = useState(() => {
    const sel = {};
    for (const catKey of profile.deductions) {
      if (availCats[catKey]) sel[catKey] = true;
    }
    // Always suggest union and professional_fees if available
    if (availCats.union) sel.union = true;
    if (availCats.professional_fees) sel.professional_fees = true;
    return sel;
  });

  function toggle(key) {
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleNext() {
    update({ deductionCats: selected });
    next();
  }

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 3 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Your work expenses</h2>

      <Tjommie compact msg={
        data.occupation
          ? `As ${/^[aeiou]/i.test(data.occupation) ? "an" : "a"} ${data.occupation}, you can probably claim these, ${firstName}. ${profile.tip}`
          : `Here are common work deductions, ${firstName}. Switch on what applies to you.`
      } />

      {data.empType === "salaried" && (
        <div style={{
          background: "rgba(59,130,246,0.06)", borderRadius: 10, padding: "10px 14px",
          border: "1px solid rgba(59,130,246,0.15)", marginBottom: 12,
        }}>
          <p style={{ fontSize: 12, color: C.blue, lineHeight: 1.5 }}>
            As a salaried employee, some categories are restricted under Section 23(m). We've hidden ones you can't claim.
          </p>
        </div>
      )}

      <div style={{
        background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
        overflow: "hidden", marginBottom: 16,
      }}>
        {Object.entries(availCats).filter(([k]) => k !== "retirement" && k !== "medical").map(([key, cat], i, arr) => {
          const isOn = selected[key];
          const isSuggested = profile.deductions.includes(key);
          return (
            <button key={key} onClick={() => toggle(key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "13px 16px", background: "none", textAlign: "left",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{cat.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{cat.label}</p>
                {isSuggested && (
                  <p style={{ fontSize: 10, color: C.gold, marginTop: 2 }}>Suggested for your role</p>
                )}
              </div>
              <div style={{
                width: 40, height: 24, borderRadius: 12, padding: 2,
                background: isOn ? "rgba(240,180,41,0.3)" : C.border,
                transition: "background 0.2s", flexShrink: 0,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 10,
                  background: isOn ? C.gold : "rgba(180,200,240,0.2)",
                  transform: isOn ? "translateX(16px)" : "translateX(0)",
                  transition: "transform 0.2s, background 0.2s",
                }} />
              </div>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: C.muted, marginBottom: 16, textAlign: "center" }}>
        {selectedCount} categories selected — you can change these any time
      </p>

      <button onClick={handleNext} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>Continue</button>
    </div>
  );
}

// ── Step 5: Tax Boosters (RA + Medical Aid) ────────────────────────────────────
function S_TaxBoosters({ data, update, next }) {
  const [raMonthly, setRaMonthly] = useState(data.raContribMonthly || 0);
  const [medMembers, setMedMembers] = useState(data.medicalMembers || 0);
  const [medDeps, setMedDeps] = useState(data.medicalDeps || 0);
  const [medMonthly, setMedMonthly] = useState(data.medicalMonthly || 0);

  const annual = data.income * 12;
  const raAnnual = raMonthly * 12;
  const raDeduction = Math.min(raAnnual, annual * RA_RATE, RA_CAP);
  const raSaving = raDeduction > 0 ? Math.round(calcTax(annual).tax - calcTax(Math.max(0, annual - raDeduction)).tax) : 0;

  const medCreditsMonthly = (medMembers >= 1 ? MED_CREDIT_MAIN : 0)
    + (medMembers >= 2 ? MED_CREDIT_FIRST_DEP : 0)
    + Math.max(0, medMembers + medDeps - 2) * MED_CREDIT_OTHER_DEP;
  const medCreditsAnnual = medCreditsMonthly * 12;

  function handleNext() {
    update({
      raContribMonthly: raMonthly,
      medicalMembers: medMembers,
      medicalDeps: medDeps,
      medicalMonthly: medMonthly,
    });
    next();
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 4 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Tax boosters</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
        These two deductions are the biggest refund builders for most South Africans.
      </p>

      {/* RA Section */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "18px",
        border: "1px solid rgba(240,180,41,0.15)", marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>🏦</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>Retirement Annuity (RA)</p>
            <p style={{ fontSize: 11, color: C.muted }}>The #1 tax deduction most South Africans miss</p>
          </div>
        </div>

        <CurrencyInput
          label="Monthly RA contribution"
          value={raMonthly}
          onChange={setRaMonthly}
          placeholder="0"
          style={{ marginBottom: 10 }}
        />

        {raSaving > 0 && (
          <div style={{
            background: "rgba(240,180,41,0.08)", borderRadius: 10,
            padding: "10px 14px", marginTop: 8,
          }}>
            <p style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>
              Tax saving: {fmtR(raSaving)}/year
            </p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              That's {fmtR(Math.round(raSaving / 12))}/month back at tax time
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>
          You can deduct up to 27.5% of income (max R350,000/year). If you don't have an RA yet, it's worth looking into — even R500/month makes a difference.
        </p>
      </div>

      {/* Medical Aid Section */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "18px",
        border: `1px solid ${C.border}`, marginBottom: 18,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 24 }}>🏥</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 15, fontWeight: 700 }}>Medical Aid</p>
            <p style={{ fontSize: 11, color: C.muted }}>Tax credits for you and your dependants</p>
          </div>
        </div>

        <label style={{
          fontSize: 12, color: C.muted, fontWeight: 600, display: "block", marginBottom: 8,
        }}>Are you on medical aid?</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { label: "No", val: 0 },
            { label: "Just me", val: 1 },
            { label: "+1 dependant", val: 2 },
            { label: "+2 or more", val: 3 },
          ].map(opt => (
            <button key={opt.val} onClick={() => { setMedMembers(opt.val); if (opt.val <= 2) setMedDeps(0); }}
              style={{
                flex: 1, padding: "10px 4px", borderRadius: 10,
                fontSize: 11, fontWeight: 600, lineHeight: 1.3,
                background: medMembers === opt.val ? C.green : "transparent",
                color: medMembers === opt.val ? C.bg : C.muted,
                border: `1px solid ${medMembers === opt.val ? C.green : C.border}`,
              }}>{opt.label}</button>
          ))}
        </div>

        {medMembers >= 3 && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 6 }}>
              How many additional dependants? (beyond main member + 1)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[1, 2, 3, 4].map(n => (
                <button key={n} onClick={() => setMedDeps(n)} style={{
                  width: 44, height: 44, borderRadius: 10, fontSize: 16, fontWeight: 600,
                  background: medDeps === n ? C.green : "transparent",
                  color: medDeps === n ? C.bg : C.muted,
                  border: `1px solid ${medDeps === n ? C.green : C.border}`,
                }}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {medCreditsAnnual > 0 && (
          <div style={{
            background: "rgba(16,185,129,0.08)", borderRadius: 10,
            padding: "10px 14px", marginTop: 4,
          }}>
            <p style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>
              Medical tax credits: {fmtR(medCreditsAnnual)}/year
            </p>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              R{MED_CREDIT_MAIN}/month per main member + R{MED_CREDIT_OTHER_DEP}/month per extra dependant
            </p>
          </div>
        )}
      </div>

      {(raSaving > 0 || medCreditsAnnual > 0) && (
        <div style={{
          textAlign: "center", marginBottom: 16,
          padding: "12px", background: "rgba(240,180,41,0.06)", borderRadius: 12,
        }}>
          <p style={{ fontSize: 12, color: C.muted }}>These boosters alone add</p>
          <p style={{
            fontSize: 26, fontWeight: 800, color: C.gold,
            fontFamily: "Sora, sans-serif",
          }}>
            <AnimNum value={raSaving + medCreditsAnnual} prefix="R " />
          </p>
          <p style={{ fontSize: 12, color: C.muted }}>to your 13th Cheque</p>
        </div>
      )}

      <button onClick={handleNext} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>Continue</button>

      <button onClick={() => { update({ raContribMonthly: 0, medicalMembers: 0, medicalDeps: 0, medicalMonthly: 0 }); next(); }}
        style={{
          width: "100%", background: "none", color: C.muted,
          padding: "14px", fontSize: 13, marginTop: 8,
        }}>Skip for now</button>
    </div>
  );
}

// ── Step 6: Budget Setup ───────────────────────────────────────────────────────
function S_Budget({ data, update, next }) {
  const annual = data.income * 12;
  const { tax } = calcTax(annual);
  const netMonthly = Math.round(data.income - tax / 12);
  const [budget, setBudget] = useState(() =>
    data.budget || JSON.parse(JSON.stringify(DEFAULT_BUDGET))
  );
  const [goal, setGoal] = useState(1000);
  const [expanded, setExpanded] = useState(null);

  const total = Object.values(budget).reduce((s, c) => s + (c.amount || 0), 0);
  const remaining = netMonthly - total;

  function updateCat(key, amount) {
    setBudget(prev => ({
      ...prev,
      [key]: { ...prev[key], amount: Math.max(0, amount) },
    }));
  }

  function handleNext() {
    update({ budget, savingsGoal: goal });
    next();
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 5 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Monthly budget</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
        After tax, you have <strong style={{ color: C.green }}>{fmtR(netMonthly)}</strong>/month. Let's plan it.
      </p>

      {/* Savings goal */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "14px 16px",
        border: "1px solid rgba(16,185,129,0.2)", marginBottom: 16,
      }}>
        <p style={{
          fontSize: 11, color: C.green, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8,
        }}>Monthly savings goal</p>
        <CurrencyInput value={goal} onChange={setGoal} placeholder="1,000" />
        {goal > 0 && (
          <p style={{ fontSize: 11, color: "rgba(16,185,129,0.7)", marginTop: 8 }}>
            That's {fmtR(Math.round(goal / 30))}/day — Tjommie will help you stay on track
          </p>
        )}
      </div>

      {/* Budget categories */}
      <p style={{
        fontSize: 10, fontWeight: 700, color: C.faint,
        textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8,
      }}>Monthly limits by category</p>

      <div style={{
        background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
        overflow: "hidden", marginBottom: 12,
      }}>
        {Object.entries(budget).map(([key, cat], i, arr) => (
          <div key={key} style={{
            borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
          }}>
            <button onClick={() => setExpanded(expanded === key ? null : key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", background: "none", textAlign: "left",
            }}>
              <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{cat.icon}</span>
              <span style={{ flex: 1, fontSize: 13, color: C.white }}>{cat.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, color: C.muted }}>R</span>
                <input
                  type="text" inputMode="numeric"
                  value={cat.amount > 0 ? cat.amount.toLocaleString("en-ZA") : ""}
                  onChange={e => {
                    const n = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                    updateCat(key, n);
                  }}
                  onClick={e => e.stopPropagation()}
                  placeholder="0"
                  style={{
                    width: 72, background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "6px 8px", color: C.white, fontSize: 13,
                    textAlign: "right", outline: "none", minHeight: 36,
                  }}
                />
              </div>
            </button>
            {expanded === key && cat.subs && (
              <div style={{ padding: "0 16px 12px 52px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cat.subs.map(sub => (
                    <span key={sub} style={{
                      fontSize: 11, color: C.muted, padding: "4px 10px",
                      background: C.cardHi, borderRadius: 8,
                    }}>{sub}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Budget summary bar */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "4px 2px", marginBottom: 6,
      }}>
        <span style={{ fontSize: 12, color: C.muted }}>Budgeted</span>
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: remaining < 0 ? C.red : C.green,
        }}>
          {fmtR(total)} / {fmtR(netMonthly)}
        </span>
      </div>
      <Bar pct={netMonthly > 0 ? (total / netMonthly) * 100 : 0}
        color={remaining < 0 ? C.red : C.green}
        style={{ marginBottom: 4 }} />
      <p style={{
        fontSize: 11, textAlign: "right", marginBottom: 18,
        color: remaining < 0 ? C.red : C.green,
      }}>
        {remaining >= 0 ? `${fmtR(remaining)} unallocated` : `${fmtR(Math.abs(remaining))} over budget`}
      </p>

      <button onClick={handleNext} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>Almost there</button>

      <button onClick={() => { update({ budget: JSON.parse(JSON.stringify(DEFAULT_BUDGET)), savingsGoal: 0 }); next(); }}
        style={{
          width: "100%", background: "none", color: C.muted,
          padding: "14px", fontSize: 13, marginTop: 8,
        }}>Skip — I'll set this up later</button>
    </div>
  );
}

// ── Step 7: Reminders & Mid-Year Catch-Up ──────────────────────────────────────
function S_Reminders({ data, update, next }) {
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [day, setDay] = useState(0); // Sunday
  const [time, setTime] = useState("09:00");
  const [catchUp, setCatchUp] = useState(null); // null = not answered, true/false
  const firstName = (data.name || "").split(" ")[0] || "friend";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const taxPct = taxYearPct();

  function handleNext() {
    update({
      reminderEnabled,
      reminderDay: reminderEnabled ? day : null,
      reminderTime: reminderEnabled ? time : null,
      catchUpAsked: true,
      catchUpDone: catchUp === false,
    });
    next(catchUp === true); // Pass whether they want to add past expenses
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <p style={{
        fontSize: 11, color: C.gold, fontWeight: 700,
        letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10,
      }}>Step 6 of 6</p>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Stay on track</h2>

      {/* Reminders */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "18px",
        border: `1px solid ${C.border}`, marginBottom: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>{I.bell}</span>
          <p style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Weekly expense reminder</p>
        </div>

        <Tjommie compact msg={`When should I nudge you to log your expenses, ${firstName}? Once a week is all it takes.`} />

        <Toggle
          value={reminderEnabled}
          onChange={setReminderEnabled}
          label="Remind me weekly"
          description="A gentle nudge to log your work expenses"
        />

        {reminderEnabled && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 8 }}>
              Pick a day
            </label>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14,
            }}>
              {days.map((d, i) => (
                <button key={i} onClick={() => setDay(i)} style={{
                  padding: "10px 4px", borderRadius: 10, fontSize: 12,
                  fontWeight: 600, lineHeight: 1.2,
                  background: day === i ? C.gold : "transparent",
                  color: day === i ? C.bg : C.muted,
                  border: `1px solid ${day === i ? C.gold : C.border}`,
                }}>{d.slice(0, 3)}</button>
              ))}
            </div>

            <label style={{ fontSize: 12, color: C.muted, display: "block", marginBottom: 8 }}>
              What time?
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["08:00", "09:00", "12:00", "18:00", "20:00"].map(t => (
                <button key={t} onClick={() => setTime(t)} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 10,
                  fontSize: 12, fontWeight: 600,
                  background: time === t ? C.gold : "transparent",
                  color: time === t ? C.bg : C.muted,
                  border: `1px solid ${time === t ? C.gold : C.border}`,
                }}>{t}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mid-year catch-up */}
      {taxPct > 10 && (
        <div style={{
          background: C.card, borderRadius: 14, padding: "18px",
          border: `1px solid ${C.border}`, marginBottom: 18,
        }}>
          <Tjommie compact msg={
            `The tax year is ${taxPct}% done (March to February). Have you had work expenses earlier this year that you haven't tracked yet? You can add past expenses — they still count.`
          } />

          {catchUp === null ? (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => setCatchUp(true)} style={{
                flex: 1, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: C.gold, color: C.bg,
              }}>Yes, I have some</button>
              <button onClick={() => setCatchUp(false)} style={{
                flex: 1, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                background: "transparent", color: C.muted,
                border: `1px solid ${C.border}`,
              }}>No, starting fresh</button>
            </div>
          ) : (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginTop: 12, padding: "10px 14px",
              background: catchUp ? "rgba(240,180,41,0.08)" : "rgba(16,185,129,0.08)",
              borderRadius: 10,
            }}>
              <span style={{ color: catchUp ? C.gold : C.green }}>{I.check}</span>
              <p style={{ fontSize: 13, color: catchUp ? C.gold : C.green }}>
                {catchUp ? "We'll help you add past expenses after setup" : "Fresh start — let's go!"}
              </p>
            </div>
          )}
        </div>
      )}

      <button onClick={handleNext} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
      }}>Finish setup</button>
    </div>
  );
}

// ── Setup Complete / Ready Screen ──────────────────────────────────────────────
function S_Ready({ data, onDone }) {
  const firstName = (data.name || "").split(" ")[0] || "friend";
  const annual = data.income * 12;
  const marginal = getMarginal(annual);
  const workDeductions = data.expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const raAnnual = (data.raContribMonthly || 0) * 12;

  const refundData = calcRefund(
    annual, workDeductions, raAnnual,
    data.medicalMembers || 0, data.medicalDeps || 0
  );

  // Minimum estimate based on typical deductions
  const estimate = Math.max(refundData.refund, Math.round(annual * 0.06 * marginal));
  const dream = dreamFor(estimate);

  const [showConfetti, setShowConfetti] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="scroll-area" style={{
      flex: 1, textAlign: "center", padding: "20px 24px",
    }}>
      <div style={{ height: 20 }} />

      {showConfetti && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: "none", overflow: "hidden", zIndex: 10,
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: -20,
              width: 8 + Math.random() * 8,
              height: 8 + Math.random() * 8,
              background: [C.gold, C.green, "#F59E0B", "#8B5CF6", "#EC4899"][i % 5],
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animation: `confettiFall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
              opacity: 0,
            }} />
          ))}
          <style>{`
            @keyframes confettiFall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(800px) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      <div style={{ fontSize: 52, marginBottom: 14 }}>🎯</div>
      <h1 style={{ fontSize: 26, marginBottom: 8 }}>You're set, {firstName}!</h1>

      <div style={{
        background: C.card, borderRadius: 16, padding: "22px",
        border: "1px solid rgba(240,180,41,0.2)", marginBottom: 20,
      }}>
        <p style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>Your potential 13th Cheque</p>
        <div style={{
          fontFamily: "Sora, sans-serif", fontSize: 46, fontWeight: 800,
          color: C.gold, lineHeight: 1,
          textShadow: "0 0 40px rgba(240,180,41,0.3)",
        }}>
          <AnimNum value={estimate} prefix="R " />
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>
          {daysLeft()} days left in the tax year to build it
        </p>

        {/* Breakdown */}
        <div style={{
          marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}`,
          textAlign: "left",
        }}>
          {refundData.raSaving > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>RA tax saving</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.gold }}>{fmtR(refundData.raSaving)}</span>
            </div>
          )}
          {refundData.medCredits > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Medical credits</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.green }}>{fmtR(refundData.medCredits)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Work expense deductions</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.gold }}>building...</span>
          </div>
        </div>
      </div>

      {estimate >= 500 && (
        <p style={{
          fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.6,
        }}>
          That could pay for <strong style={{ color: C.gold }}>{dream}</strong>
        </p>
      )}

      <Tjommie msg={`Right ${firstName} — every work expense you add from now on grows that gold number. The tax year ends 28 Feb. Let's find your money.`} />

      <button onClick={onDone} style={{
        width: "100%", background: C.gradGold, color: C.bg,
        borderRadius: 14, padding: "16px", fontSize: 16, fontWeight: 700,
        marginTop: 8,
      }}>Start building my 13th Cheque</button>

      <PrivacyBadge style={{ justifyContent: "center", marginTop: 16 }} />
    </div>
  );
}

// ── Setup Controller (manages the multi-step flow) ─────────────────────────────
function SetupFlow({ data, setData, onComplete }) {
  const [step, setStep] = useState(data.setupStep || 0);
  const [wantsCatchUp, setWantsCatchUp] = useState(false);

  function update(fields) {
    setData(prev => {
      const next = { ...prev, ...fields, setupStep: step };
      saveData(next);
      return next;
    });
  }

  function goNext() {
    setStep(s => s + 1);
    update({ setupStep: step + 1 });
  }

  function goBack() {
    if (step > 0) {
      setStep(s => s - 1);
      update({ setupStep: step - 1 });
    }
  }

  function handleComplete() {
    const finalData = { ...data, setupDone: true, consentGiven: true, consentDate: todayStr() };
    setData(finalData);
    saveData(finalData);
    onComplete(wantsCatchUp);
  }

  // Back button for steps that support it (step >= 2)
  const backBtn = step >= 2 ? (
    <button onClick={goBack} style={{
      position: "absolute", top: 14, left: 14, zIndex: 5,
      background: "none", color: C.muted, display: "flex",
      alignItems: "center", padding: 8,
    }} aria-label="Go back">{I.back}</button>
  ) : null;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
      {backBtn}

      {/* Progress dots */}
      {step >= 2 && (
        <div style={{
          display: "flex", justifyContent: "center", gap: 6,
          padding: "16px 20px 4px", position: "absolute", top: 0,
          left: 0, right: 0, zIndex: 4,
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              width: i <= step ? 24 : 8, height: 4, borderRadius: 2,
              background: i <= step ? C.gold : C.border,
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}

      {step === 0 && <S_Consent onAccept={goNext} />}
      {step === 1 && <S_Promise next={goNext} />}
      {step === 2 && <S_EmpType data={data} update={update} next={goNext} />}
      {step === 3 && <S_Details data={data} update={update} next={goNext} />}
      {step === 4 && <S_CareerSuggestions data={data} update={update} next={goNext} />}
      {step === 5 && <S_TaxBoosters data={data} update={update} next={goNext} />}
      {step === 6 && <S_Budget data={data} update={update} next={goNext} />}
      {step === 7 && <S_Reminders data={data} update={update}
        next={(wants) => { setWantsCatchUp(wants); goNext(); }} />}
      {step === 8 && <S_Ready data={data} onDone={handleComplete} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 3: MAIN APP SCREENS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Home Screen ────────────────────────────────────────────────────────────────
function S_Home({ data, go, setData }) {
  const annual = data.income * 12;
  const { tax, marginalRate } = calcTax(annual);
  const mTax = Math.round(tax / 12);
  const living = data.income - mTax;

  const workExp = data.expenses.filter(e => e.type === "work");
  const workTotal = workExp.reduce((s, e) => s + e.amount, 0);
  const raAnnual = (data.raContribMonthly || 0) * 12;

  const refundData = calcRefund(
    annual, workTotal, raAnnual,
    data.medicalMembers || 0, data.medicalDeps || 0
  );

  const thisM = data.expenses.filter(e => monthKey(e.date) === thisMonthStr());
  const personalSpent = thisM.filter(e => e.type === "personal").reduce((s, e) => s + e.amount, 0);
  const livingLeft = living - personalSpent;
  const pct = taxYearPct();
  const dream = dreamFor(refundData.refund);
  const recent = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const savGoal = data.savingsGoal || 0;

  // Contextual Tjommie message
  const tjommie = getTjommieHomeMsg(data);

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
      }}>
        <div>
          <p style={{ fontSize: 12, color: C.muted }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},
          </p>
          <h2 style={{ fontSize: 20 }}>{(data.name || "").split(" ")[0] || "friend"}</h2>
        </div>
        <button onClick={() => go("settings")} style={{
          background: "none", color: C.muted, display: "flex", alignItems: "center",
        }}>{I.gear}</button>
      </div>

      {/* 13th Cheque card */}
      <button onClick={() => go("cheque")} style={{
        width: "100%", background: C.card, borderRadius: 16, padding: "18px",
        border: "1px solid rgba(240,180,41,0.15)", marginBottom: 12, textAlign: "left",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p style={{
              fontSize: 10, color: C.faint, fontWeight: 600,
              letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4,
            }}>Your 13th Cheque</p>
            <div style={{
              fontFamily: "Sora, sans-serif", fontSize: 36, fontWeight: 800,
              color: C.gold, lineHeight: 1,
              textShadow: "0 0 40px rgba(240,180,41,0.2)",
            }}>
              <AnimNum value={refundData.refund} prefix="R " />
            </div>
            <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>estimated SARS refund</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: C.muted }}>{daysLeft()} days left</p>
            <p style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>28 Feb</p>
          </div>
        </div>
        <Bar pct={pct} color={C.gold} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <p style={{ fontSize: 10, color: C.muted }}>Tax year {pct}% complete</p>
          {refundData.refund >= 500 && (
            <p style={{ fontSize: 10, color: C.faint }}>{dream}</p>
          )}
        </div>
      </button>

      {/* Two mini cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button onClick={() => go("spending")} style={{
          flex: 1, background: C.card, borderRadius: 14, padding: "13px",
          border: "1px solid rgba(16,185,129,0.15)", textAlign: "left",
        }}>
          <p style={{
            fontSize: 10, color: "rgba(16,185,129,0.6)", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6,
          }}>Living Money</p>
          <p style={{
            fontFamily: "Sora, sans-serif", fontSize: 20, fontWeight: 700,
            color: livingLeft < 0 ? C.red : C.green,
          }}>{fmtR(livingLeft)}</p>
          <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>left this month</p>
          <div style={{ marginTop: 8 }}>
            <Bar pct={living > 0 ? (personalSpent / living) * 100 : 0}
              color={personalSpent > living ? C.red : C.green} />
          </div>
        </button>

        {savGoal > 0 && (
          <button onClick={() => go("spending")} style={{
            flex: 1, background: C.card, borderRadius: 14, padding: "13px",
            border: `1px solid rgba(59,130,246,0.15)`, textAlign: "left",
          }}>
            <p style={{
              fontSize: 10, color: "rgba(59,130,246,0.6)", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6,
            }}>Savings goal</p>
            <p style={{
              fontFamily: "Sora, sans-serif", fontSize: 20, fontWeight: 700,
              color: C.blue,
            }}>{fmtR(savGoal)}</p>
            <p style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>goal this month</p>
            <div style={{ marginTop: 8 }}>
              <Bar pct={savGoal > 0 ? (Math.max(0, livingLeft) / savGoal) * 100 : 0} color={C.blue} />
            </div>
          </button>
        )}
      </div>

      {/* Tjommie contextual message */}
      <Tjommie
        msg={tjommie.msg}
        actions={tjommie.actions?.map(a => ({
          label: a.label,
          onClick: () => go(a.screen),
        }))}
      />

      {/* Recent expenses */}
      {recent.length > 0 && (
        <>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 8,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: C.faint,
              textTransform: "uppercase", letterSpacing: ".08em",
            }}>Recent</p>
            <button onClick={() => go("history")} style={{
              background: "none", color: C.gold, fontSize: 12, padding: "4px 8px",
            }}>See all</button>
          </div>
          <div style={{
            background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
            overflow: "hidden",
          }}>
            {recent.map((e, j) => (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px",
                borderBottom: j < recent.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: e.type === "work" ? "rgba(240,180,41,0.12)" : "rgba(16,185,129,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}>{e.type === "work" ? "⚡" : "💳"}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>
                    {e.description || e.merchant || TAX_CATS[e.taxCategory]?.label || "Expense"}
                  </p>
                  <p style={{ fontSize: 10, color: C.muted }}>{fmtDate(e.date)}</p>
                </div>
                <span style={{
                  fontFamily: "Sora, sans-serif", fontSize: 13, fontWeight: 600,
                  color: e.type === "work" ? C.gold : C.white,
                }}>{fmtR(e.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

// ── 13th Cheque Detail Screen ──────────────────────────────────────────────────
function S_Cheque({ data, go }) {
  const annual = data.income * 12;
  const { marginalRate } = calcTax(annual);
  const workExp = data.expenses.filter(e => e.type === "work");
  const workTotal = workExp.reduce((s, e) => s + e.amount, 0);
  const raAnnual = (data.raContribMonthly || 0) * 12;

  const refundData = calcRefund(
    annual, workTotal, raAnnual,
    data.medicalMembers || 0, data.medicalDeps || 0
  );

  // Category breakdown
  const byCat = {};
  workExp.forEach(e => {
    const k = e.taxCategory || "other";
    byCat[k] = (byCat[k] || 0) + e.amount;
  });

  const thisM = workExp.filter(e => monthKey(e.date) === thisMonthStr());
  const thisMTotal = thisM.reduce((s, e) => s + e.amount, 0);
  const dream = dreamFor(refundData.refund);

  // PDF-style summary generation (prototype)
  const [showDownload, setShowDownload] = useState(false);

  function generateSummary() {
    const lines = [
      "═══════════════════════════════════════",
      "THE 13TH CHEQUE — TAX SUMMARY",
      `Generated: ${fmtDateFull(todayStr())}`,
      "═══════════════════════════════════════",
      "",
      `Name: ${data.name}`,
      `Occupation: ${data.occupation}`,
      `Employment type: ${data.empType}`,
      `Annual income: ${fmtR(annual)}`,
      `Marginal tax rate: ${Math.round(marginalRate * 100)}%`,
      "",
      "── WORK EXPENSE DEDUCTIONS ──",
      "",
    ];
    Object.entries(byCat).forEach(([k, amt]) => {
      const cat = TAX_CATS[k] || { label: k };
      lines.push(`${cat.label}: ${fmtR(amt)} (tax saving: ${fmtR(Math.round(amt * marginalRate))})`);
    });
    lines.push("");
    lines.push(`Total work expenses: ${fmtR(workTotal)}`);
    if (raAnnual > 0) {
      lines.push("");
      lines.push("── RETIREMENT ANNUITY ──");
      lines.push(`Annual RA contributions: ${fmtR(raAnnual)}`);
      lines.push(`RA tax saving: ${fmtR(refundData.raSaving)}`);
    }
    if (refundData.medCredits > 0) {
      lines.push("");
      lines.push("── MEDICAL TAX CREDITS ──");
      lines.push(`Annual medical credits: ${fmtR(refundData.medCredits)}`);
    }
    lines.push("");
    lines.push("── ESTIMATED 13TH CHEQUE ──");
    lines.push(`Total estimated refund: ${fmtR(refundData.refund)}`);
    lines.push("");
    lines.push("DISCLAIMER: This is an estimate only and does not");
    lines.push("constitute professional tax advice. Consult a registered");
    lines.push("tax practitioner for your specific situation.");
    lines.push("═══════════════════════════════════════");

    // Prototype: show as alert / copy to clipboard
    const text = lines.join("\n");
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setShowDownload(true));
    } else {
      setShowDownload(true);
    }
    setTimeout(() => setShowDownload(false), 3000);
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
      }}>
        <h2 style={{ fontSize: 20 }}>Your 13th Cheque</h2>
        <button onClick={() => go("add", "work")} style={{
          background: "rgba(240,180,41,0.1)", border: "1px solid rgba(240,180,41,0.25)",
          borderRadius: 10, padding: "8px 14px", color: C.gold, fontSize: 12, fontWeight: 600,
        }}>+ Add expense</button>
      </div>

      {/* Main refund card */}
      <div style={{
        background: C.card, borderRadius: 16, padding: "22px",
        border: "1px solid rgba(240,180,41,0.15)", marginBottom: 14,
      }}>
        <p style={{
          fontSize: 10, color: C.faint, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8,
        }}>Estimated refund from SARS</p>
        <div style={{
          fontFamily: "Sora, sans-serif", fontSize: 48, fontWeight: 800,
          color: C.gold, lineHeight: 1,
          textShadow: "0 0 40px rgba(240,180,41,0.25)",
        }}>
          <AnimNum value={refundData.refund} prefix="R " />
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 8, marginBottom: 14 }}>
          {Math.round(marginalRate * 100)}% marginal rate · {daysLeft()} days left
        </p>
        <Bar pct={taxYearPct()} color={C.gold} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 10, color: C.muted }}>Tax year {taxYearPct()}% done</span>
          <span style={{ fontSize: 10, color: C.muted }}>28 Feb deadline</span>
        </div>

        {/* Refund breakdown */}
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          {[
            { label: "Work expense deductions", value: refundData.taxSaved, color: C.gold },
            refundData.raSaving > 0 && { label: "RA tax saving", value: refundData.raSaving, color: C.gold },
            refundData.medCredits > 0 && { label: "Medical tax credits", value: refundData.medCredits, color: C.green },
          ].filter(Boolean).map((r, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", padding: "4px 0",
            }}>
              <span style={{ fontSize: 12, color: C.muted }}>{r.label}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: r.color,
                fontFamily: "Sora, sans-serif",
              }}>{fmtR(r.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This month mini card */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "14px 16px",
        border: `1px solid ${C.border}`, marginBottom: 14,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>This month</span>
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.gold,
            fontFamily: "Sora, sans-serif",
          }}>{fmtR(Math.round(thisMTotal * marginalRate))} earned</span>
        </div>
        <p style={{ fontSize: 11, color: C.muted }}>
          {fmtR(thisMTotal)} in expenses · {thisM.length} items logged
        </p>
      </div>

      {/* Category breakdown */}
      {Object.keys(byCat).length > 0 && (
        <>
          <p style={{
            fontSize: 10, fontWeight: 700, color: C.faint,
            textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8,
          }}>By category</p>
          <div style={{
            background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
            overflow: "hidden", marginBottom: 14,
          }}>
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([k, amt], j, arr) => {
              const cat = TAX_CATS[k] || { icon: "📦", label: k };
              return (
                <div key={k} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px",
                  borderBottom: j < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{cat.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13 }}>{cat.label}</p>
                    <p style={{ fontSize: 10, color: C.muted }}>{fmtR(amt)}</p>
                  </div>
                  <span style={{
                    fontFamily: "Sora, sans-serif", fontSize: 13,
                    fontWeight: 700, color: C.gold,
                  }}>+{fmtR(Math.round(amt * marginalRate))}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Dream comparison */}
      {refundData.refund >= 500 && (
        <div style={{
          background: "rgba(240,180,41,0.04)", border: "1px solid rgba(240,180,41,0.1)",
          borderRadius: 12, padding: "12px 14px", marginBottom: 14,
        }}>
          <p style={{ fontSize: 12, color: "rgba(240,180,41,0.65)", lineHeight: 1.6 }}>
            Your 13th Cheque could pay for <strong style={{ color: C.gold }}>{dream}</strong>.
            Every extra R100 you claim adds <strong style={{ color: C.gold }}>R{Math.round(marginalRate * 100)}</strong> to your refund.
          </p>
        </div>
      )}

      {/* Download summary */}
      <button onClick={generateSummary} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        background: C.card, borderRadius: 14, padding: "14px",
        border: `1px solid ${C.border}`, color: C.muted, fontSize: 14, fontWeight: 500,
      }}>
        {I.dl}
        <span>{showDownload ? "Copied to clipboard!" : "Download tax summary"}</span>
      </button>

      {workExp.length === 0 && (
        <div style={{ marginTop: 14 }}>
          <Tjommie msg="Nothing logged yet. Start with your phone contract — it's usually the easiest deduction most people miss." />
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

// ── Add Expense Screen ─────────────────────────────────────────────────────────
function S_Add({ data, setData, go, back, defaultType }) {
  const [type, setType] = useState(defaultType || "work");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayStr());
  const [taxCat, setTaxCat] = useState("");
  const [budCat, setBudCat] = useState("groceries");
  const [saved, setSaved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const annual = data.income * 12;
  const { marginalRate } = calcTax(annual);
  const chequeAdd = type === "work" ? Math.round(amount * marginalRate) : 0;
  const availCats = getAvailableCats(data.empType, data.commissionPct);

  // Set default tax category
  useEffect(() => {
    if (!taxCat && Object.keys(availCats).length > 0) {
      const first = Object.keys(availCats).find(k => k !== "retirement" && k !== "medical");
      if (first) setTaxCat(first);
    }
  }, []);

  // Mock receipt scanner
  function scanReceipt() {
    setScanning(true);
    const receipt = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)];
    setTimeout(() => {
      setScanning(false);
      setScanResult(receipt);
      setAmount(receipt.amount);
      setDescription(receipt.description);
      if (availCats[receipt.cat]) setTaxCat(receipt.cat);
      setType("work");
    }, 1800);
  }

  function handleSave() {
    if (amount <= 0) return;
    const expense = {
      id: uid(),
      amount,
      description: description || (type === "work" ? (TAX_CATS[taxCat]?.label || "Work expense") : budCat),
      merchant: description,
      date,
      type,
      taxCategory: type === "work" ? taxCat : null,
      budgetCategory: type === "personal" ? budCat : null,
      createdAt: Date.now(),
    };

    setData(prev => {
      const isFirstExpense = !prev.firstExpenseLogged;
      const today = todayStr();
      const streak = prev.lastLogDate === today ? prev.streakDays :
        (prev.lastLogDate && (new Date(today) - new Date(prev.lastLogDate)) <= 86400000 * 2)
          ? prev.streakDays + 1 : 1;

      const next = {
        ...prev,
        expenses: [...prev.expenses, expense],
        firstExpenseLogged: true,
        lastLogDate: today,
        streakDays: streak,
        totalExpensesLogged: (prev.totalExpensesLogged || 0) + 1,
      };
      saveData(next);
      return next;
    });
    setSaved(true);
  }

  // Success screen after saving
  if (saved) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px", textAlign: "center",
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {type === "work" ? "⚡" : "✅"}
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 12 }}>Logged!</h2>

        {type === "work" && chequeAdd > 0 && (
          <div style={{
            background: C.card, borderRadius: 16, padding: "18px",
            border: "1px solid rgba(240,180,41,0.15)", marginBottom: 20, width: "100%",
          }}>
            <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Added to your 13th Cheque</p>
            <div style={{
              fontFamily: "Sora, sans-serif", fontSize: 34, fontWeight: 800, color: C.gold,
              textShadow: "0 0 30px rgba(240,180,41,0.3)",
            }}>+<AnimNum value={chequeAdd} prefix="R " /></div>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
              from {fmtR(amount)} in work expenses
            </p>
          </div>
        )}

        {type === "personal" && (
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>
            {fmtR(amount)} logged against your {DEFAULT_BUDGET[budCat]?.label || budCat} budget.
          </p>
        )}

        {/* First expense celebration */}
        {data.totalExpensesLogged === 1 && type === "work" && (
          <Tjommie compact msg={`Your first work expense! That's ${fmtR(chequeAdd)} back from SARS already. This is how the 13th Cheque grows.`} />
        )}

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button onClick={() => {
            setSaved(false); setAmount(0); setDescription(""); setScanResult(null);
          }} style={{
            flex: 1, background: "transparent", color: C.gold,
            border: `1px solid rgba(240,180,41,0.25)`,
            borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 600,
          }}>Add another</button>
          <button onClick={() => go("home")} style={{
            flex: 1, background: C.gradGold, color: C.bg,
            borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 700,
          }}>Done</button>
        </div>
      </div>
    );
  }

  // Scanner overlay
  if (scanning) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 24px", textAlign: "center",
      }}>
        <div style={{
          width: 120, height: 120, borderRadius: 24, border: `3px solid ${C.gold}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24, position: "relative",
        }}>
          <span style={{ fontSize: 48 }}>{I.cam}</span>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "40%", background: `linear-gradient(180deg, rgba(240,180,41,0.3), transparent)`,
            borderRadius: "21px 21px 0 0",
            animation: "scanLine 1.5s ease-in-out infinite",
          }} />
          <style>{`@keyframes scanLine { 0%,100%{top:0;height:40%} 50%{top:60%;height:40%} }`}</style>
        </div>
        <h3 style={{ fontSize: 18, marginBottom: 8 }}>Scanning receipt...</h3>
        <p style={{ fontSize: 13, color: C.muted }}>Hold still, reading the details</p>
      </div>
    );
  }

  return (
    <div className="scroll-area" style={{ flex: 1 }}>
      <TopBar title="Add Expense" onBack={back} />
      <div style={{ padding: "4px 20px 20px" }}>

        {/* Receipt scan button — prominent at top */}
        <button onClick={scanReceipt} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, background: "rgba(240,180,41,0.08)",
          border: "1px dashed rgba(240,180,41,0.35)",
          borderRadius: 14, padding: "16px", marginBottom: 18,
          color: C.gold, fontSize: 14, fontWeight: 600,
        }}>
          {I.cam}
          <span>Scan receipt</span>
        </button>

        {scanResult && (
          <div style={{
            background: "rgba(16,185,129,0.06)", borderRadius: 10,
            padding: "10px 14px", marginBottom: 14,
            border: "1px solid rgba(16,185,129,0.15)",
          }}>
            <p style={{ fontSize: 12, color: C.green }}>
              Receipt scanned: {scanResult.description} — {fmtR(scanResult.amount)}
            </p>
          </div>
        )}

        {/* Work / Personal toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {[
            { id: "work", label: "Work", emoji: "⚡", sub: "Builds 13th Cheque" },
            { id: "personal", label: "Personal", emoji: "💳", sub: "Tracks budget" },
          ].map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{
              flex: 1, padding: "12px", borderRadius: 14, textAlign: "center",
              background: type === t.id
                ? (t.id === "work" ? "rgba(240,180,41,0.1)" : "rgba(16,185,129,0.08)")
                : "transparent",
              border: `1px solid ${type === t.id
                ? (t.id === "work" ? "rgba(240,180,41,0.35)" : "rgba(16,185,129,0.25)")
                : C.border}`,
            }}>
              <p style={{
                fontWeight: 600, fontSize: 14,
                color: type === t.id ? (t.id === "work" ? C.gold : C.green) : C.muted,
              }}>{t.emoji} {t.label}</p>
              <p style={{ fontSize: 10, color: C.faint, marginTop: 2 }}>{t.sub}</p>
            </button>
          ))}
        </div>

        {/* Category FIRST (before amount) — fixes agent feedback */}
        <label style={{
          fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: ".06em", textTransform: "uppercase",
          display: "block", marginBottom: 6,
        }}>Category</label>
        {type === "work" ? (
          <select value={taxCat} onChange={e => setTaxCat(e.target.value)}
            style={{ width: "100%", marginBottom: 14 }}>
            {Object.entries(availCats)
              .filter(([k]) => k !== "retirement" && k !== "medical")
              .map(([k, cat]) => (
                <option key={k} value={k}>{cat.icon} {cat.label}</option>
              ))}
          </select>
        ) : (
          <select value={budCat} onChange={e => setBudCat(e.target.value)}
            style={{ width: "100%", marginBottom: 14 }}>
            {Object.entries(DEFAULT_BUDGET).map(([k, cat]) => (
              <option key={k} value={k}>{cat.icon} {cat.label}</option>
            ))}
          </select>
        )}

        {/* SARS warning for selected category */}
        {type === "work" && TAX_CATS[taxCat]?.warn && (
          <div style={{
            background: "rgba(59,130,246,0.06)", borderRadius: 10,
            padding: "8px 12px", marginBottom: 14, marginTop: -6,
            border: "1px solid rgba(59,130,246,0.12)",
          }}>
            <p style={{ fontSize: 11, color: C.blue, lineHeight: 1.5 }}>
              {I.info} {TAX_CATS[taxCat].warn}
            </p>
          </div>
        )}

        {/* Amount */}
        <CurrencyInput
          label="AMOUNT"
          value={amount}
          onChange={setAmount}
          placeholder="0"
          style={{ marginBottom: type === "work" && amount > 0 ? 6 : 14 }}
        />

        {type === "work" && amount > 0 && (
          <p style={{ fontSize: 12, color: C.gold, marginBottom: 14 }}>
            Adds {fmtR(chequeAdd)} to your 13th Cheque
          </p>
        )}

        {/* Description */}
        <label style={{
          fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: ".06em", textTransform: "uppercase",
          display: "block", marginBottom: 6,
        }}>Description</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Takealot printer cartridges"
          style={{ width: "100%", marginBottom: 14 }}
        />

        {/* Date */}
        <label style={{
          fontSize: 12, color: C.muted, fontWeight: 600,
          letterSpacing: ".06em", textTransform: "uppercase",
          display: "block", marginBottom: 6,
        }}>Date</label>
        <input
          type="date" value={date}
          onChange={e => setDate(e.target.value)}
          style={{ width: "100%", marginBottom: 18 }}
        />

        {/* Tax year validation */}
        {date && !inTaxYear(date) && (
          <div style={{
            background: "rgba(239,68,68,0.06)", borderRadius: 10,
            padding: "10px 14px", marginBottom: 14, marginTop: -10,
            border: "1px solid rgba(239,68,68,0.15)",
          }}>
            <p style={{ fontSize: 12, color: C.red, lineHeight: 1.5 }}>
              This date falls outside the current tax year (1 Mar – 28 Feb). It won't count towards this year's refund.
            </p>
          </div>
        )}

        <button onClick={handleSave} style={{
          width: "100%", background: amount > 0 ? C.gradGold : C.card,
          color: amount > 0 ? C.bg : C.muted,
          borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700,
          opacity: amount > 0 ? 1 : 0.5,
        }}>Save expense</button>
      </div>
    </div>
  );
}

// ── Spending / Budget Screen ───────────────────────────────────────────────────
function S_Spending({ data, go }) {
  const annual = data.income * 12;
  const { tax } = calcTax(annual);
  const mTax = Math.round(tax / 12);
  const living = data.income - mTax;
  const thisM = data.expenses.filter(e => monthKey(e.date) === thisMonthStr());
  const personalSpent = thisM.filter(e => e.type === "personal").reduce((s, e) => s + e.amount, 0);
  const workSpent = thisM.filter(e => e.type === "work").reduce((s, e) => s + e.amount, 0);
  const remaining = living - personalSpent;
  const savGoal = data.savingsGoal || 0;
  const budget = data.budget || DEFAULT_BUDGET;

  function getSpent(key) {
    return thisM.filter(e => e.type === "personal" && e.budgetCategory === key)
      .reduce((s, e) => s + e.amount, 0);
  }

  return (
    <div className="scroll-area" style={{ flex: 1, padding: "20px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14,
      }}>
        <h2 style={{ fontSize: 20 }}>My Spending</h2>
        <span style={{
          fontSize: 11, color: C.muted, background: "rgba(255,255,255,0.05)",
          padding: "5px 12px", borderRadius: 100, border: `1px solid ${C.border}`,
        }}>
          {new Date().toLocaleString("en-ZA", { month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Money flow */}
      <div style={{
        background: C.card, borderRadius: 14, padding: "14px 16px",
        border: `1px solid ${C.border}`, marginBottom: 14,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: C.faint,
          textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10,
        }}>Money flow this month</p>
        {[
          { label: "Gross income", amt: data.income, c: C.green },
          { label: "Tax (PAYE estimate)", amt: -mTax, c: C.red },
          { label: "Work expenses", amt: -workSpent, c: C.gold },
          { label: "Living money", amt: living, c: C.blue },
          { label: "Spent so far", amt: -personalSpent, c: "#F59E0B" },
          { label: "Remaining", amt: remaining, c: remaining < 0 ? C.red : C.green },
        ].map(r => (
          <div key={r.label} style={{
            display: "flex", justifyContent: "space-between",
            padding: "5px 0", borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{ fontSize: 12, color: C.muted }}>{r.label}</span>
            <span style={{
              fontSize: 12, fontWeight: 600, color: r.c,
              fontFamily: "Sora, sans-serif",
            }}>{r.amt < 0 ? `-${fmtR(-r.amt)}` : fmtR(r.amt)}</span>
          </div>
        ))}
      </div>

      {/* Savings goal */}
      {savGoal > 0 && (
        <div style={{
          background: C.card, borderRadius: 14, padding: "14px 16px",
          border: "1px solid rgba(59,130,246,0.15)", marginBottom: 14,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>Savings goal</p>
            <span style={{
              fontSize: 12, fontFamily: "Sora, sans-serif", fontWeight: 700, color: C.blue,
            }}>{fmtR(savGoal)}/month</span>
          </div>
          <Bar pct={savGoal > 0 ? Math.max(0, remaining) / savGoal * 100 : 0} color={C.blue} />
          <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
            {remaining >= savGoal ? "On track!" :
              remaining > 0 ? `${fmtR(remaining)} available — save ${fmtR(savGoal - remaining)} more to hit goal` :
                `Over budget by ${fmtR(-remaining)}`}
          </p>
        </div>
      )}

      {/* Budget breakdown */}
      <p style={{
        fontSize: 10, fontWeight: 700, color: C.faint,
        textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8,
      }}>Budget</p>
      <div style={{
        background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
        overflow: "hidden", marginBottom: 14,
      }}>
        {Object.entries(budget).filter(([, c]) => c.amount > 0).map(([key, cat], j, arr) => {
          const spent = getSpent(key);
          const limit = cat.amount || 0;
          const pct = limit > 0 ? Math.min(100, Math.round(spent / limit * 100)) : 0;
          const over = spent > limit && limit > 0;
          return (
            <div key={key} style={{
              padding: "12px 16px",
              borderBottom: j < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                  <span>{cat.icon}</span>{cat.label}
                </span>
                <span style={{
                  fontSize: 11, fontFamily: "Sora, sans-serif", fontWeight: 600,
                  color: over ? C.red : pct > 80 ? "#F59E0B" : C.muted,
                }}>{fmtR(spent)}/{fmtR(limit)}</span>
              </div>
              <Bar pct={pct} color={over ? C.red : pct > 80 ? "#F59E0B" : C.blue} />
              {over && (
                <p style={{ fontSize: 10, color: C.red, marginTop: 3 }}>
                  {fmtR(spent - limit)} over budget
                </p>
              )}
            </div>
          );
        })}
        {Object.values(budget).every(c => !c.amount) && (
          <div style={{ padding: "20px 16px", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: C.muted }}>No budget set yet</p>
            <p style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>
              Set up your budget in Settings to track spending
            </p>
          </div>
        )}
      </div>

      {thisM.filter(e => e.type === "personal").length === 0 && (
        <Tjommie compact msg="No personal expenses this month yet. Log your everyday spending to see where your money goes."
          actions={[{ label: "Add expense", onClick: () => go("add", "personal") }]} />
      )}

      <div style={{ height: 20 }} />
    </div>
  );
}

// ── Tjommie Chat Screen ────────────────────────────────────────────────────────
function S_Tjommie({ data, back }) {
  const annual = data.income * 12;
  const { tax, marginalRate } = calcTax(annual);
  const workTotal = data.expenses.filter(e => e.type === "work").reduce((s, e) => s + e.amount, 0);
  const raAnnual = (data.raContribMonthly || 0) * 12;
  const refundData = calcRefund(annual, workTotal, raAnnual, data.medicalMembers || 0, data.medicalDeps || 0);
  const firstName = (data.name || "").split(" ")[0] || "friend";

  const sysPrompt = `You are Tjommie, a warm South African financial assistant inside "The 13th Cheque" app. Speak like a knowledgeable friend — direct, warm, plain South African English. No corporate speak. Keep answers short (mobile screen). Always be specific to the user's real numbers.

User details:
- Name: ${data.name}, Occupation: ${data.occupation}
- Employment type: ${data.empType}
- Monthly income: R${data.income} (annual: R${annual})
- Monthly tax: ~R${Math.round(tax / 12)}, Marginal rate: ${Math.round(marginalRate * 100)}%
- Total work expenses logged: R${workTotal}
- RA contributions: R${raAnnual}/year
- Estimated 13th Cheque: R${refundData.refund}
- Tax year: ${daysLeft()} days until 28 Feb deadline

SARS 2025/26 key facts (verified):
- Primary rebate: R17,235; Tax threshold: R95,750
- Brackets: 18% up to R237,100 / 26% to R370,500 / 31% to R512,800 / 36% to R673,000 / 39% to R857,900 / 41% to R1,817,000 / 45% above
- Section 23(m): Salaried employees limited to specific deductions (employer must provide most)
- Section 11(a): Freelancers/commission (>50%) get broad deduction rights
- Home office: must be EXCLUSIVE work use, dedicated room, >50% commission/self-employed
- Equipment <R7k: full deduction; >R7k: depreciate over 3 years
- RA contributions: up to 27.5% of income, max R350k/year
- Medical tax credits: R364/month main member + first dependant, R246/month additional dependants
- Travel: SARS REQUIRES a logbook with business km, dates, destinations
- Never guarantee a refund — always say "estimate"
- Recommend a tax practitioner for complex situations`;

  const [msgs, setMsgs] = useState([
    { r: "a", t: `Hey ${firstName}! Your 13th Cheque is at ${fmtR(refundData.refund)} with ${daysLeft()} days left. What do you want to know?` },
  ]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const quickQ = [
    "How do I claim more?",
    "Am I on track?",
    `What can a ${data.empType || "salaried"} employee claim?`,
    "Tell me about RA deductions",
  ];

  async function send(text) {
    const q = text || inp;
    if (!q.trim() || loading) return;
    setInp("");
    setMsgs(m => [...m, { r: "u", t: q }]);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "DEMO_KEY",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 400,
          system: sysPrompt,
          messages: [
            ...msgs.filter(m => m.r === "u" || m.r === "a").slice(-8)
              .map(m => ({ role: m.r === "u" ? "user" : "assistant", content: m.t })),
            { role: "user", content: q },
          ],
        }),
      });
      const d = await res.json();
      setMsgs(m => [...m, { r: "a", t: d.content?.[0]?.text || "Ag, something went wrong. Try again?" }]);
    } catch (e) {
      setMsgs(m => [...m, { r: "a", t: "Connection problem — check your internet and try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <TopBar title="Tjommie" onBack={back} />

      <div className="scroll-area" style={{ padding: "6px 16px", flex: 1 }}>
        {/* Quick questions on first load */}
        {msgs.length === 1 && (
          <div style={{ marginBottom: 14 }}>
            <p style={{
              fontSize: 10, color: C.faint, textTransform: "uppercase",
              letterSpacing: ".08em", marginBottom: 8,
            }}>Quick questions</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {quickQ.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  background: "rgba(240,180,41,0.08)",
                  border: "1px solid rgba(240,180,41,0.2)",
                  borderRadius: 20, padding: "7px 14px",
                  fontSize: 12, color: C.gold,
                }}>{q}</button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {msgs.map((m, i) => (
          <div key={i} style={{
            marginBottom: 10, display: "flex", flexDirection: "column",
            alignItems: m.r === "u" ? "flex-end" : "flex-start",
          }}>
            {m.r === "a" && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "88%" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.gold}, #C98000)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0,
                }}>T</div>
                <div style={{
                  background: C.card, border: `1px solid ${C.border}`,
                  borderRadius: "4px 14px 14px 14px", padding: "10px 14px",
                }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: C.white }}>{m.t}</p>
                </div>
              </div>
            )}
            {m.r === "u" && (
              <div style={{
                background: "rgba(240,180,41,0.1)",
                border: "1px solid rgba(240,180,41,0.2)",
                borderRadius: "14px 4px 14px 14px", padding: "10px 14px",
                maxWidth: "88%",
              }}>
                <p style={{ fontSize: 13, color: C.gold, lineHeight: 1.5 }}>{m.t}</p>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: `linear-gradient(135deg, ${C.gold}, #C98000)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#000", flexShrink: 0,
            }}>T</div>
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: "4px 14px 14px 14px", padding: "12px 16px",
              display: "flex", gap: 5,
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", background: C.gold,
                  animation: `dotBounce 1.2s ${i * 0.2}s infinite`,
                }} />
              ))}
              <style>{`@keyframes dotBounce { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.1)} }`}</style>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "10px 14px", borderTop: `1px solid ${C.border}`,
        display: "flex", gap: 8, flexShrink: 0, background: C.bg,
      }}>
        <input
          value={inp} onChange={e => setInp(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask Tjommie anything..."
          style={{
            flex: 1, borderRadius: 24, padding: "10px 18px", fontSize: 14,
            minHeight: 44,
          }}
        />
        <button onClick={() => send()} disabled={loading || !inp.trim()} style={{
          width: 44, height: 44, borderRadius: 22,
          background: inp.trim() ? `linear-gradient(135deg, ${C.gold}, #C98000)` : C.card,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: inp.trim() ? "#000" : C.faint,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Settings Screen ────────────────────────────────────────────────────────────
function S_Settings({ data, setData, back, go }) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState("");

  function startEdit(field, currentValue) {
    setEditField(field);
    setEditValue(String(currentValue || ""));
  }

  function saveEdit() {
    if (!editField) return;
    let val = editValue;
    if (editField === "income" || editField === "raContribMonthly") {
      val = parseInt(val.replace(/\D/g, ""), 10) || 0;
    }
    setData(prev => {
      const next = { ...prev, [editField]: val };
      saveData(next);
      return next;
    });
    setEditField(null);
  }

  function doReset() {
    localStorage.removeItem(STORE_KEY);
    setData({ ...BLANK });
    go("setup");
  }

  const fields = [
    { key: "name", label: "Name", value: data.name || "—", editable: true },
    { key: "occupation", label: "Occupation", value: data.occupation || "—", editable: true },
    { key: "income", label: "Monthly income", value: fmtR(data.income), editable: true },
    { key: "empType", label: "Employment type", value: data.empType || "—" },
    { key: null, label: "Marginal tax rate", value: `${Math.round(getMarginal(data.income * 12) * 100)}%` },
    { key: "raContribMonthly", label: "RA contribution", value: data.raContribMonthly ? `${fmtR(data.raContribMonthly)}/month` : "None", editable: true },
    { key: null, label: "Medical aid", value: data.medicalMembers > 0 ? `${data.medicalMembers} member(s)` : "None" },
    { key: null, label: "Expenses logged", value: String(data.expenses?.length || 0) },
    { key: null, label: "Reminder", value: data.reminderEnabled ? `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][data.reminderDay || 0]} at ${data.reminderTime || "09:00"}` : "Off" },
  ];

  return (
    <div className="scroll-area" style={{ flex: 1 }}>
      <TopBar title="Settings" onBack={back} right={
        <button onClick={() => go("budget_edit")} style={{
          background: "none", color: C.gold, fontSize: 12, padding: "4px 8px",
        }}>Edit budget</button>
      } />
      <div style={{ padding: "4px 20px 20px" }}>
        {/* Profile fields */}
        <div style={{
          background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          overflow: "hidden", marginBottom: 16,
        }}>
          {fields.map((f, j) => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "13px 16px",
              borderBottom: j < fields.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ flex: 1, fontSize: 13, color: C.muted }}>{f.label}</span>
              {editField === f.key ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    autoFocus
                    style={{
                      width: 120, padding: "4px 8px", fontSize: 13,
                      borderRadius: 8, minHeight: 32,
                    }}
                  />
                  <button onClick={saveEdit} style={{
                    background: C.gold, color: C.bg, borderRadius: 8,
                    padding: "4px 10px", fontSize: 12, fontWeight: 600,
                  }}>Save</button>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{f.value}</span>
                  {f.editable && (
                    <button onClick={() => startEdit(f.key, f.key === "income" ? data.income : data[f.key])} style={{
                      background: "none", color: C.faint, padding: 4,
                      display: "flex", alignItems: "center",
                    }}>{I.edit}</button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Data & privacy */}
        <div style={{
          background: C.card, borderRadius: 14, padding: "14px 16px",
          border: `1px solid ${C.border}`, marginBottom: 16,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Data & Privacy</p>
          <PrivacyBadge style={{ marginBottom: 10 }} />
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 8 }}>
            All your financial data is stored locally on this device. When you chat with Tjommie, your messages are processed by Anthropic's API.
          </p>
          {data.consentDate && (
            <p style={{ fontSize: 11, color: C.faint }}>
              Consent given: {fmtDateFull(data.consentDate)}
            </p>
          )}
        </div>

        {/* Disclaimer */}
        <div style={{
          background: C.card, borderRadius: 14, padding: "14px 16px",
          border: `1px solid ${C.border}`, marginBottom: 18,
        }}>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            <strong style={{ color: C.white }}>The 13th Cheque</strong> provides estimates for guidance only and does not constitute professional tax advice. Consult a registered SARS tax practitioner for your specific situation.
          </p>
          <p style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>
            SARS 2025/26 · Last verified Feb 2026
          </p>
        </div>

        {/* Reset */}
        {!resetConfirm ? (
          <button onClick={() => setResetConfirm(true)} style={{
            width: "100%", background: "transparent",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 14, padding: "14px", color: "rgba(239,68,68,0.5)",
            fontSize: 14, fontWeight: 500,
          }}>Reset all data</button>
        ) : (
          <div style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 14, padding: 16,
          }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(239,68,68,0.75)", marginBottom: 4 }}>
              Are you sure?
            </p>
            <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              This deletes everything permanently. It cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={doReset} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                background: "rgba(239,68,68,0.15)", color: C.red,
                fontSize: 14, fontWeight: 700,
              }}>Yes, reset</button>
              <button onClick={() => setResetConfirm(false)} style={{
                flex: 1, padding: "12px", borderRadius: 10,
                background: "transparent", color: C.muted,
                border: `1px solid ${C.border}`, fontSize: 14,
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── History Screen ─────────────────────────────────────────────────────────────
function S_History({ data, setData, back }) {
  const [filter, setFilter] = useState("all");
  const sorted = [...(data.expenses || [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter(e => filter === "all" || e.type === filter);

  const { marginalRate } = calcTax(data.income * 12);

  function deleteExpense(id) {
    setData(prev => {
      const next = { ...prev, expenses: prev.expenses.filter(e => e.id !== id) };
      saveData(next);
      return next;
    });
  }

  // Group by month
  const grouped = {};
  sorted.forEach(e => {
    const mk = monthKey(e.date);
    if (!grouped[mk]) grouped[mk] = [];
    grouped[mk].push(e);
  });

  return (
    <div className="scroll-area" style={{ flex: 1 }}>
      <TopBar title="All Expenses" onBack={back} />
      <div style={{ padding: "4px 20px 20px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            ["all", "All"],
            ["work", "Work"],
            ["personal", "Personal"],
          ].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              flex: 1, padding: "10px", borderRadius: 10,
              background: filter === v ? "rgba(240,180,41,0.1)" : "transparent",
              border: `1px solid ${filter === v ? "rgba(240,180,41,0.25)" : C.border}`,
              color: filter === v ? C.gold : C.muted, fontSize: 13, fontWeight: 600,
            }}>{l} {v === "work" ? "⚡" : v === "personal" ? "💳" : ""}</button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <p style={{ fontSize: 14, color: C.muted }}>No expenses here yet.</p>
            <p style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>
              Tap + to start logging
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([mk, expenses]) => (
            <div key={mk} style={{ marginBottom: 16 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 8,
              }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: C.faint,
                  textTransform: "uppercase", letterSpacing: ".06em",
                }}>
                  {new Date(mk + "-01T00:00:00").toLocaleString("en-ZA", { month: "long", year: "numeric" })}
                </p>
                <p style={{ fontSize: 11, color: C.muted }}>
                  {expenses.length} items · {fmtR(expenses.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
              <div style={{
                background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
                overflow: "hidden",
              }}>
                {expenses.map((e, j) => (
                  <div key={e.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    borderBottom: j < expenses.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: e.type === "work" ? "rgba(240,180,41,0.12)" : "rgba(16,185,129,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>{e.type === "work" ? "⚡" : "💳"}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 500 }}>
                        {e.description || e.merchant || "Expense"}
                      </p>
                      <p style={{ fontSize: 10, color: C.muted }}>
                        {fmtDate(e.date)}
                        {e.type === "work" && e.taxCategory && TAX_CATS[e.taxCategory] && (
                          <> · {TAX_CATS[e.taxCategory].label}</>
                        )}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontFamily: "Sora, sans-serif", fontSize: 13,
                        fontWeight: 600, color: e.type === "work" ? C.gold : C.white,
                        display: "block",
                      }}>{fmtR(e.amount)}</span>
                      {e.type === "work" && (
                        <span style={{ fontSize: 10, color: C.faint }}>
                          +{fmtR(Math.round(e.amount * marginalRate))} back
                        </span>
                      )}
                    </div>
                    <button onClick={() => deleteExpense(e.id)} style={{
                      background: "none", color: "rgba(239,68,68,0.4)", padding: 4,
                      display: "flex", alignItems: "center",
                    }}>{I.x}</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Budget Edit Screen ─────────────────────────────────────────────────────────
function S_BudgetEdit({ data, setData, back }) {
  const [budget, setBudget] = useState(
    data.budget || JSON.parse(JSON.stringify(DEFAULT_BUDGET))
  );
  const [goal, setGoal] = useState(data.savingsGoal || 0);

  const annual = data.income * 12;
  const { tax } = calcTax(annual);
  const netMonthly = Math.round(data.income - tax / 12);
  const total = Object.values(budget).reduce((s, c) => s + (c.amount || 0), 0);

  function updateCat(key, amount) {
    setBudget(prev => ({
      ...prev,
      [key]: { ...prev[key], amount: Math.max(0, amount) },
    }));
  }

  function handleSave() {
    setData(prev => {
      const next = { ...prev, budget, savingsGoal: goal };
      saveData(next);
      return next;
    });
    back();
  }

  return (
    <div className="scroll-area" style={{ flex: 1 }}>
      <TopBar title="Edit Budget" onBack={back} right={
        <button onClick={handleSave} style={{
          background: C.gold, color: C.bg, borderRadius: 10,
          padding: "8px 16px", fontSize: 13, fontWeight: 700,
        }}>Save</button>
      } />
      <div style={{ padding: "4px 20px 20px" }}>
        <div style={{
          background: C.card, borderRadius: 14, padding: "14px 16px",
          border: "1px solid rgba(16,185,129,0.15)", marginBottom: 16,
        }}>
          <p style={{
            fontSize: 11, color: C.green, fontWeight: 600,
            textTransform: "uppercase", marginBottom: 8,
          }}>Monthly savings goal</p>
          <CurrencyInput value={goal} onChange={setGoal} placeholder="1,000" />
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: 8, padding: "0 2px",
        }}>
          <span style={{ fontSize: 12, color: C.muted }}>
            After tax: <strong style={{ color: C.green }}>{fmtR(netMonthly)}</strong>
          </span>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: total > netMonthly ? C.red : C.green,
          }}>Budgeted: {fmtR(total)}</span>
        </div>
        <Bar pct={netMonthly > 0 ? (total / netMonthly) * 100 : 0}
          color={total > netMonthly ? C.red : C.green}
          style={{ marginBottom: 14 }} />

        <div style={{
          background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
          overflow: "hidden",
        }}>
          {Object.entries(budget).map(([key, cat], i, arr) => (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>{cat.icon}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{cat.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, color: C.muted }}>R</span>
                <input
                  type="text" inputMode="numeric"
                  value={cat.amount > 0 ? cat.amount.toLocaleString("en-ZA") : ""}
                  onChange={e => {
                    const n = parseInt(e.target.value.replace(/\D/g, ""), 10) || 0;
                    updateCat(key, n);
                  }}
                  placeholder="0"
                  style={{
                    width: 80, background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "6px 8px", color: C.white, fontSize: 13,
                    textAlign: "right", outline: "none", minHeight: 36,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PART 4: MAIN APP COMPONENT — Navigation, Tab Bar, Screen Routing, Export
// ═══════════════════════════════════════════════════════════════════════════════

// ── Bottom Tab Bar ─────────────────────────────────────────────────────────────
function BottomNav({ screen, go }) {
  const tabs = [
    { id: "home", icon: I.home, label: "Home" },
    { id: "cheque", icon: I.star, label: "13th" },
    { id: "add", icon: null, label: "Add", fab: true },
    { id: "spending", icon: I.chart, label: "Spending" },
    { id: "tjommie", icon: I.chat, label: "Tjommie" },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "6px 8px 12px", borderTop: `1px solid ${C.border}`,
      background: C.bg, flexShrink: 0,
    }}>
      {tabs.map(tab => {
        if (tab.fab) {
          return (
            <button key="add" onClick={() => go("add", "work")} style={{
              width: 52, height: 52, borderRadius: 16,
              background: C.gradGold, color: C.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(240,180,41,0.3)",
              marginTop: -14,
            }}>{I.plus}</button>
          );
        }
        const active = screen === tab.id;
        return (
          <button key={tab.id} onClick={() => go(tab.id)} style={{
            background: "none", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3, padding: "6px 10px",
            color: active ? C.gold : C.faint,
            transition: "color 0.2s",
          }}>
            {tab.icon}
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Status Bar (phone frame top) ───────────────────────────────────────────────
function PhoneStatusBar() {
  const [time, setTime] = useState(() => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  });

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setTime(`${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 20px 0", fontSize: 12, fontWeight: 600, color: C.white,
      flexShrink: 0,
    }}>
      <span>{time}</span>
      <div style={{
        width: 80, height: 28, background: "#000", borderRadius: 14,
      }} />
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {/* Signal bars */}
        <svg width="16" height="12" viewBox="0 0 16 12">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill={C.white} />
          <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill={C.white} />
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill={C.white} />
          <rect x="13" y="0" width="3" height="12" rx="0.5" fill={C.white} opacity="0.3" />
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12">
          <rect x="0" y="0" width="22" height="12" rx="2" stroke={C.white} strokeWidth="1" fill="none" />
          <rect x="2" y="2" width="15" height="8" rx="1" fill={C.green} />
          <rect x="23" y="3" width="2" height="6" rx="1" fill={C.white} opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

// ── Main App Component ─────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(() => loadData() || { ...BLANK });
  const [screen, setScreen] = useState(() => {
    const d = loadData();
    if (!d || !d.setupDone) return "setup";
    return "home";
  });
  const [navStack, setNavStack] = useState([]);
  const [addType, setAddType] = useState("work");

  // Navigation helpers
  function go(s, ctx) {
    if (s === "add") setAddType(ctx || "work");
    // For main tab navigation, reset the stack
    if (["home", "cheque", "spending"].includes(s)) {
      setNavStack([]);
    } else {
      setNavStack(prev => [...prev, screen]);
    }
    setScreen(s);
  }

  function back() {
    if (navStack.length > 0) {
      setScreen(navStack[navStack.length - 1]);
      setNavStack(prev => prev.slice(0, -1));
    } else {
      setScreen("home");
    }
  }

  // Setup complete handler
  function handleSetupComplete(wantsCatchUp) {
    setScreen("home");
    setNavStack([]);
    // If user wants mid-year catch-up, navigate to add screen after a beat
    if (wantsCatchUp) {
      setTimeout(() => {
        setAddType("work");
        setScreen("add");
        setNavStack(["home"]);
      }, 500);
    }
  }

  // Determine if bottom nav should show
  const showNav = ["home", "cheque", "spending"].includes(screen);
  const activeTab = screen;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "#030810",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{CSS}</style>
      <div className="app-frame">
        {/* Phone status bar */}
        <PhoneStatusBar />

        {/* Setup flow */}
        {screen === "setup" && (
          <SetupFlow
            data={data}
            setData={setData}
            onComplete={handleSetupComplete}
          />
        )}

        {/* Main app screens */}
        {screen !== "setup" && (
          <>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {screen === "home" && (
                <S_Home data={data} go={go} setData={setData} />
              )}
              {screen === "cheque" && (
                <S_Cheque data={data} go={go} />
              )}
              {screen === "spending" && (
                <S_Spending data={data} go={go} />
              )}
              {screen === "add" && (
                <S_Add
                  data={data} setData={setData}
                  go={go} back={back}
                  defaultType={addType}
                />
              )}
              {screen === "tjommie" && (
                <S_Tjommie data={data} back={back} />
              )}
              {screen === "settings" && (
                <S_Settings data={data} setData={setData} back={back} go={go} />
              )}
              {screen === "history" && (
                <S_History data={data} setData={setData} back={back} />
              )}
              {screen === "budget_edit" && (
                <S_BudgetEdit data={data} setData={setData} back={back} />
              )}
            </div>

            {/* Bottom navigation */}
            {showNav && (
              <BottomNav screen={activeTab} go={go} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
