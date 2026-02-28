# SADIYA Collection

## Current State
- Full-stack e-commerce app (Motoko backend + React frontend)
- Customer auth via email/password stored in localStorage (insecure: hardcoded admin credentials in AuthContext.tsx and displayed on AdminLayout login screen)
- Products, orders, cart, reviews, offers, shipping tracking, payment gateways (Stripe + manual), site settings all functional
- Admin panel with sidebar navigation: Dashboard, Products, Orders, Customers, Offers, Reviews, Market Trends, Settings
- Theme system: 10 themes, auto-cycle every 20s, manual selection disables auto
- No Terms & Conditions, Privacy Policy, or Return Policy pages
- No order cancellation or return request features
- No shipping partner management in admin
- Admin credentials `admin@sadiyacollection.com` / `Admin@2024#Sadiya` are DISPLAYED in plain text on the login screen and hardcoded in AuthContext.tsx

## Requested Changes (Diff)

### Add
- `TermsPage.tsx` — full Terms & Conditions page
- `PrivacyPage.tsx` — full Privacy Policy page
- `ReturnPolicyPage.tsx` — Return Policy page clearly stating 24-hour return window
- Order cancellation: customer can cancel an order while status is still "pending" or "processing" (before shipping)
- Return request: customer can request a return within 24 hours of delivery (status = "delivered"); shows remaining time window
- `cancelOrder` backend function — lets the order owner cancel their own pending/processing order
- `requestReturn` backend function — lets the order owner submit a return request within 24 hours of delivery
- `AdminShipping.tsx` — new admin page to manage shipping partner integrations (add/edit/delete carriers with name, tracking URL template, API key, logo, active status)
- `ShippingPartner` type in backend — stores name, trackingUrlTemplate, apiKey, isActive
- Add/update/delete shipping partner functions in backend
- Footer links to Terms, Privacy, Return Policy pages
- Rate-limiting logic (frontend-level login attempt tracker: max 5 attempts, 15-min lockout) for brute-force protection

### Modify
- `AuthContext.tsx` — remove hardcoded `ADMIN_PASSWORD` constant; admin auth becomes credential-less (admin is identified by Internet Identity / backend role check, NOT a hardcoded password). The admin login screen authenticates via the backend `isCallerAdmin()` check using the Internet Identity actor. Fallback: keep a local admin check but remove the password from being visible anywhere.
- `AdminLayout.tsx` — remove the credentials info box that displays email and password in plain text. Login form keeps email/password fields but never shows credentials.
- `OrdersPage.tsx` — add Cancel button for pending/processing orders; add Return Request button for delivered orders within 24-hour window with countdown timer
- `AdminLayout.tsx` NAV_ITEMS — add "Shipping Partners" link
- `App.tsx` — register new routes: `/terms`, `/privacy`, `/returns`, `/admin/shipping`
- `Footer.tsx` — add links to Terms, Privacy Policy, Return Policy in a new "Legal" column
- `AdminSettings.tsx` — add "Change Admin Password" section that lets admin update their stored password securely (hashed); remove any hardcoded credential references
- `ThemeContext.tsx` — confirm auto-cycle is 20s (already done), confirm manual selection stops auto (already done); add visual indicator in header showing auto mode is on

### Remove
- Hardcoded `ADMIN_PASSWORD = "Admin@2024#Sadiya"` constant from `AuthContext.tsx`
- Credentials info box from `AdminLayout.tsx` (the blue box showing email and password)
- Any plain-text credential display anywhere in the codebase

## Implementation Plan
1. Update `AuthContext.tsx`: Remove hardcoded password constant. Store admin credentials in a secure way — use a hashed credential in localStorage that admin can change from Settings. On first load, if no admin credential exists, set a default hash but never display the password. Add login attempt rate limiting (5 attempts, 15-min lockout).
2. Update `AdminLayout.tsx`: Remove the credentials info box entirely. Keep login form clean.
3. Update `main.mo`: Add `cancelOrder` function (validates caller owns order and status is pending/processing), `requestReturn` function (validates caller owns order, status is delivered, and within 24 hours), `ShippingPartner` type with CRUD functions.
4. Update `backend.d.ts` to reflect new backend functions and types.
5. Update `useQueries.ts`: Add `useCancelOrder`, `useRequestReturn`, `useShippingPartners` hooks.
6. Create `TermsPage.tsx`, `PrivacyPage.tsx`, `ReturnPolicyPage.tsx` with proper content.
7. Create `AdminShipping.tsx` for shipping partner management.
8. Update `OrdersPage.tsx`: Add cancel and return request buttons with eligibility checks.
9. Update `Footer.tsx`: Add Legal links column.
10. Update `App.tsx`: Register all new routes.
11. Update `AdminSettings.tsx`: Add password change section.
