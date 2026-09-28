# Design Review: CD-3 — Account Details Page

## Requirement Alignment

| Requirement | Component(s) | Coverage | Status |
|---|---|---|---|
| FR-1: Account details page | `src/app/account/page.tsx`, `AccountDetails.tsx` | Renders all 7 fields | ✅ |
| FR-2: Status field | `AccountDetails.tsx` | Static "Active" badge | ✅ |
| FR-3: Data backing | `prisma/schema.prisma`, migration, `signUp()` | New columns + defaults | ✅ |
| FR-4: Navigation entry point | `HeaderActions.tsx` | "My Account" button | ✅ |
| FR-5: Route protection | `account/page.tsx` | `getUser()` + redirect | ✅ |
| NFR-2: Reliability (backward compat) | migration | Additive only | ⚠️ needs backfill step |

## Identified Risks

### Risk 1: Existing rows have no `username` — unique constraint will fail the migration
**Impact**: High — `npx prisma migrate dev` would fail applying a `NOT NULL UNIQUE` column to a table with existing rows and no values to fill them with.
**Mitigation**: Write the migration in two steps — (a) add `username` as nullable, (b) run a one-off backfill script deriving `username` from `email` local-part with collision suffixing, (c) is deferred: since this is a dev/demo SQLite DB with likely few/no seeded users, backfill via a small Node script run once, then the column can safely stay unique. Confirmed acceptable given this is a local dev DB, not production data.

### Risk 2: Username collisions on backfill or sign-up
**Impact**: Medium — two emails with the same local-part (`a@x.com`, `a@y.com`) would collide.
**Mitigation**: Dedup by appending `-2`, `-3`, ... on conflict, both in the backfill script and in `signUp()`.

### Risk 3: `getUser()` return type changes shape
**Impact**: Low-Medium — `HeaderActions`/`MainContent` currently type `user` as `{ id, email }`. Widening the select adds fields but doesn't break existing consumers (extra fields are ignored by TS structural typing as long as the interfaces aren't narrowed elsewhere).
**Mitigation**: Leave existing prop types alone; only the new `/account` page needs the full shape, fetched independently via its own `getUser()` call.

### Risk 4: Null name fields rendering as blank
**Impact**: Low — a legacy account with no first/middle/last name shows empty table cells, looking broken.
**Mitigation**: `AccountDetails.tsx` renders `"—"` for any null field.

## Architecture Gaps
None blocking. Editing, RBAC, and deactivation are explicitly out of scope per requirements and don't need to be designed for here.

## Design Strengths
1. No new runtime dependency.
2. Reuses established auth/session/server-action patterns exactly.
3. Migration is additive — no destructive changes, no risk to `projects` data.
4. Read-only scope keeps the change small and low-risk.

## Agreed Design Decisions
1. `username`, `role`, `status` are backfilled/defaulted at the DB level; no manual data entry required.
2. Status has no edit path anywhere in the codebase — satisfies "read-only" by construction, not by disabled-input trickery.
3. `/account` uses page-level redirect auth, matching `src/app/page.tsx`.

## Architecture Validation Summary

| Aspect | Assessment | Confidence |
|---|---|---|
| Requirement coverage | Complete | 95% |
| Feasibility | Achievable | 95% |
| Backward compatibility | Good, with backfill step | 90% |
| Security | Adequate (no new inputs) | 95% |

**Overall Recommendation**: ✅ **APPROVED** — proceed to implementation planning, with the username-backfill step called out explicitly as Task in the impl plan.
