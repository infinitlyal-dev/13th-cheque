# Mobile Accessibility & Data Cost Agent Report

**Iteration:** 1
**Date:** 2026-02-20
**Agent:** Mobile Accessibility & Data Cost
**File reviewed:** `thirteenth-cheque-v2.jsx`

---

## Executive Summary

The 13th Cheque app has a decent foundation for offline use because it relies on localStorage for persistence and has minimal network dependencies. However, there are several CRITICAL and HIGH issues relating to font loading, the Tjommie API call strategy, touch target sizing, absence of offline error handling, and accessibility shortcomings that would cause real problems for users on R29 data bundles, Galaxy A15 devices, and during Stage 4 load shedding.

The app makes exactly one external network call per user action (Tjommie chat via Anthropic API) and loads one external resource on startup (Google Fonts). Both need attention. The rest of the app is entirely client-side, which is a strong starting point.

---

## Item-by-Item Review

### ITEM: Google Fonts Loading (@import in CSS)

**Line 106:** `@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');`

- **Offline capable:** NO
- **Data cost:** HIGH -- Google Fonts CSS + WOFF2 files for Sora (4 weights) and DM Sans (3 weights) total approximately 80-150KB on first load. The `@import` in CSS is render-blocking -- the entire app UI will not display until the fonts load or timeout. On a 50MB data bundle, this is 0.15-0.3% of the user's entire bundle consumed just to show text.
- **Low-end device impact:** MAJOR -- `@import` in CSS creates a blocking waterfall. The browser must first download the CSS file, then discover the font files, then download those. On a slow 3G connection (common during load shedding when towers are overloaded), this can delay first paint by 3-8 seconds. The Galaxy A15 user sees a blank white screen during this time.
- **Battery impact:** LOW -- One-time cost, cached thereafter.
- **Accessibility issue:** CRITICAL -- If fonts fail to load (offline, slow connection, load shedding), and `display=swap` fails to apply correctly in all browsers, the user could see invisible text (FOIT -- Flash of Invisible Text). The app literally becomes unreadable. Even with `display=swap`, there is a layout shift when fonts arrive that causes jitter on low-RAM devices.
- **Fix:**
  1. Change from `@import` to a `<link rel="preload">` strategy, or embed critical font subsets inline as base64 in the CSS (adds ~20KB but eliminates the network dependency entirely).
  2. At minimum, add a robust `font-display: swap` fallback stack in the CSS: `font-family: 'Sora', system-ui, -apple-system, sans-serif` -- already partially done but the @import blocking is the real problem.
  3. Consider reducing to 2 weights per font (400, 700) instead of 4+3 weights. This halves font payload.
  4. Best option for SA market: self-host the fonts with the app bundle and eliminate the external request entirely.

**Severity: CRITICAL**

---

### ITEM: Tjommie Chat API (Anthropic API Call)

**Lines 793-801:** `fetch("https://api.anthropic.com/v1/messages", ...)`

