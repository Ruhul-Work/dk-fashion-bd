# Plan: Adopt DK Portfolio UI in Smart Garments

**Status:** Draft for review. No code changes yet. Awaiting approval before implementation.

**Prepared:** 2026-06 (based on `shamsuddinRakib` branch working tree).

---

## 1. Goal

Bring the visual language of `dk-my-protfolio3` (ivory/sand/sage/caramel/moss palette, Fraunces + Outfit, paper grain, scroll progress, hide-on-scroll navbar, preloader, custom cursor, smooth scroll, motion reveals) into the Smart Garments e-commerce app **without changing its working business logic, data, or API**.

Rule of the engagement:
- **Preserve**: routes, auth, cart, checkout, orders, profile, website settings, all API calls in `src/services/api.ts`, all contexts.
- **Replace/Add**: presentation layer — tokens, global CSS, layout chrome (Navbar/Footer), page shells, card styling, motion, overlays.
- **Adapt**: portfolio components that assume a different product model must be rewritten to read Smart Garments types and routes.

---

## 2. Project comparison

| Axis | Smart Garments (target) | DK Portfolio (source of UI) |
|---|---|---|
| Stack | Vite 6, React 19, TS 5.8 | Vite 8, React 19.2, TS 6 |
| Styling | Tailwind v4 (`@theme` in `src/index.css`) | Tailwind v4 (`@theme` with named tokens) |
| Motion | `motion` (was framer-motion shim) | `framer-motion` |
| Scroll | native | `lenis` + SmoothScroll |
| Routing | `react-router-dom` v7 (auth/cart guarded) | `react-router-dom` v7 |
| State | Auth/Cart/Website contexts | hooks (useProducts etc.) |
| API | `src/services/api.ts` (+ localStorage base URL) | `src/lib/api.ts` + pricing/product helpers |
| Domain | Full e-commerce (cart, checkout, orders, profile) | Showcase/catalog + about/contact |
| Pages | Home, Shop, Categories, ProductDetail, Cart, Checkout, Profile, OrderDetail, Login, Signup, TrackOrder, Offers, OfferDetails | Home (sections), Shop, ProductDetail, About, Contact |

Conclusion: the portfolio is a **design reference**, not a drop-in. We port its *visual system* and selected components, and re-skin Smart Garments' existing pages. We do **not** import its data layer.

---

## 3. Design system to adopt (from portfolio)

Source of truth: `dk-my-protfolio3/src/index.css` (`@theme`) + `src/App.css` (paper-grain).

### 3.1 Tokens (add to Smart Garments `src/index.css`)
- Colors: `ivory #faf7f2`, `sand #f1ede4`, `sage #e7ede6`, `caramel #b98a6e`, `caramel-deep #a1735a`, `eucalyptus #9db0a1`, `eucalyptus-deep #7d937f`, `moss #27302a`, `olive #6e7268`, `hairline #e3ddd1`.
- Fonts: `--font-display: "Fraunces"` (serif), `--font-body: "Outfit"`.
- Shadows: `--shadow-soft`, `--shadow-lift`.
- Animations: `marquee`, `marquee-slow`.
- Utility classes: `.font-display`, `.paper-grain` (with `::before` noise overlay), `.text-outline`, `.img-fallback`, `.rich-text`.

### 3.2 Assets/fonts
- Update `index.html` to preconnect Google Fonts and load Fraunces + Outfit (as in portfolio).
- Keep Smart Garments title; update meta description optionally.
- Provide `dk.png`-style logo or keep existing logo but mix-blend treatment.

### 3.3 Global chrome (from `Chrome.tsx`)
- `ScrollProgress` (3px caramel bar, fixed top).
- `Navbar` (transparent over hero, hide on scroll down, show on scroll up, announcement-aware offset, mobile menu).
- `SectionRail` (optional, only where sections exist).
- `AnnouncementBar` ("Shop our pieces on Shopee"/store promo).

### 3.4 Motion & scroll
- `SmoothScroll` (lenis) wrapper around app.
- `Cursor` custom cursor (desktop only).
- `Preloader` with session-storage "seen" flag.
- `MotionConfig reducedMotion="user"`.
- `AnimatePresence` for route transitions (must keep all existing routes).

---

## 4. Dependencies to add (smart-garments)

- `framer-motion` ^14 (or align import paths; portfolio imports `framer-motion`).
- `lenis` ^1.3 (smooth scroll).
- Tailwind/fonts are already v4 — no change.
- Keep existing deps (`motion`, `react-hot-toast`, etc.) to avoid breaking; deprecate `motion` imports gradually.

Optional:
- Upgrade `vite`/`ts` to match portfolio? **Not required** for UI. Recommend staying on current to reduce risk. Plan assumes no toolchain upgrade.

---

## 5. File-level plan

