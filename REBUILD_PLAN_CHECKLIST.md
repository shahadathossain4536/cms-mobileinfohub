## DeviceInfoHub Admin (mobile_project_backend) — Redesign & Hardening Checklist

This is the end‑to‑end plan to modernize the CMS admin into a professional, resilient app with consistent design, strong UX for loading/error/empty states, and production‑ready practices. We will work through these phases top‑down and check off items as we complete them.

### Phase 0 — Baseline Audit (read‑only)
- [ ] Map all routes in `src/App.js` and the nested `dashboard` routes
- [ ] Inventory all API calls (direct axios vs `react-query`)
- [ ] Note auth flow and token usage in `src/component/HOC/PrivateRoute.js` and `src/helpers/axios.js`
- [ ] Identify pages with forms (`AddDevices`, `AddBrandName`, `Advertisement`) and validation gaps
- [ ] List components suitable for reuse (Navbar, ConfirmationModal, StepFormSection, CustomModal)

### Phase 1 — Design System & Theming
- [x] Configure Tailwind for dark mode (class strategy) and project paths in `tailwind.config.js`
- [x] Add global theme tokens (colors, radii) via Tailwind `extend` (typography pending if needed)
- [x] Add base styles in `src/index.css` (CSS variables if needed)
- [ ] Create reusable UI primitives under `src/component/ui/`:
  - [x] `Button` (variants, sizes, loading state)
  - [x] `Input` + `Select` wrappers (with error text)
  - [x] `Card` / `Panel`
  - [x] `Table` (header, row, empty state)
  - [x] `Modal` (accessible, focus trap) and reuse in Confirmation flows
  - [x] `Badge` / `Tag`
- [ ] Apply responsive + dark mode styles site‑wide (respect user preference)  

### Phase 2 — Data & API Layer
- [ ] Standardize API access via `src/helpers/axios.js`
  - [x] Fix request interceptor to use the latest token (do not capture stale token at module load)
  - [x] Handle 401/403 → soft logout + redirect; 500 → toast + optional report
  - [x] Move API base URL and keys to `.env` (`REACT_APP_API_URL`, `REACT_APP_IMGBB_KEY`)
- [ ] Wrap all reads with `react-query` (`QueryClient` already present)
  - [x] Define query keys and helpers in `src/helpers/queries/`
  - [x] Set sensible `staleTime`, `retry`, and `onError` (toast) defaults
- [ ] Use mutations for create/update/delete with optimistic updates and invalidation
- [ ] Replace ad‑hoc `axios` imports in pages with the shared instance + queries/mutations

### Phase 3 — Global UX States
- [x] Add global `LoadingOverlay` and `PageLoader` components
- [x] Add `ErrorState` and `EmptyState` components with actions (retry, back, create)
- [x] Introduce a top‑level `ErrorBoundary` around routes
- [ ] Standardize toasts (success/error) with consistent copy
- [x] Add skeleton UIs for list pages and form sections

### Phase 4 — Layout & Navigation
- [ ] Create `AppLayout` with `Navbar` and responsive sidebar
- [x] Highlight active route and ensure keyboard navigation
- [x] Add profile menu with logout
- [x] Add `NotFound` 404 page and guarded redirects

### Phase 5 — Auth Hardening
- [x] Centralize auth state in Redux or React Query + localStorage
- [x] On unauthenticated access, redirect to `/login` with `from` state
- [ ] Add token expiry handling and silent revalidation (if backend supports)
- [ ] Ensure protected mutations always send `Authorization` header

### Phase 6 — Forms & Validation
- [ ] Standardize forms on `react-hook-form`
- [ ] Show field‑level errors and helper text
- [ ] Replace inline rules with schema (e.g., zod/yup) where complex
- [ ] Submit buttons show loading; disable during submit
- [ ] Success flows: toast + navigate; error flows: inline + toast
- [ ] Image uploads: progress, success, and delete flows with clear feedback
- [ ] Move API keys (ImgBB) out of source code → `.env`

### Phase 7 — Page Refactors (Incremental)
- [ ] `DashboardHome`: real metrics (counts, latest items) + skeletons
- [ ] `AllDeviceList`:
  - [ ] Use `react-query` for fetching
  - [ ] Add table UI with sorting, pagination, and selection
  - [ ] Add skeletons, `EmptyState`, and error handling
  - [ ] Delete uses mutation with confirmation modal; optimistic update
- [ ] `AllBrandList`:
  - [x] Keep `react-query`; add error/empty states (skeletons pending)
  - [x] Secure deletions with auth header and mutation
- [ ] `AddDevices`:
  - [ ] Split into smaller sub‑forms per step component
  - [ ] Extract upload logic; move API key to env; add progress
  - [ ] Strong validation and user guidance; prevent accidental navigation loss
  - [ ] On submit → mutation + success redirect
- [ ] `UpdateDevice`:
  - [ ] Preload device; show skeleton; reuse form components
- [ ] `AddBrandName` & `Advertisement`:
  - [ ] Consistent forms and mutations; list + delete flows

### Phase 8 — Accessibility & Quality
- [ ] Ensure color contrast meets WCAG AA
- [ ] Keyboard access for all controls (modals, menus, tables)
- [ ] ARIA labels/roles for interactive components
- [ ] Add basic unit tests for helpers and components

### Phase 9 — Performance & DX
- [ ] Audit bundle (CRA) and split code on routes
- [ ] Cache images; use responsive images where possible
- [ ] Add `.env` documentation and sample `.env.example`
- [ ] Add ESLint/Prettier configs (align with CRA)

### Phase 10 — Deployment Readiness
- [ ] Production build check, env injection, and runtime config
- [ ] Smoke test all critical paths
- [ ] Update README with runbook and screenshots

---

## Immediate Fixes (High Impact, Low Risk)
- [x] `src/helpers/axios.js`: use fresh token from store/localStorage inside interceptor, not captured constant
- [ ] Replace direct `axios.get(...)` in list pages with `react-query` and show skeleton + error states
- [ ] Extract `ConfirmationModal` as a shared component (`src/component/ui/Modal`)
- [x] Move ImgBB API key from `AddDevices.js` to `.env` and reference `process.env.REACT_APP_IMGBB_KEY`
- [x] Add 404 route and fallback UI in `src/App.js`

## Deliverables per Page
- [ ] Each page has: skeletons, error state, empty state, responsive layout, dark mode, and toasts
- [ ] All mutations: confirmation where destructive, optimistic update, and revert on error
- [ ] All forms: disabled submit during network, inline errors, and success navigation

## Notes
- We will default to dark mode support and responsive layouts everywhere to match product preference.
- All changes will be incremental and tracked against the checklist above.