- **Offline capable:** NO
- **Data cost:** HIGH -- Each Tjommie message sends a substantial system prompt (~1.2KB) plus conversation history (growing per message), and receives ~350 tokens (~500-700 bytes) in response. A typical 5-message conversation costs approximately 15-25KB. On a R29 data bundle (often 100-250MB), a daily Tjommie session of 5 messages costs roughly 0.01-0.025% of the bundle. Seems small per session, but the system prompt is re-sent with every single message. Over a month of daily use: ~500-750KB just for chat.
- **Low-end device impact:** MINOR -- JSON parsing of API responses is lightweight.
- **Battery impact:** MEDIUM -- Each API call activates the cellular radio, which is the single biggest battery drain on a smartphone. If the user sends 5 messages, that is 5 separate radio activations. During load shedding, battery is precious.
- **Accessibility issue:** The API key is expected to be... where? The code calls the Anthropic API directly from the client with no visible API key header. This means either: (a) it is a prototype that will not work in production, or (b) the API key is being injected somewhere not shown. Either way, no authentication header is present in the fetch call (no `x-api-key` or `Authorization` header), so this call will fail with a 401. The error handling shows "Connection problem" which is misleading -- it is an auth problem.
- **Fix:**
  1. **Add the missing API key header** -- or acknowledge this is prototype-only and add a clear offline fallback.
  2. **Cache common responses locally.** The quick questions ("How do I claim more?", "Am I on track?", "What's my marginal rate?", "What can a freelancer claim?") are predictable. Pre-compute answers for these and serve them from local storage. Zero data cost for the 4 most common interactions.
  3. **Batch conversation context.** Instead of sending the full system prompt with every message, hash and cache the system prompt server-side (if using a proxy) or compress the context window.
  4. **Add explicit offline detection.** Before calling the API, check `navigator.onLine`. If offline, show: "I'm offline right now -- but you can still log expenses. I'll catch up when you're connected." This is warm, honest, and South African.
  5. **Debounce/throttle** -- prevent accidental double-sends that waste data.

**Severity: HIGH**

---

### ITEM: Expense Logging (localStorage Write)

**Lines 627-628:** `update(d=>({...d,expenses:[...d.expenses,{...}]}));`

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE -- Pure localStorage operation, zero network traffic.
- **Low-end device impact:** MINOR -- Spreading the entire expenses array on every save creates a new array copy. With 500+ expenses over a tax year, this could cause a brief stutter on a 3GB RAM device. Not breaking, but noticeable.
- **Battery impact:** NONE
- **Accessibility issue:** None for storage. However, the `type="number"` input for amount (line 665) is problematic on mobile. On many Android devices, `type="number"` opens a numeric keypad that does not include a decimal point on some Samsung keyboards. Also, the R prefix inside the input field (positioned absolutely) can overlap with the cursor on some devices.
- **Fix:**
  1. For large expense lists, consider using a more efficient update pattern (e.g., push to array instead of spread-copy).
  2. Consider chunked localStorage writes if data grows beyond 2MB (localStorage limit is typically 5MB but varies).
  3. Add a `try/catch` with user-visible feedback if localStorage is full: "Storage is full -- please export your data."
  4. Use `type="text" inputMode="decimal"` instead of `type="number"` for better cross-device keyboard support.

**Severity: LOW**

---

### ITEM: AnimNum Component (requestAnimationFrame Loop)

**Lines 186-196:** `requestAnimationFrame(tick)` running for 1100ms on every value change.

- **Offline capable:** YES (no network)
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MAJOR -- The AnimNum component is used on the Home screen, Cheque screen, Ready screen, and Add Expense confirmation. On the Home screen alone, there are potentially 3-4 AnimNum instances running simultaneously (13th Cheque amount, Living Money, Savings). Each runs `requestAnimationFrame` at 60fps for 1.1 seconds. On a Galaxy A15 with 3GB RAM and a mid-range GPU, running 3-4 concurrent animation loops while also rendering the rest of the UI causes frame drops and visible jank.
- **Battery impact:** MEDIUM -- `requestAnimationFrame` at 60fps for 1.1 seconds per number is not terrible for a single instance, but 3-4 concurrent instances on every screen navigation adds up. Every screen change re-triggers all number animations.
- **Accessibility issue:** Users with vestibular disorders or motion sensitivity may find the counting animation disorienting. There is no `prefers-reduced-motion` check.
- **Fix:**
  1. Add `prefers-reduced-motion` media query check. If the user prefers reduced motion, display the final number immediately without animation.
  2. Stagger animations so only one runs at a time, or reduce to 30fps on low-end devices.
  3. Add a cleanup function to the useEffect to cancel the animation frame when the component unmounts (currently missing -- potential memory leak and wasted CPU cycles on unmounted components).
  4. Consider using CSS transitions instead of JS animation loops -- `transition: all 0.5s` on a CSS counter is GPU-accelerated and does not block the main thread.

