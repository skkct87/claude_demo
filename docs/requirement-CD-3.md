# Requirements: CD-3

## Source Information
- **JIRA Ticket**: [CD-3](https://skkct87.atlassian.net/browse/CD-3) — Account Screen: User Account Details
- **Project**: CD (Caps-Demo)
- **Type**: Story
- **Fetched**: 2026-09-28T12:16:41+05:30
- **Status**: Requirements Gathering Complete

## User Story
As a user, I want to see my account status on my user information page, so I can confirm whether my account is active.

## Acceptance Criteria (from JIRA)
- The user information page displays a **Status** field alongside the user's account details.
- When the account is active, the status displays **Active**.
- The status is also visible in the account summary panel, as shown in the design.
- The status is read-only; users cannot change it from this page.
- Fields shown per the attached mockup: User First Name, Middle Name, User Last Name, User Email, Username, Role, Status.

## Clarifying Questions & Answers

**Q1 — Data model gap**: The current `User` model (`prisma/schema.prisma`) only stores `email` and `password`. First/Middle/Last Name, Username, Role, and Status don't exist anywhere in the app.
**A**: Add all of them as new columns on `User` (migration), populated with sensible defaults for both new and existing accounts, rather than hard-coding placeholder values in the UI.

**Q2 — Editability**: Story says Status is read-only. What about the other fields?
**A**: Out of scope for CD-3 — this ticket is display-only. No edit form is introduced. Editing is a follow-up.

**Q3 — Deactivation**: Is there a way for an account to become non-"Active" today?
**A**: No deactivation/suspension feature exists in the app. `status` defaults to `"Active"` for every account and there is no code path that changes it, which naturally satisfies "read-only."

**Q4 — Access**: Who can view the account page?
**A**: Only the signed-in user, viewing their own account. Anonymous users are redirected to sign in (consistent with existing `middleware.ts` protection pattern).

**Q5 — Entry point**: How is the page reached?
**A**: A "My Account" icon button added to `HeaderActions` (next to Sign Out), linking to `/account`.

## Functional Requirements

### FR-1: Account Details Page
- **Description**: A new route `/account` renders a read-only summary of the signed-in user's account: First Name, Middle Name, Last Name, Email, Username, Role, Status — laid out per the mockup (identity panel + details panel).
- **Acceptance Tests**: Visiting `/account` while signed in shows all seven fields with the current user's data; a null name field renders a placeholder ("—") instead of blank/crashing.

### FR-2: Status Field
- **Description**: Status is always rendered as `"Active"` for the current implementation and styled distinctly (e.g. green badge/check icon) as in the mockup.
- **Acceptance Tests**: Status badge reads "Active" for every account; no UI control exists to change it.

### FR-3: Data Backing
- **Description**: `User` model gains `username`, `firstName`, `middleName`, `lastName`, `role`, `status` columns. `username` is derived from the email local-part at sign-up and is unique; `role` defaults to `"User"`; `status` defaults to `"Active"`.
- **Acceptance Tests**: New sign-ups populate `username`/`role`/`status` automatically; existing rows get the same defaults via migration without data loss.

### FR-4: Navigation Entry Point
- **Description**: Signed-in users see a "My Account" button in the header that navigates to `/account`.
- **Acceptance Tests**: Button visible only when signed in; clicking it navigates to `/account`.

### FR-5: Route Protection
- **Description**: `/account` requires an authenticated session; unauthenticated requests are redirected.
- **Acceptance Tests**: Visiting `/account` while signed out redirects to `/`.

## Non-Functional Requirements

### NFR-1: Performance
Page must render from a single DB lookup already covered by the existing `getUser()` server action pattern; no additional round trips.

### NFR-2: Reliability
Migration must be backward-compatible with the existing `dev.db` (additive columns with defaults, no destructive changes); existing sign-in/sign-up flows must keep working unmodified.

### NFR-3: Security
No new attack surface: read-only page, no new inputs, existing session/JWT auth reused, no PII beyond what's already stored (email) plus new non-sensitive profile fields.

### NFR-4: Maintainability
Reuse existing UI primitives (`Button`, `Label`, `Separator`) and `cn()` styling conventions; no new dependencies.

## Scope Definition

### In Scope
- Prisma schema migration adding profile/status columns to `User`.
- `getUser()` extended to select the new fields; `signUp()` sets sane defaults.
- New `/account` page (server component) + presentational component matching the mockup.
- Header navigation entry point.
- Middleware/route protection for `/account`.

### Out of Scope
- Editing any account field (name, username, role) — future ticket.
- Any account deactivation/suspension workflow.
- Admin-facing account management for other users.
- Collecting name/username at sign-up time (sign-up form unchanged).

## Dependencies & Assumptions
- SQLite dev database (`prisma/dev.db`) is the target for the migration; no separate staging/prod DB in this environment.
- Existing accounts have no first/middle/last name on file; the UI must handle that gracefully.
- "Role" value `"Admin + Write-View"` shown in the mockup is sample test data, not a real role system — CD-3 introduces a single default role string, not RBAC.

## Summary
- **Total Functional Requirements**: 5
- **Total Non-Functional Requirements**: 4