### 5.1 Add new files (ported/adapted from portfolio)
- `src/styles/tokens.css`? Prefer keeping in `src/index.css` (append `@theme` extension + utilities) to match SG convention.
- `src/components/Chrome.tsx` — ScrollProgress, Navbar, AnnouncementBar, SectionRail (adapted: links point to SG routes Home/Shop/Categories/Offers; logo uses WebsiteContext logo or `/smart-garments.png`; "About/Contact" links -> maybe `/profile`/`/track-order` or keep minimal).
- `src/components/SmoothScroll.tsx` (lenis wrapper).
- `src/components/Cursor.tsx`.
- `src/components/Preloader.tsx`.
- `src/components/motion-kit.tsx` (CurtainImage etc.).
- `src/components/Price.tsx` (format using SG currency; reuse existing money helper if any — adapt).
- `src/components/SoftImage.tsx`, `Skeletons.tsx`, `EmptyState.tsx` (optional).
- `src/components/SearchModal.tsx` — **must** use SG `AuthContext`? No; reuse `services/api.ts` product search instead of portfolio `useProducts` hook. Rewrite search to call existing SG API.

### 5.2 Modify existing files
- `src/main.tsx`: wrap with BrowserRouter (already via App? SG wraps Router in App; portfolio wraps in main). Decide: keep SG's Router in App, but add MotionConfig + SmoothScroll in App to minimize risk. SmoothScroll needs router context? Check. Plan: add `<MotionConfig>` in `App` around content, and wrap children in `<SmoothScroll>` inside Router.
- `src/index.css`: merge token block + paper-grain + rich-text + scrollbar styles after existing `@theme`. Keep SG brand tokens? We can replace primary tokens but keep backward-compat aliases (`--color-brand-bg: var(--color-ivory)` etc.) to avoid breaking components referencing old tokens during transition. Recommendation: add aliases, remove in final pass.
- `src/App.tsx`: add Preloader state, Cursor, AnnouncementBar, SmoothScroll, PageChrome pattern (Navbar + ScrollProgress + AnimatePresence Routes + Footer). Keep providers order. Keep all routes.
- `src/components/Navbar.tsx`: either replace with new Chrome Navbar or re-skin. Recommendation: replace file content with adapted portfolio Navbar (new). Old SG Navbar deleted.
- `src/components/Footer.tsx`: re-skin to portfolio footer (dark moss bar, caramel accents) using WebsiteContext data (company name, socials, phone, email, address).
- `src/components/ProductCard.tsx`: re-skin to portfolio ProductCard styling but using SG Product type and `SERVER_URL`-prefixed images; prices via SG fields (price/mrp/offer_price). Keep click route `/product/:id` (not slug? SG uses `:id`); adapter decides. SG Product has `slug` too — use `slug` if present else `id`.
- Other cards: `CategoryCard`, `OfferCard` — re-skin.
- Pages: `Home`, `Shop`, `Categories`, `ProductDetail`, `Cart`, `Checkout`, `Offers`, `OfferDetails`, `Profile`, `OrderDetail`, `TrackOrder`, `Login`, `Signup`: re-skin markup/classes to new tokens; preserve all data fetching and handlers.
- `src/services/api.ts`: **untouched** except maybe exports of helpers (none needed).

### 5.3 Delete / deprecate
- Old `src/components/Navbar.tsx` after replacement (content replaced in place).
- Possibly `motion` dependency once imports migrated (keep for now).

---

## 6. Data/API adaptation rules (critical)

1. **Never change `src/services/api.ts` signatures.**
2. Image base: portfolio uses relative `/...`; SG uses `SERVER_URL` prefix + `thumbnail_image`. In adapted components, compute `src = product.thumbnail_image?.startsWith('http') ? ... : SERVER_URL + ...`.
3. Product routing: portfolio uses `/product/${slug}`; SG's `ProductDetail` reads route param `:id` (see App route `/product/:id`). Decision options:
   - A) keep SG route param `:id` and links use id. Simpler, no page changes.
   - B) move to slug. Larger. **Recommend A** for safety; revisit later.
4. Search: rewrite portfolio `SearchModal` to call existing SG search endpoint (reuse current SG SearchModal logic/api) but apply new markup.
5. Currency: portfolio `Price`/`money` assume its pricing fields; adapt to SG `price`/`mrp`/`offer_price`.
6. Website settings: Footer/Navbar should pull from `WebsiteContext` (already exists in SG) instead of hardcoded strings where possible, falling back to portfolio's defaults.

---

## 7. Phased implementation (with gates)

### Phase 0 — Safety (prerequisite)
- Create feature branch `feat/portfolio-ui` from current branch.
- Ensure clean build (`npm run lint`, `npm run build`? SG has no build script test; run `tsc --noEmit`).
- Snapshot screenshots of current SG pages (manual) for regression reference.