**Severity: HIGH**

---

### ITEM: S_Promise Screen (Animated Counter on Load)

**Lines 231-252:** Another `requestAnimationFrame` loop counting to 18,400 over 2.2 seconds.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MINOR -- Single animation, acceptable. But combined with the CSS fadeIn animation and the emoji rendering, first-time setup on a low-end device can feel sluggish.
- **Battery impact:** LOW
- **Accessibility issue:** The R18,400 figure ("SARS owes the average South African") has no citation and could be misleading. From a mobile/accessibility standpoint: the 62px font size is excellent for readability, which is good.
- **Fix:** Add `prefers-reduced-motion` check. Show final number instantly if motion is reduced.

**Severity: LOW**

---

### ITEM: Touch Targets Throughout the App

Multiple locations have undersized touch targets.

- **Offline capable:** N/A
- **Data cost:** N/A
- **Low-end device impact:** MINOR
- **Battery impact:** NONE
- **Accessibility issue:** CRITICAL -- Multiple touch targets fail the 44x44px minimum:
  1. **Back button** (line 174): `padding: 4px` on a 22px icon = ~30x30px touch target. Too small for thumbs, especially on a cracked screen protector.
  2. **Toggle switches** (line 351): 36x21px -- well below 44x44. These are the primary interaction on the Deductions setup screen.
  3. **Quick question chips** (line 811): `padding: 5px 11px` with 11px font -- approximately 28x21px. Far too small.
  4. **Filter buttons in History** (line 903): `padding: 7px` -- approximately 60x28px. Width is fine, height is too small.
  5. **Delete button in History** (line 916): `padding: 4px` on a 14px icon = ~22x22px. Dangerously small -- users will accidentally delete expenses.
  6. **Settings gear icon** (line 468): No padding specified beyond the icon size. Approximately 22x22px touch target.
  7. **Navigation bar labels** (line 120-121): `padding: 6px 10px` with 8px font -- the text label area is about 40x20px, and while the icon adds height, the total tappable area is borderline.
  8. **Send button in chat** (line 839): 40x40px -- close to minimum but still 4px short.
- **Fix:**
  1. Set a minimum touch target of 44x44px for ALL interactive elements. Use `min-height: 44px; min-width: 44px` on all buttons.
  2. Back button: increase padding to at least 11px.
  3. Toggle switches: increase to 48x28px minimum, with a 44x44 invisible hit area using padding or a wrapper.
  4. Delete button: wrap in a 44x44 container, add a confirmation step (swipe-to-delete or long-press) to prevent accidental deletions.
  5. Quick question chips: increase padding to `10px 16px` minimum.
  6. Send button: increase to 44x44px.

**Severity: CRITICAL**

---

### ITEM: Error States and Failure Handling

- **Offline capable:** PARTIAL -- The app saves to localStorage (works offline) but has no offline detection or user communication.
- **Data cost:** N/A
- **Low-end device impact:** MAJOR -- When things fail silently, users on slow devices do not know if the app is processing or broken.
- **Battery impact:** NONE
- **Accessibility issue:** CRITICAL --
  1. **No offline detection.** The app has zero awareness of connectivity state. If a user opens Tjommie during load shedding and sends a message, the fetch fails silently and shows "Connection problem -- try again in a sec." This is decent error text but there is no proactive indication that the user is offline.
  2. **No loading states on setup screens.** The `S_Money` screen performs tax calculations synchronously (fine) but the "Continue" button has no disabled/loading state when tapped -- users may double-tap.
  3. **localStorage failure is silent** (lines 8-9): `catch(e) {}` -- if storage is full or unavailable, the user loses data with no warning.
  4. **Budget limit input has no validation.** Users can enter negative numbers or absurdly large values. The `Math.max(0,v)` check (line 371) handles negatives but not NaN or non-numeric input on some keyboards.
  5. **The Anthropic API call has no timeout.** On a degraded cellular network during load shedding, the fetch could hang for 30+ seconds with no user feedback beyond the loading dots.
