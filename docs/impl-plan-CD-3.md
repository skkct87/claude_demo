# Implementation Plan: CD-3 — Account Details Page

## Task Breakdown (Dependency-Ordered)

1. **Schema migration** — add `username` (nullable first), `firstName`, `middleName`, `lastName`, `role` (default `"User"`), `status` (default `"Active"`) to `User` in `prisma/schema.prisma`; run `prisma migrate dev`.
2. **Backfill script** — one-off Node script deriving `username` from existing `email` local-parts (dedup on collision), run once against `dev.db`.
3. **Tighten `username`** — flip the column to required + unique once backfilled (second migration), matching the target schema in `docs/architecture-CD-3.md`.
4. **`signUp()` update** (`src/actions/index.ts`) — derive+dedupe `username` from email, set `role: "User"`, rely on `status` default.
5. **`getUser()` update** (`src/actions/index.ts`) — select the new columns.
6. **`AccountDetails` component** (`src/components/account/AccountDetails.tsx`) — presentational, matches mockup layout, null-safe rendering.
7. **`/account` page** (`src/app/account/page.tsx`) — server component: `getUser()`, redirect if signed out, render `AccountDetails`.
8. **Header entry point** (`src/components/HeaderActions.tsx`) — add "My Account" icon button (signed-in only) linking to `/account`.
9. **Tests** — unit test for username-derivation helper; component test for `AccountDetails` (renders all fields, null placeholder, Active badge).
10. **Verification** — `npm run lint`, `npm test`, manual walk-through.

## Critical Path
1 → 2 → 3 → 4/5 (parallel) → 6/7 (parallel) → 8 → 9 → 10

## Definition of Done
- Migration applies cleanly to `dev.db` with zero data loss.
- Signed-in user can reach `/account` via header button and sees all 7 fields, Status = "Active".
- Signed-out visit to `/account` redirects to `/`.
- `npm run lint` and `npm test` pass.
