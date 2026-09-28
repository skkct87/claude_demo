# Architecture: CD-3 — Account Details Page

## Objective
Design how a read-only account details page (with a Status field) is added to the existing `uigen` Next.js app, based on `docs/requirement-CD-3.md`.

## Component Changes

```
prisma/schema.prisma          Add columns to User (username, firstName,
                               middleName, lastName, role, status)
        ↓ migration
src/actions/index.ts          signUp(): set username/role/status defaults
                               getUser(): select new columns
        ↓
src/app/account/page.tsx      Server component: auth guard + data fetch
        ↓
src/components/account/
  AccountDetails.tsx           Presentational component (mockup layout)
        ↓
src/components/HeaderActions.tsx   "My Account" entry point (signed-in only)
```

## Data Model

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String
  username   String   @unique
  firstName  String?
  middleName String?
  lastName   String?
  role       String   @default("User")
  status     String   @default("Active")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  projects   Project[]
}
```

- `firstName`/`middleName`/`lastName` stay nullable: no UI collects them yet, and existing accounts have none. The account page renders `"—"` for null.
- `username` is required + unique. New sign-ups derive it from the email local-part, de-duplicated with a numeric suffix on collision. The migration backfills existing rows the same way via a data migration step (see Risks).
- `role` defaults to `"User"`; `status` defaults to `"Active"`. Both are plain strings, not enums — no role/permission logic is introduced by this ticket.

## Data Flow

```
1. Browser requests /account
2. account/page.tsx calls getUser()
3. getUser(): getSession() → prisma.user.findUnique(select: {..., username, firstName,
   middleName, lastName, role, status})
4. If no session → redirect("/")
5. If session but user missing → redirect("/") (defensive)
6. Render <AccountDetails user={user} />
```

No new API routes; this follows the existing pattern used by `src/app/page.tsx` (server component calling a server action).

## Route Protection

`/account` is a server component, so the auth check happens in the component itself via `getUser()` + `redirect()` — the same pattern `src/app/page.tsx` already uses. `middleware.ts`'s `protectedPaths` list is for API routes returning JSON 401s and is not extended, since a page route redirecting is more appropriate UX than a JSON error.

## UI Design (matches mockup)

- Two-panel card: left identity panel (avatar placeholder, username, role, status badge) + right "USER INFORMATION" panel (label/value rows for First/Middle/Last Name, Email, Username, Role, Status).
- Built from existing primitives only: `Button`, `Label`, `Separator`, `lucide-react` icons (`User`, `Mail`, `ShieldCheck`, `CheckCircle2`), Tailwind utility classes consistent with `MainContent`'s panel styling (`bg-white`, `border-neutral-200/60`, rounded corners). No new dependency added.
- Status renders as a green pill with a check icon when `status === "Active"` (the only value the app currently produces).

## Technology Stack
No changes — reuses Next.js App Router, Prisma/SQLite, existing auth/session utilities, Tailwind, lucide-react.

## Key Design Decisions

| Decision | Rationale | Alternative Considered |
|---|---|---|
| Additive, nullable name columns | Zero data loss on migration, no forced backfill of unknowable data | Making name fields required (rejected: no source data) |
| Derive `username` at sign-up + backfill migration | Satisfies mockup's Username field without a new sign-up form field | Add a username input to sign-up form (rejected: out of scope, larger surface) |
| Status is a static `"Active"` string, no enum/state machine | No deactivation feature exists; matches "read-only" AC exactly | Building a full status/lifecycle system (rejected: over-engineering for this ticket) |
| Page-level redirect for auth, not middleware | Matches existing pattern (`src/app/page.tsx`), avoids inconsistent 401-vs-redirect UX | Add `/account` to middleware's protected JSON paths (rejected: wrong response type for a page) |

## Next Steps
Move to Design Review to validate this against requirements and flag risks (migration backfill, existing sessions, uniqueness collisions).