- **Fix:**
  1. Add `navigator.onLine` check + `online`/`offline` event listeners. Show a small persistent banner when offline: "You're offline. Expenses still save locally."
  2. Add a fetch timeout (8-10 seconds) for the Tjommie API call. After timeout: "Tjommie is having trouble connecting. Try again later -- your expenses are safe."
  3. Add a visible error state for localStorage failures: "Could not save -- your device storage may be full."
  4. Add debounce or `disabled` state on save/continue buttons after first tap to prevent double submissions.
  5. Add input validation with user-friendly error messages.

**Severity: CRITICAL**

---

### ITEM: CSS Animations and Backdrop Filter

**Lines 107-109, 119:** `@keyframes` animations and `backdrop-filter: blur(20px)` on the nav bar.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MAJOR -- `backdrop-filter: blur(20px)` is one of the most expensive CSS operations on mobile. It requires the browser to render the content behind the element, apply a Gaussian blur, then composite. On a Galaxy A15 or Tecno Camon with a Mali GPU, this causes:
  - Dropped frames during scrolling (the nav bar is always visible, so the blur is always being computed)
  - Increased GPU memory usage
  - Visible stutter when navigating between screens
  The `fadeIn` animation with `translateY` is fine (GPU-composited). The `pop` and `dot` animations are lightweight.
- **Battery impact:** HIGH -- `backdrop-filter` forces continuous GPU compositing while the element is visible. The nav bar is always visible on main screens, meaning the blur is being computed on every frame during any scroll or animation. This is a persistent battery drain.
- **Accessibility issue:** None directly, but performance degradation on low-end devices is an accessibility issue in itself -- the app feels "broken" rather than "slow."
- **Fix:**
  1. Replace `backdrop-filter: blur(20px)` with a solid or semi-transparent background: `background: rgba(13, 25, 41, 0.97)`. The visual difference is negligible on a dark theme, but the performance improvement is dramatic.
  2. If blur is essential for the design, add a `@media (prefers-reduced-motion: reduce)` and a low-end device detection that disables it.
  3. Alternative: use a pre-rendered blurred gradient as a background image instead of real-time blur.

**Severity: HIGH**

---

### ITEM: Navigation Stack and Screen Rendering

**Lines 951-958, 973-1024:** Navigation via `go()` and `back()` with a manual stack.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MINOR -- All screens are conditionally rendered with `{screen==="xxx" && <Component/>}`. This means components are fully unmounted and remounted on every navigation. On a low-end device, this causes a brief flash as React tears down the old component tree and builds the new one. However, it also means only one screen is in memory at a time, which is good for RAM-constrained devices.
- **Battery impact:** NONE
- **Accessibility issue:** No screen-reader announcements on navigation. When the screen changes, a screen reader user (TalkBack on Android) gets no indication that content has changed. There are no `aria-live` regions, no `role="main"`, no focus management.
- **Fix:**
  1. Add `aria-live="polite"` to the main content area so screen readers announce content changes.
  2. After navigation, set focus to the first heading of the new screen.
  3. Add `role="navigation"` to the bottom nav bar.
  4. Add `aria-current="page"` to the active nav button.
  5. Add `aria-label` to all icon-only buttons (back, settings gear, send, delete).

**Severity: HIGH** (accessibility)

---

### ITEM: Emoji-Based Icons

Throughout the app, emojis are used as category icons (lines 52-64, 67-74, 77-85).

- **Offline capable:** YES -- Emojis are rendered by the OS, no network needed.
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MINOR -- Emoji rendering varies by device and Android version. On Android 10 (still common in SA), some emojis render as blank squares or tofu characters. The flag emoji (line 214, 221) is particularly unreliable across devices. Emoji rendering is also slower than SVG icon rendering on low-end devices because the OS must load the emoji font.
- **Battery impact:** NONE
- **Accessibility issue:** Screen readers read emoji descriptions, which can be confusing. "MONEY BAG" for commission, "OFFICE BUILDING" for salaried -- these are not intuitive. Also, some emojis are not announced at all on older TalkBack versions.
- **Fix:**
  1. Add `aria-hidden="true"` to all decorative emoji spans and provide text-based `aria-label` on the parent element.
  2. Consider providing a fallback text character for devices where emojis render as blank.
  3. Not a blocking issue, but worth tracking.

