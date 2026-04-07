# SubSnap — Frontend (Technical Reference)

Next.js 15 · React 19 · TypeScript 5 · Tailwind CSS 4 · next-intl 4 · pnpm

---

## Stack

| | |
|---|---|
| Framework | Next.js 15.1.6 — App Router, Server Actions, Middleware (edge) |
| UI | React 19.2.3 — Server + Client Components |
| Language | TypeScript 5 — `strict: true`, path alias `@/*` → `./src/*` |
| Styling | Tailwind CSS 4 (`@tailwindcss/postcss`), oklch color tokens, `.dark` class strategy |
| i18n | next-intl 4.8.3 — `as-needed` prefix, EN (no prefix) / IT (`/it/`) |
| Forms | react-hook-form 7.71.2 + Zod 4.3.6 resolver |
| Charts | Recharts 3.8.1 — Area, Pie, Bar |
| Animations | Motion 12.38.0 (Framer) |
| Cookies (client) | js-cookie 3.0.5 |
| Error monitoring | Sentry 10.46.0 — server + edge + client |
| Package manager | pnpm |

---

## Architecture

```
Browser
  → Middleware (edge): locale detection + auth gate
  → [locale]/layout: NextIntlClientProvider + AuthContext
  → Page (Server Component): fetches data via Server Actions
  → Client Components: interactivity, forms, charts
        ↕
  Server Actions ("use server"): read httpOnly cookies, call backend
        ↕
  ASP.NET Core API (NEXT_PUBLIC_API_URL)
```

Data mutations: Client → Server Action → `fetchWithAuth` → API → `router.refresh()` to revalidate server state.

---

## Routing

```
src/app/
├── layout.tsx                    # Root — fonts (Inter, JetBrains Mono), metadata, dark class
├── sitemap.ts                    # /sitemap.xml (6 URLs, hreflang EN+IT)
├── robots.ts                     # /robots.txt
└── [locale]/
    ├── layout.tsx                # NextIntlClientProvider
    ├── page.tsx                  # Landing
    ├── (auth)/                   # No URL segment — login, register
    └── (dashboard)/              # No URL segment — auth guard in layout
        ├── dashboard/page.tsx
        └── profile/page.tsx
```

`(dashboard)/layout.tsx` calls `getServerUser()` server-side — redirects to `/login` if no valid session (second auth layer after middleware).

---

## i18n

**Locale detection order (middleware):**
1. `NEXT_LOCALE` cookie (user selection)
2. `CF-IPCountry` header (Cloudflare — `IT` → it, else → en)
3. `Accept-Language` header
4. `defaultLocale` (`en`)

Detected locale is injected into `Accept-Language` before passing to next-intl middleware. Navigation via `src/i18n/navigation.ts` (`Link`, `redirect`, `useRouter`, `usePathname`) — all locale-aware.

---

## Authentication

**3 cookies:**

| Cookie | httpOnly | TTL | Purpose |
|---|---|---|---|
| `access_token` | yes | 10 min | API auth (XSS-safe) |
| `refresh_token` | yes | 30 days | Token renewal |
| `user_info` | no | 10 min | Client UI (avatar, username) |

**Auto-refresh (`fetchWithAuth`):**
`401` → POST `/api/v1/auth/refresh` → update both cookies → retry request. On refresh failure: delete all cookies → return `{ sessionExpired: true }` → Server Action redirects to `/login`.

**Login flow:** POST login → set cookies → GET `/users/me` → set `user_info` cookie.
**Logout flow:** POST logout (blacklists refresh token) → delete all 3 cookies → redirect `/login`.

---

## API Layer

```typescript
// src/config/index.ts
API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

API_ENDPOINTS = {
  auth:          { register, login, logout, refresh }
  users:         { me, update (PATCH), delete (DELETE) }
  subscriptions: { list, detail(id), create, update(id), delete(id) }
  media:         { uploadUrl, confirmUpload, myMedia }
}
```

**Standard response shape:**
```typescript
interface ApiResponse<T> { success: boolean; data: T | null; error: { statusCode: number; message: string } | null; }
```

