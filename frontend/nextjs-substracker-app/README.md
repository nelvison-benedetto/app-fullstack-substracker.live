# SubSnap — Frontend

Next.js 15 frontend for SubSnap, a subscription tracking web application. Built with the App Router, React 19, TypeScript, and Tailwind CSS v4. Supports two locales (EN/IT), dark mode, JWT authentication with automatic token refresh, and a full analytics dashboard.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Routing & App Router](#routing--app-router)
- [Internationalisation (i18n)](#internationalisation-i18n)
- [Authentication](#authentication)
- [API Layer](#api-layer)
- [Server Actions](#server-actions)
- [State Management](#state-management)
- [Components](#components)
- [Charts & Analytics](#charts--analytics)
- [Styling & Design System](#styling--design-system)
- [Dark Mode](#dark-mode)
- [SEO — Sitemap & Robots](#seo--sitemap--robots)
- [Error Monitoring (Sentry)](#error-monitoring-sentry)
- [TypeScript](#typescript)
- [Environment Variables](#environment-variables)
- [Build & Docker](#build--docker)
- [Running Locally](#running-locally)

---

## Tech Stack

| Category | Library | Version |
|---|---|---|
| Framework | Next.js | 15.1.6 |
| UI Runtime | React | 19.2.3 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| i18n | next-intl | 4.8.3 |
| Forms | react-hook-form | 7.71.2 |
| Validation | Zod | 4.3.6 |
| Charts | Recharts | 3.8.1 |
| Animations | Motion (Framer) | 12.38.0 |
| Icons | Lucide React | 0.577.0 |
| Cookies (client) | js-cookie | 3.0.5 |
| Error Monitoring | Sentry | 10.46.0 |
| Component Base | Base UI (Radix-like) | 1.3.0 |
| Package Manager | pnpm | — |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata, dark mode class
│   ├── global-error.tsx          # Global error boundary + Sentry capture
│   ├── sitemap.ts                # /sitemap.xml generation
│   ├── robots.ts                 # /robots.txt generation
│   ├── api/
│   │   └── sentry-example-api/   # Sentry test endpoint
│   └── [locale]/                 # Dynamic locale segment (en / it)
│       ├── layout.tsx            # Locale layout — NextIntlClientProvider
│       ├── page.tsx              # Landing page
│       ├── (auth)/               # Route group: login & register
│       │   ├── layout.tsx
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       └── (dashboard)/          # Route group: protected pages
│           ├── layout.tsx        # Auth guard + Navbar
│           ├── dashboard/page.tsx
│           └── profile/page.tsx
│
├── config/
│   └── index.ts                  # API_BASE_URL, API_ENDPOINTS, COOKIE_NAMES, ROUTES
│
├── i18n/
│   ├── routing.ts                # Locale list, defaultLocale, localePrefix strategy
│   ├── request.ts                # getRequestConfig — loads messages per locale
│   └── navigation.ts            # i18n-aware Link, Router, redirect, usePathname
│
├── middleware.ts                 # Locale detection + route protection
│
├── features/
│   ├── auth/
│   │   ├── components/           # LoginForm, RegisterForm, ProfileInfo
│   │   ├── context/              # AuthContext + useAuth hook
│   │   └── validation/           # Zod schemas: loginSchema, registerSchema
│   ├── profile/
│   │   └── components/           # AvatarUpload, ChangeEmailForm, ChangePasswordForm, DeleteAccountSection
│   ├── subscriptions/
│   │   ├── components/           # SubscriptionList, SubscriptionCard, SubscriptionFormModal, charts
│   │   ├── utils/                # toMonthly(), chart data builders
│   │   └── validation/           # Zod schema + BILLING_CYCLES, CATEGORIES
│   └── welcome/
│       └── WelcomePageContent.tsx
│
├── shared/
│   ├── actions/                  # Server Actions (Next.js "use server")
│   │   ├── auth.actions.ts
│   │   ├── subscription.actions.ts
│   │   ├── media.actions.ts
│   │   └── user.actions.ts
│   ├── components/
│   │   ├── atoms/                # Button, Input, Label, Separator, Skeleton
│   │   ├── molecules/            # AnimatedAuthCard, AnimatedSection, StatsGrid, ToggleDarkMode
│   │   └── layout/               # Navbar
│   ├── hooks/
│   │   └── useDarkMode.ts
│   ├── types/                    # ApiResponse<T>, AuthUser, User, Subscription, etc.
│   ├── utils/
│   │   ├── fetchWithAuth.ts      # Fetch wrapper with auto token refresh
│   │   ├── formatCurrency.ts     # Intl.NumberFormat for EUR
│   │   └── getServerTheme.ts     # Server-side theme from cookie
│   └── constants/
│       ├── consts.ts             # Subscription types/categories arrays
│       └── variants.ts           # Button Tailwind variant/size strings
│
├── messages/
│   ├── en.json                   # English translations
│   └── it.json                   # Italian translations
│
├── instrumentation.ts            # Sentry boot hook
├── instrumentation-client.ts     # Client-side Sentry init
├── sentry.server.config.ts
└── sentry.edge.config.ts
```

---

## Architecture Overview

The app follows the **Next.js App Router** model with a strict separation between server and client code:

- **Server Components** fetch data directly via Server Actions, never exposing tokens to the client bundle.
- **Client Components** (`"use client"`) handle interactivity, forms, and animations.
- **Server Actions** (`"use server"`) are the only bridge between client forms and the backend API. They run on the server, read httpOnly cookies, call the backend, and return serialisable results.
- **Middleware** runs on the edge for locale detection and auth-gate logic before any page renders.

```
Browser → Middleware (edge) → [locale]/layout → page (server) → client components
                                                      ↕
                                               Server Actions
                                                      ↕
                                           Backend API (ASP.NET Core)
```

---

## Routing & App Router

### Dynamic Locale Segment

All pages live under `src/app/[locale]/`. The `[locale]` segment is populated by next-intl middleware with either `en` (no prefix in URL) or `it` (`/it/...` prefix). See [Internationalisation](#internationalisation-i18n).

### Route Groups

| Group | Folder | Purpose |
|---|---|---|
| Auth | `(auth)/` | Shares a minimal layout (no Navbar). Contains `/login` and `/register`. |
| Dashboard | `(dashboard)/` | Shares the dashboard layout with Navbar and server-side auth guard. Contains `/dashboard` and `/profile`. |

Route groups use parentheses and do **not** add a URL segment.

### Auth Guard in Layout

`src/app/[locale]/(dashboard)/layout.tsx` calls `getServerUser()` server-side on every render. If no valid session exists, it performs a server-side redirect to `/login`. This is the second layer of protection (middleware is the first).

---

## Internationalisation (i18n)

Built with **next-intl 4** using the App Router integration.

### Locale Strategy

```typescript
// src/i18n/routing.ts
export const routing = defineRouting({
  locales: ["en", "it"],
  defaultLocale: "en",
  localePrefix: "as-needed", // English: no prefix — Italian: /it/...
});
```

- English URLs: `/`, `/login`, `/dashboard`
- Italian URLs: `/it`, `/it/login`, `/it/dashboard`

### Locale Detection Order (Middleware)

1. `NEXT_LOCALE` cookie — user has previously selected a language
2. `CF-IPCountry` header — Cloudflare geolocation (`IT` → Italian, everything else → English)
3. `Accept-Language` browser header — checks if it starts with `en`
4. Falls back to `defaultLocale` (`en`)

The detected locale is injected into the `Accept-Language` header of the cloned request before passing it to the next-intl middleware. This overrides browser preference with the app's detection logic.

### Message Files

Translation keys are in `src/messages/en.json` and `src/messages/it.json`. Namespaces:
`nav`, `welcome`, `auth`, `dashboard`, `profile`, `subscriptions`, `charts`

### Navigation

```typescript
// src/i18n/navigation.ts — wraps next/navigation
import { Link, redirect, useRouter, usePathname } from "@/i18n/navigation";
```

All navigation primitives are locale-aware. Using these instead of `next/navigation` ensures locale prefixes are handled automatically.

---

## Authentication

### Token Architecture

| Cookie | Value | TTL | httpOnly | Readable by JS |
|---|---|---|---|---|
| `access_token` | JWT | 10 min | yes | no |
| `refresh_token` | opaque token | 30 days | yes | no |
| `user_info` | JSON user object | 10 min | no | yes |

`access_token` and `refresh_token` are httpOnly so they cannot be read by JavaScript (XSS protection). `user_info` is a non-httpOnly cookie used only to populate the client-side UI (Navbar avatar, username) without an extra API call.

### Login Flow

```
1. loginAction("use server") called with email + password
2. POST /api/v1/auth/login → { access_token, refresh_token }
3. Set access_token cookie (httpOnly, 10 min)
4. Set refresh_token cookie (httpOnly, 30 days)
5. GET /api/v1/users/me with new access_token
6. Set user_info cookie (readable, 10 min) with { id, email, username, avatarUrl }
7. Return { success: true }
```

### Automatic Token Refresh

`src/shared/utils/fetchWithAuth.ts` wraps every API call:

```
1. Attach Authorization: Bearer <access_token> header
2. Execute fetch
3. If response is 401:
   a. Call tryRefreshTokens()
   b. POST /api/v1/auth/refresh with refresh_token cookie
   c. On success: update both cookies, retry original request
   d. On failure: delete all 3 cookies → return { sessionExpired: true }
4. Return { sessionExpired: false, response }
```

The caller (Server Action) checks `sessionExpired` and redirects to `/login` if true.

### Logout Flow

```
1. logoutAction("use server") called
2. fetchWithAuth POST /api/v1/auth/logout (sends refresh_token to blacklist it)
3. Delete access_token, refresh_token, user_info cookies
4. redirect("/login")
```

### Client-Side Auth State

`src/features/auth/context/AuthContext.tsx` provides a `useAuth()` hook that exposes:
- `user: AuthUser | null` — parsed from `user_info` cookie on mount
- `isAuthenticated: boolean`
- `logout: () => void` — calls `logoutAction` and clears context

The context is initialised in `(dashboard)/layout.tsx` with the server-fetched user, so it's always populated before the first client render.

---

## API Layer

### Base Configuration

```typescript
// src/config/index.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const API_ENDPOINTS = {
  auth: {
    register: "/api/v1/users/register",
    login:    "/api/v1/auth/login",
    logout:   "/api/v1/auth/logout",
    refresh:  "/api/v1/auth/refresh",
  },
  users: {
    me:     "/api/v1/users/me",
    delete: "/api/v1/users/me",       // DELETE method
    update: "/api/v1/users/me",       // PATCH method
  },
  subscriptions: {
    list:   "/api/v1/subscriptions",
    detail: (id) => `/api/v1/subscriptions/${id}`,
    create: "/api/v1/subscriptions",
    update: (id) => `/api/v1/subscriptions/${id}`,
    delete: (id) => `/api/v1/subscriptions/${id}`,
  },
  media: {
    uploadUrl:      "/api/v1/media/upload-url",
    confirmUpload:  "/api/v1/media/confirm-upload",
    myMedia:        "/api/v1/media",
  },
};
```

### Standard API Response Shape

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { statusCode: number; message: string } | null;
}
```

All Server Actions parse and return this shape. Client components only receive the final `data` or `error` — never raw HTTP responses.

### Avatar Upload — Presigned URL Flow

Profile picture uploads use a two-step presigned URL flow to avoid routing large files through the Next.js server:

```
1. Client calls media.actions.ts → POST /api/v1/media/upload-url
   → Backend generates a presigned PUT URL for Cloudflare R2
2. Client PUT directly to the presigned URL (bypasses Next.js)
3. Client calls media.actions.ts → POST /api/v1/media/confirm-upload
   → Backend marks the upload as confirmed, stores the CDN URL
4. CDN URL returned to client → displayed immediately
```

Images are served from `cdn.substracker.live` (Cloudflare R2 + CDN). The Next.js Image component is configured to allow this hostname:

```typescript
// next.config.ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.substracker.live" }],
},
```

---

## Server Actions

All data mutations and fetches go through Next.js Server Actions in `src/shared/actions/`. They run exclusively on the server, have access to cookies via `next/headers`, and return serialisable objects to the client.

| File | Actions |
|---|---|
| `auth.actions.ts` | `loginAction`, `registerAction`, `logoutAction`, `getServerUser` |
| `subscription.actions.ts` | `getSubscriptionsAction`, `createSubscriptionAction`, `updateSubscriptionAction`, `deleteSubscriptionAction` |
| `user.actions.ts` | `getUserProfileAction`, `updateUserProfileAction`, `deleteAccountAction` |
| `media.actions.ts` | `requestUploadUrlAction`, `confirmUploadAction`, `getMyAvatarAction` |

**Pattern used in every action:**

```typescript
"use server";
export async function exampleAction(input: InputType): Promise<ResultType> {
  const { sessionExpired, response } = await fetchWithAuth(url, options);
  if (sessionExpired) redirect(ROUTES.login);
  const json: ApiResponse<Data> = await response.json();
  if (!json.success) return { success: false, error: json.error };
  return { success: true, data: json.data };
}
```

---

## State Management

There is no global state library (no Redux, no Zustand). State is managed at three levels:

### 1. Server State
Data is fetched server-side in page components and passed as props. After a mutation, `router.refresh()` is called on the client to trigger a server re-render, which re-fetches data from the backend.

### 2. Context State
`AuthContext` holds the logged-in user. It is initialised once in the dashboard layout with the server-fetched user and updated on logout.

### 3. Local Component State
- `SubscriptionList` — manages the subscription array, open modals, and the currently edited item via `useState`.
- `AvatarUpload` — manages file preview URL, upload progress, and error state.
- All forms use `react-hook-form` with Zod resolvers for controlled inputs.

### Cookie State
The `useDarkMode` hook persists the current theme in a `theme` cookie via `js-cookie` so the preference survives page reloads and is readable server-side on the next request (for SSR theme injection).

---

## Components

### Atoms (`src/shared/components/atoms/`)

| Component | Description |
|---|---|
| `Button` | Variants: `default`, `outline`, `ghost`, `danger`. Sizes: `xs`, `sm`, `base`, `lg`. Accepts `isLoading` for spinner state. |
| `Input` | Handles `default`, `checkbox`, and `file` input types with consistent styling. |
| `Label` | Accessible form label. |
| `Separator` | Horizontal divider. |
| `Skeleton` | Animated loading placeholder. |

### Molecules (`src/shared/components/molecules/`)

| Component | Description |
|---|---|
| `AnimatedAuthCard` | Wraps auth pages in a Motion fade-in + slide-up animation. |
| `AnimatedSection` | Generic section wrapper with entrance animation. |
| `StatsGrid` | 3-column grid of stat cards with staggered Motion animations (total spend, monthly, active count). |
| `ToggleDarkMode` | Icon button that calls `useDarkMode()` to toggle light/dark. |

### Layout (`src/shared/components/layout/`)

| Component | Description |
|---|---|
| `Navbar` | Top header. Shows brand logo, user avatar (from `user_info` cookie), dark mode toggle, logout button. |

### Feature: Auth

| Component | Description |
|---|---|
| `LoginForm` | Controlled form with `react-hook-form` + `loginSchema` (Zod). Shows field-level errors. Calls `loginAction`. |
| `RegisterForm` | Same pattern. Password validation: min 8 chars, 1 uppercase, 1 number, 1 special character. Calls `registerAction`. |
| `ProfileInfo` | Displays current user info (email, username). |

### Feature: Profile

| Component | Description |
|---|---|
| `AvatarUpload` | File picker + presigned URL upload to R2. Shows progress, preview, and error state. |
| `AvatarSectionClient` | Client wrapper around `AvatarUpload` with current avatar display. |
| `ChangeEmailForm` | Form to update email via `updateUserProfileAction`. |
| `ChangePasswordForm` | Form to update password. Validates current password + new password strength. |
| `DeleteAccountSection` | Confirmation flow for permanent account deletion. Calls `deleteAccountAction` then redirects. |

### Feature: Subscriptions

| Component | Description |
|---|---|
| `SubscriptionList` | Main CRUD component. Holds subscription state. Opens create/edit/delete modals. |
| `SubscriptionCard` | Displays a single subscription: name, amount, billing cycle, category, next billing date. |
| `SubscriptionFormModal` | Modal for creating and editing. Uses `subscriptionSchema` (Zod). |
| `DeleteConfirmDialog` | Confirmation modal before deletion. |
| `ChartsSection` | Renders all 4 analytics charts in a responsive grid. |

---

## Charts & Analytics

Built with **Recharts 3**. All chart data is derived client-side from the subscriptions array using utility functions in `src/features/subscriptions/utils/subscriptionUtils.ts`.

### `toMonthly(amount, billingCycle)`
Normalises any billing cycle to a monthly equivalent cost:
- `monthly` → amount × 1
- `yearly` → amount / 12
- `quarterly` → amount / 3
- `biannual` → amount / 6
- `weekly` → amount × (52 / 12)

### Charts

| Chart | Type | Data |
|---|---|---|
| `SpendingTrendChart` | Area chart | Simulates 12-month spend trend from current subscriptions |
| `CategoryBreakdownChart` | Pie chart | Monthly spend grouped by category |
| `BillingCycleChart` | Bar chart | Monthly spend grouped by billing cycle |
| `TopSubscriptionsChart` | Horizontal bar | Top N subscriptions sorted by monthly cost |

### Stats Grid

Three summary cards above the charts:
- **Total monthly spend** — sum of all `toMonthly()` values
- **Total annual spend** — monthly × 12
- **Active subscriptions** — count of subscription records

---

## Styling & Design System

### Tailwind CSS v4

Uses the new `@tailwindcss/postcss` plugin (v4 syntax, no `tailwind.config.js`). All design tokens are CSS variables defined in `src/app/globals.css` inside `@theme {}`.

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
  --color-primary: ...;
  --radius-lg: ...;
  /* chart color slots */
  --color-chart-1: ...; /* through chart-5 */
}
```

### Color Space

All colors use **oklch** (modern perceptual color space). Light and dark palettes are defined as CSS variables on `:root` and `.dark` respectively, giving smooth contrast scaling.

### Fonts

Both loaded via `next/font/google` in `src/app/layout.tsx`:

| Font | CSS Variable | Usage |
|---|---|---|
| Inter | `--font-inter` | All UI text (`--font-sans`) |
| JetBrains Mono | `--font-jetbrains-mono` | Numbers, code (`--font-mono`) |

`display: "swap"` is used on both to avoid layout shift.

### Component Variants

Button variants and sizes are defined as plain Tailwind class strings in `src/shared/constants/variants.ts` and applied via `class-variance-authority`. `cn()` from `src/lib/utils.ts` merges classes using `clsx` + `tailwind-merge`.

---

## Dark Mode

Dark mode is driven by the `.dark` class on `<html>` (Tailwind class strategy).

### Flow

1. `getServerTheme()` reads the `theme` cookie server-side in `layout.tsx`
2. If `"dark"`, renders `<html className="dark">` — **no flash on first load**
3. `useDarkMode()` hook manages client-side toggling:
   - Reads current class from `document.documentElement`
   - Toggles `.dark`
   - Persists choice in `theme` cookie via `js-cookie` (365 day expiry)
4. On next request, step 1 reads the cookie again → SSR matches client

This approach avoids the "flash of incorrect theme" (FOIT) that occurs with purely client-side theme detection.

---

## SEO — Sitemap & Robots

### Sitemap (`src/app/sitemap.ts`)

Generates `/sitemap.xml` dynamically. Includes all public routes in both locales with hreflang alternates:

```
/ (en)          → priority 1.0, weekly
/it             → priority 1.0, weekly
/login          → priority 0.8, monthly
/it/login       → priority 0.8, monthly
/register       → priority 0.8, monthly
/it/register    → priority 0.8, monthly
```

### Robots (`src/app/robots.ts`)

```
Allow:    /, /login, /register, /it, /it/login, /it/register
Disallow: /dashboard, /profile, /it/dashboard, /it/profile, /api/, /sentry-example-page
Sitemap:  https://substracker.live/sitemap.xml
```

### Middleware Exclusion

Both `/sitemap.xml` and `/robots.txt` are excluded from the middleware matcher so next-intl does not intercept them:

```typescript
matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
```

---

## Error Monitoring (Sentry)

Sentry is set up for **server**, **edge**, and **client** runtimes.

### Configuration Files

| File | Runtime | Key Settings |
|---|---|---|
| `sentry.server.config.ts` | Node.js server | `tracesSampleRate: 1`, `enableLogs: true`, `sendDefaultPii: true` |
| `sentry.edge.config.ts` | Middleware/edge | Same DSN, `tracesSampleRate: 1` |
| `instrumentation-client.ts` | Browser | Client-side init |

### Auto-Capture

`src/instrumentation.ts` registers `onRequestError = Sentry.captureRequestError` so all unhandled server errors are captured automatically without try/catch.

`src/app/global-error.tsx` is the React error boundary for the root layout. It captures client-side errors via `useEffect(() => Sentry.captureException(error), [error])`.

### Build Integration

```typescript
// next.config.ts
withSentryConfig(config, {
  org: "nelvison-organization",
  project: "substrackerapp-frontend",
  widenClientFileUpload: true,   // upload more source map files
  silent: !process.env.CI,       // suppress output locally
  webpack: {
    automaticVercelMonitors: true,
    treeshake: { removeDebugLogging: true },  // strip Sentry debug logs from bundle
  },
})
```

---

## TypeScript

`tsconfig.json` key settings:

```json
{
  "target": "ES2017",
  "strict": true,
  "moduleResolution": "bundler",
  "paths": { "@/*": ["./src/*"] }
}
```

`strict: true` is enabled — no implicit `any`, no non-null bypassing.

### Type Locations (`src/shared/types/`)

| File | Types |
|---|---|
| `api.types.ts` | `ApiResponse<T>`, `ApiError` |
| `auth.types.ts` | `AuthUser`, `LoginResponseData`, `RegisterResponseData` |
| `user.types.ts` | `User` |
| `subscription.types.ts` | `Subscription`, `SubscriptionDetail`, `CreateSubscriptionDto`, `UpdateSubscriptionDto` |
| `media.types.ts` | `UploadUrlResponse`, `ConfirmUploadResponse` |
| `index.ts` | Re-exports everything — import from `@/shared/types` |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes (prod) | `http://localhost:5000` | Backend ASP.NET Core API base URL |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | `https://substracker.live` | Used in sitemap and robots |
| `SENTRY_AUTH_TOKEN` | yes (build) | — | Source map upload to Sentry (in `.env.sentry-build-plugin`) |
| `CI` | auto | — | Set by CI systems; enables Sentry verbose output during build |

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build time. Non-public variables (like `SENTRY_AUTH_TOKEN`) are build-time only and never sent to the browser.

---

## Build & Docker

### Multi-Stage Dockerfile

```dockerfile
FROM node:20-alpine AS builder
# Install pnpm
# Copy pnpm-lock.yaml and package.json
# pnpm install --frozen-lockfile
# pnpm build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
# Copy .next/standalone + .next/static from builder
CMD ["pnpm", "start"]
```

The `standalone` output from Next.js is used to minimise the final image size (includes only the necessary Node.js files).

### npm Scripts

```bash
pnpm dev      # Start dev server on :3000 with hot reload
pnpm build    # Production build (outputs to .next/)
pnpm start    # Start production server
```

---

## Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variables
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

# 3. Start dev server
pnpm dev
# → http://localhost:3000
```

The backend (ASP.NET Core) must be running on the URL set in `NEXT_PUBLIC_API_URL` for API calls to work.