**Severity: LOW**

---

### ITEM: Input Type="number" for Financial Fields

**Lines 307, 381, 393, 665:** `type="number"` used for income, savings goal, budget limits, and expense amounts.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MINOR
- **Battery impact:** NONE
- **Accessibility issue:** HIGH --
  1. `type="number"` on Android Samsung keyboards often does not show a decimal point, making it impossible to enter R125.50.
  2. The number spinner (up/down arrows) on desktop and some tablets is nearly impossible to control for financial amounts.
  3. Some budget inputs are only 68px wide (line 394) -- entering R10000 (5 digits) is cramped on a 6.5" screen.
  4. No currency formatting feedback -- users type "25000" and must mentally parse whether that is R25,000 or R2,500.0.
  5. `Number(e.target.value)||0` coerces empty string to 0, which means backspacing to clear the field snaps it to 0 immediately -- frustrating UX.
- **Fix:**
  1. Use `type="text" inputMode="decimal"` for all financial inputs. This opens the correct keyboard on all devices while allowing full control over input formatting.
  2. Add live currency formatting: as the user types "25000", display "R 25,000" -- the `fmtR()` helper already exists.
  3. Increase budget input width to at least 80px.
  4. Allow empty state while editing -- only coerce to 0 on blur.

**Severity: HIGH**

---

### ITEM: localStorage Data Growth Over Time

**Lines 4-10:** All data stored in a single `t13_data_v2` key as JSON.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MAJOR (over time) -- If a user logs 3 expenses per week for a full tax year (52 weeks = 156 expenses), each expense object is roughly 150-200 bytes. Total: ~30KB. This is fine. But with merchant strings, category data, and JSON overhead, realistic data for an active user over 2 tax years could reach 100-200KB. This is still within localStorage limits (5MB typical) but:
  1. Every `saveData()` call serializes the ENTIRE dataset and writes it atomically. On a device with slow flash storage (common on budget phones), this causes a brief UI block.
  2. There is no data pruning, archival, or export strategy. After 3 tax years, the data blob grows indefinitely.
  3. If the user clears browser data (common on storage-constrained devices), everything is lost.
- **Battery impact:** LOW
- **Accessibility issue:** No data export or backup capability. Users cannot transfer their data if they change phones.
- **Fix:**
  1. Add data export (JSON download or shareable text summary) so users can back up before clearing storage.
  2. Consider archiving closed tax years to a separate localStorage key to keep the active dataset small.
  3. Add a `lastSaved` timestamp visible to the user so they know their data is persisting.
  4. Add a warning when localStorage usage exceeds 3MB.

**Severity: MEDIUM**

---

### ITEM: Color Contrast and Readability

**Lines 96-101, various inline styles.**

- **Offline capable:** N/A
- **Data cost:** N/A
- **Low-end device impact:** MINOR
- **Battery impact:** NONE (OLED screens use less power for dark themes -- this is actually a win)
- **Accessibility issue:** HIGH --
  1. `C.muted = "rgba(180,200,240,0.45)"` on `C.bg = "#07101D"` -- this is a contrast ratio of approximately 2.8:1, which FAILS WCAG AA (requires 4.5:1 for normal text). Muted text is used extensively for labels, descriptions, and secondary information throughout every screen.
  2. `C.faint = "rgba(180,200,240,0.18)"` -- contrast ratio of approximately 1.4:1 against the background. This is used for section headers like "RECENT", "BY CATEGORY", "MONTHLY LIMITS". Essentially invisible to users with low vision or on cheap LCD screens with poor viewing angles (common on Galaxy A15).
  3. The gold color `#F0B429` on the dark background `#07101D` has a contrast ratio of approximately 7.5:1 -- this is good.
  4. `C.green = "#10B981"` on dark background -- approximately 5.2:1 -- passes AA.
  5. Red `#EF4444` on dark -- approximately 4.2:1 -- borderline, fails AA for small text.
  6. On cheap LCD displays with poor gamma, the dark navy background appears almost black, further reducing contrast for muted/faint elements.