### Phase 1 — Design system foundation (low risk)
- Add fonts to `index.html`.
- Merge tokens + grain + rich-text into `src/index.css` with backward-compat aliases.
- Add dependencies (framer-motion, lenis) to package.json, `npm install`.
- Update `src/main.tsx`/`App.tsx` skeleton: Preloader state, Cursor, MotionConfig, SmoothScroll, ScrollProgress. Do not change routes yet.
- **Gate:** app still runs, all routes reachable, no TS errors.

### Phase 2 — Chrome (Navbar/Footer) (medium risk)
- Implement new Navbar (portfolio style) wired to SG routes + WebsiteContext.
- Implement new Footer.
- AnnouncementBar.
- **Gate:** navigation works on all routes; mobile menu; auth/cart links intact.

### Phase 3 — Home page re-skin (medium risk)
- Rebuild Home using portfolio section primitives but driven by SG featured/new/offer products (reuse existing Home data calls).
- **Gate:** featured products load; links work; no console errors.

### Phase 4 — Catalog pages (Shop, Categories, Offers, ProductDetail) (medium-high)
- Re-skin grids/cards; image base; price adapters.
- ProductDetail gallery + variants preserved from SG.
- **Gate:** add to cart, variant selection, image magnifier still work.

### Phase 5 — Commerce pages (Cart, Checkout, OrderDetail, TrackOrder, Profile) (high)
- Re-skin forms/layout; keep all submission logic.
- **Gate:** place order end-to-end against API; profile updates; order tracking.

### Phase 6 — Auth pages (Login, Signup) (medium)
- Re-skin.

### Phase 7 — Search overlay & polish (medium)
- Port SearchModal with SG data.
- Empty states, skeletons, toast styling (optional).
- **Gate:** search returns SG products; keyboard nav works.

### Phase 8 — Cleanup
- Remove alias tokens; remove unused old components; remove `motion`/`react-hot-toast` if no longer used.
- Run `tsc --noEmit`, manual smoke test all routes, check mobile.

---

## 8. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Breaking API/data flow by touching pages | High | Keep service layer untouched; changes limited to JSX/classes; code review each phase. |
| Product model mismatch (slug vs id, image URL) | Medium-High | Adapter rules §6; use id routing. |
| framer-motion + React 19 / StrictMode double-mount | Medium | Test early in Phase 1; fall back to existing `motion` package. |
| lenis interfering with modals/scroll lock | Medium | Stop/start lenis in modal open/close (portfolio pattern). |
| Tailwind token name collisions | Low | Aliases first, cleanup last. |
| Mobile regression | Medium | Manual smoke on phone widths each phase. |
| Loss of business features (cart badge, user menu) | High | Checklist §9; ensure Navbar exposes cart count, auth state, profile. |

---

## 9. Functional checklist that must remain green

- [ ] Home loads featured/new/offer products from API.
- [ ] Shop filtering/pagination works.
- [ ] Categories page loads categories.
- [ ] Product detail: images, variants/sizes/colors, add to cart, price display.
- [ ] Cart: quantity changes, remove, totals.
- [ ] Checkout: shipping charge, free shipping threshold from WebsiteContext, order submission.
- [ ] Auth: login/signup/logout, protected routes.
- [ ] Profile: edit user, view orders.
- [ ] OrderDetail + TrackOrder.
- [ ] Offers list & details.
- [ ] Navbar: cart badge count, auth menu, search.
- [ ] Footer: contact/social from WebsiteContext.
- [ ] No hard-coded API URL changes.

---

## 10. Effort estimate

- Phase 1: 0.5–1 day
- Phase 2: 1–2 days
- Phase 3: 1–2 days
- Phase 4: 2–3 days
- Phase 5: 2–3 days
- Phase 6: 0.5–1 day
- Phase 7–8: 1–2 days
- **Total: ~8–14 working days** for one developer, depending on fidelity.

This is a skin, not a rewrite; but the home + catalog + product detail pages carry most of the visual complexity.

---

## 11. Open decisions (need your input)

1. **Logo/brand name**: keep "Smart Garments" or switch display to portfolio's "DK Fashion"? Recommend keep Smart Garments, but adopt typography.
2. **Routing param**: keep `/product/:id` (recommended) vs migrate to slug. Recommend keep id.
3. **Smooth scroll (lenis)**: enable site-wide? It can affect form UX. Recommend yes but disable on cart/checkout if issues.
4. **Custom cursor**: portfolio has custom cursor. On e-commerce, can obscure clickable targets. Recommend desktop-only and disable on cart/checkout.
5. **Scope of sections on Home**: portfolio Home has many editorial sections (Making, Lookbook, FAQ). Do we port all, or a trimmed set driven by SG data? Recommend trimmed: Hero + Categories + Featured Products + New Arrivals + Popular + Contact strip + Footer.
6. **Offers**: SG has an Offers system; portfolio doesn't. Keep SG offers pages, just re-skin.

---

## 12. Approval

Please review and reply with:
- "Approved" to start Phase 0–1, or
- Changes to scope/decisions above.

I will **not** modify code until approval. After approval, I'll implement phase by phase with a gate check after each phase and report results.