**Avatar upload — presigned URL flow:**
`request upload URL → PUT directly to Cloudflare R2 (bypasses Next.js) → confirm upload → CDN URL returned`
Images served from `cdn.substracker.live` (configured in `next.config.ts` `remotePatterns`).

---

## Server Actions

All in `src/shared/actions/` — `"use server"`, read cookies via `next/headers`.

| File | Actions |
|---|---|
| `auth.actions.ts` | `loginAction`, `registerAction`, `logoutAction`, `getServerUser` |
| `subscription.actions.ts` | `getSubscriptionsAction`, `createSubscriptionAction`, `updateSubscriptionAction`, `deleteSubscriptionAction` |
| `user.actions.ts` | `getUserProfileAction`, `updateUserProfileAction`, `deleteAccountAction` |
| `media.actions.ts` | `requestUploadUrlAction`, `confirmUploadAction`, `getMyAvatarAction` |

---

## Components

**Atoms:** `Button` (variants: default/outline/ghost/danger, sizes: xs/sm/base/lg), `Input`, `Label`, `Separator`, `Skeleton`

**Molecules:** `AnimatedAuthCard`, `AnimatedSection`, `StatsGrid` (3 stat cards, staggered Motion), `ToggleDarkMode`

**Layout:** `Navbar` (brand, avatar, dark mode toggle, logout)

**Auth:** `LoginForm`, `RegisterForm` (Zod: 8+ chars, uppercase, number, special char), `ProfileInfo`

**Profile:** `AvatarUpload` (presigned URL flow), `ChangeEmailForm`, `ChangePasswordForm`, `DeleteAccountSection`

**Subscriptions:** `SubscriptionList` (CRUD + state), `SubscriptionCard`, `SubscriptionFormModal`, `DeleteConfirmDialog`, `ChartsSection`

---

## Charts

`toMonthly(amount, cycle)` normalises all billing cycles to monthly equivalent (weekly × 52/12, yearly / 12, quarterly / 3, biannual / 6). All chart data derived client-side from subscription array.

| Chart | Type | Dimension |
|---|---|---|
| `SpendingTrendChart` | Area | 12-month spend trend |
| `CategoryBreakdownChart` | Pie | Spend by category |
| `BillingCycleChart` | Bar | Spend by cycle |
| `TopSubscriptionsChart` | Horizontal Bar | Top N by monthly cost |

---

## Dark Mode

SSR-safe: `getServerTheme()` reads `theme` cookie → renders `<html class="dark">` before paint (no FOIT). `useDarkMode()` hook toggles `.dark` on `document.documentElement` and writes `theme` cookie (365d) via js-cookie.

---

## SEO

`/sitemap.xml` — 6 entries (3 routes × 2 locales) with hreflang alternates.
`/robots.txt` — allows public routes, disallows `/dashboard`, `/profile`, `/api/`.
Both excluded from middleware matcher (`sitemap.xml|robots.txt`) so next-intl doesn't intercept them.

---

## Sentry

| Runtime | File | Config |
|---|---|---|
| Node.js server | `sentry.server.config.ts` | `tracesSampleRate: 1`, `enableLogs: true` |
| Edge | `sentry.edge.config.ts` | Same DSN |
| Browser | `instrumentation-client.ts` | Client init |

`instrumentation.ts`: `onRequestError = Sentry.captureRequestError` — auto-captures all unhandled server errors.
`global-error.tsx`: React error boundary — `useEffect(() => Sentry.captureException(error))`.
Build: `withSentryConfig` uploads source maps, tree-shakes debug logs from bundle.

---

## Environment Variables

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend base URL |
| `NEXT_PUBLIC_SITE_URL` | `https://substracker.live` | Sitemap + robots |
| `SENTRY_AUTH_TOKEN` | — | Build-time source map upload (`.env.sentry-build-plugin`) |

---

## Running Locally

```bash
pnpm install
# set NEXT_PUBLIC_API_URL in .env.local
pnpm dev   # → http://localhost:3000
```

Production build: `pnpm build && pnpm start`. Docker: multi-stage Node 20 Alpine, `next build` with `standalone` output.