- **Fix:**
  1. Increase `C.muted` opacity from 0.45 to at least 0.65: `"rgba(180,200,240,0.65)"` to achieve 4.5:1 contrast.
  2. Increase `C.faint` opacity from 0.18 to at least 0.40: `"rgba(180,200,240,0.40)"` -- or use `C.muted` for all text that needs to be read.
  3. Never use `C.faint` for text that conveys meaning. Reserve it only for decorative borders.
  4. Test on an actual Galaxy A15 or similar LCD display -- OLED screens are forgiving, LCDs are not.

**Severity: HIGH**

---

### ITEM: Select Element Styling

**Line 129:** `select.inp { -webkit-appearance: none }` with no custom dropdown arrow.

- **Offline capable:** YES
- **Data cost:** NEGLIGIBLE
- **Low-end device impact:** MINOR
- **Battery impact:** NONE
- **Accessibility issue:** MEDIUM -- Removing the default appearance of the select element without adding a custom dropdown indicator means users may not realize the field is tappable. The category selectors on the Add Expense screen (lines 674, 681) look identical to disabled text inputs. On Android WebViews (especially Huawei devices without Google services), custom-styled selects can behave unpredictably.
- **Fix:**
  1. Add a visible dropdown arrow (CSS `::after` pseudo-element or an inline SVG chevron).
  2. Add a visual affordance (subtle border change, different background) to distinguish selects from text inputs.
  3. Test on Huawei AppGallery WebView if targeting that market.

**Severity: MEDIUM**

---

### ITEM: Inline Styles vs CSS Classes

Nearly every element uses inline `style={{}}` objects.

- **Offline capable:** N/A
- **Data cost:** MEDIUM -- The JSX file is roughly 30KB+ of source code, a significant portion of which is inline style objects. Every render cycle, React creates new JavaScript objects for every inline style. This means:
  1. The JavaScript bundle is larger than necessary.
  2. React cannot optimize style diffing as efficiently as class-based styles.
  3. The browser cannot cache style computations across elements.
- **Low-end device impact:** MEDIUM -- On a 3GB RAM Galaxy A15, the garbage collector must clean up thousands of style objects on every re-render. This causes micro-stutters, especially during animations or rapid navigation.
- **Battery impact:** LOW
- **Accessibility issue:** None directly.
- **Fix:**
  1. Not a priority for prototype, but for production: migrate frequently-used style patterns to CSS classes in the `<style>` block.
  2. Memoize style objects that do not change between renders using `useMemo` or move them outside the component.
  3. This is an optimization item, not a blocker.

**Severity: MEDIUM**

---

### ITEM: The monthKey Function Scope Bug

**Line 459:** `const monthKey=(d)=>d.slice(0,7);` defined INSIDE `S_Home` render but USED on line 453: `const thisM=expenses.filter(e=>monthKey(e.date)===thisMonthStr());`

- **Offline capable:** N/A
- **Data cost:** N/A
- **Low-end device impact:** BREAKING -- The `monthKey` function is called on line 453 but defined on line 459. In JavaScript, `const` declarations are NOT hoisted. This will throw a `ReferenceError: Cannot access 'monthKey' before initialization` every time the Home screen renders. The Home screen will crash.
- **Battery impact:** N/A
- **Accessibility issue:** The Home screen is broken. The user sees a white screen or error after completing onboarding.
- **Fix:** Move `const monthKey=(d)=>d.slice(0,7);` ABOVE line 453, or better yet, move it to the top-level utility functions near `thisMonthStr()`.

**Severity: CRITICAL**

---

## Summary Table

| Item | Severity | Offline | Data Cost | Device Impact | Battery |
|------|----------|---------|-----------|---------------|---------|
| Google Fonts @import | CRITICAL | NO | HIGH | MAJOR | LOW |
| Tjommie API calls | HIGH | NO | HIGH | MINOR | MEDIUM |
| Expense logging (localStorage) | LOW | YES | NEGLIGIBLE | MINOR | NONE |
| AnimNum animations | HIGH | YES | NEGLIGIBLE | MAJOR | MEDIUM |
| S_Promise counter | LOW | YES | NEGLIGIBLE | MINOR | LOW |
| Touch targets | CRITICAL | N/A | N/A | MINOR | NONE |
| Error states | CRITICAL | PARTIAL | N/A | MAJOR | NONE |
| backdrop-filter blur | HIGH | YES | NEGLIGIBLE | MAJOR | HIGH |
| Navigation/Accessibility | HIGH | YES | NEGLIGIBLE | MINOR | NONE |
| Emoji icons | LOW | YES | NEGLIGIBLE | MINOR | NONE |
| type="number" inputs | HIGH | YES | NEGLIGIBLE | MINOR | NONE |
| localStorage growth | MEDIUM | YES | NEGLIGIBLE | MAJOR (long-term) | LOW |
| Color contrast | HIGH | N/A | N/A | MINOR | NONE |
| Select styling | MEDIUM | YES | NEGLIGIBLE | MINOR | NONE |
| Inline styles perf | MEDIUM | N/A | MEDIUM | MEDIUM | LOW |
| monthKey scope bug | CRITICAL | N/A | N/A | BREAKING | N/A |

---

## MUST-WORK-OFFLINE

Ranked by importance:

1. **Expense logging** -- The primary action. Users MUST be able to add work expenses and personal expenses without any network connection. Currently: YES, works offline via localStorage.
2. **All setup/onboarding screens** -- Currently: YES, fully offline (no API calls during setup). Must stay this way.
3. **Home screen / Dashboard** -- Currently: YES (except for the monthKey bug which crashes it). All calculations are local.
4. **13th Cheque screen** -- Currently: YES, all calculations local.
5. **Spending / Budget screen** -- Currently: YES, all calculations local.
6. **Expense history** -- Currently: YES, reads from localStorage.
7. **Settings** -- Currently: YES.
8. **Tjommie chat** -- Currently: NO. This is acceptable because chat is supplementary, NOT core. However, the app must clearly communicate when Tjommie is unavailable and still allow the user to do everything else. Pre-computed answers for common questions would be a major win.

---

## DATA REDUCTION WINS

The three changes that would most reduce data consumption:

1. **Self-host or inline-embed the fonts.** Eliminating the Google Fonts external request saves 80-150KB on first load and removes the blocking network dependency. For repeat visits with cache, this is less impactful, but cache-clearing is common on storage-limited SA devices. **Estimated savings: 80-150KB per fresh load.**

2. **Pre-compute Tjommie answers for the 4 quick questions.** The quick question buttons ("How do I claim more?", "Am I on track?", etc.) can be answered with template strings using the user's actual data -- no API call needed. The user still gets personalised, specific answers. Only free-text questions need the API. **Estimated savings: 15-20KB per session (4 API calls eliminated).**

3. **Add offline detection and prevent unnecessary failed API calls.** When offline, every failed Tjommie API call still sends the full request payload (~1.2KB system prompt + conversation history) over the cellular radio before receiving a network error. This is pure waste. Checking `navigator.onLine` before calling prevents this. **Estimated savings: 1-5KB per offline session, plus battery savings from avoiding radio activation.**

---

## LOAD SHEDDING SURVIVAL PLAN

What the app should do when connectivity drops mid-session:

### Current Behaviour (POOR)
- No detection of connectivity loss
- Tjommie chat fails with "Connection problem -- try again in a sec" after an indeterminate timeout
- No indication to the user that they are offline
- Core features (expense logging, calculations, budgets) continue to work silently -- but the user does not know this

### Required Behaviour (TARGET)
1. **Detect connectivity loss** using `navigator.onLine` and `window.addEventListener('offline'/'online')`.
2. **Show a small, non-blocking banner** at the top of the screen: "You're offline. Expenses still save to your phone." This should be warm and reassuring, not alarming.
3. **Disable Tjommie chat input** with a message: "Tjommie needs signal to chat. Log your expenses -- he'll catch up later."
4. **When connectivity returns**, show: "You're back online!" and dismiss after 3 seconds.
5. **All localStorage writes already work offline.** No changes needed for core data persistence.
6. **Add a fetch timeout of 8 seconds** for the Tjommie API call. During load shedding, cellular networks degrade before dropping entirely. A 30-second hanging request is worse than a quick failure.
7. **Cache the last successful Tjommie conversation** in localStorage so the user can reference previous advice offline.

### Load Shedding Battery Protocol
During load shedding, phone battery is critical. The app should:
- Remove `backdrop-filter: blur()` to reduce GPU usage
- Disable or reduce animations (check battery level via Battery API if available)
- Never make speculative or background network calls

---

## DEVICE FLOOR

### Minimum Device Specification
The app should support:
- **Processor:** Mediatek Helio G35 or equivalent (Samsung Galaxy A15 baseline)
- **RAM:** 3GB (with browser/WebView consuming ~500MB, leaving ~300-500MB for the page)
- **Storage:** 500MB free space (app + data should stay under 5MB total)
- **Screen:** 720x1600px, 6.5" LCD
- **Android:** Android 10+ (API 29+)
- **Browser:** Chrome 90+, Samsung Internet 15+, Huawei Browser (no Google services)
- **Network:** 2G EDGE minimum for Tjommie, fully offline for all other features

### Does the App Currently Support This Floor?

**PARTIALLY.** The app will function on a Galaxy A15 with these caveats:

| Requirement | Status | Issue |
|-------------|--------|-------|
| Renders on 3GB RAM | PASS (with jank) | backdrop-filter and concurrent animations cause stuttering |
| Works on Android 10 | PASS | No modern API dependencies |
| Works offline (core) | PASS | localStorage is sufficient |
| Works on 720p screen | PASS | 390px phone frame fits within 720px |
| Works on Huawei (no GMS) | PROBABLY PASS | No Google service dependencies; emoji rendering may vary |
| Works on slow 2G | FAIL | Google Fonts @import blocks rendering; no timeout on Tjommie API |
| Works on Samsung Internet | PASS | Standard CSS/JS, no bleeding-edge APIs |
| Touch targets usable | FAIL | Multiple targets below 44x44px |
| Readable on cheap LCD | FAIL | Muted/faint text below WCAG contrast minimums |
| Home screen renders | FAIL | monthKey scope bug crashes it |

### Verdict
The app is **not yet ready** for the South African device floor. Four issues must be fixed before it can be considered viable:
1. Fix the monthKey bug (CRITICAL -- app crash)
2. Fix touch target sizes (CRITICAL -- unusable for many users)
3. Fix font loading strategy (CRITICAL -- blocks rendering on slow networks)
4. Fix color contrast (HIGH -- unreadable on cheap LCDs)

---

## Issue Count Summary

- **CRITICAL:** 4 (Google Fonts blocking, touch targets, error states, monthKey bug)
- **HIGH:** 6 (Tjommie API efficiency, AnimNum performance, backdrop-filter, navigation accessibility, type="number" inputs, color contrast)
- **MEDIUM:** 4 (localStorage growth, select styling, inline styles performance, select styling)
- **LOW:** 3 (expense logging optimization, S_Promise animation, emoji icons)
