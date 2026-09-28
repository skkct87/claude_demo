# CD-3: Account Screen — User Account Details

_No git repository exists in this working directory, so this document stands in for a pull request description, summarizing the change set as agreed with the user._

## Summary
Adds a read-only account page (`/account`) that shows a user's Status alongside their First/Middle/Last Name, Email, Username, and Role, per CD-3's acceptance criteria and attached mockup. A "My Account" icon button in the app header links to it.

Because the existing `User` model only had `email`/`password`, this change also adds the underlying `username`, `firstName`, `middleName`, `lastName`, `role`, and `status` columns (per the user's explicit choice to add all fields as new DB columns with sensible defaults, rather than hardcoding/deriving them without persistence).

## Changes

**Schema / data**
- `prisma/schema.prisma`: added `username` (unique), `firstName`/`middleName`/`lastName` (nullable), `role` (default `"User"`), `status` (default `"Active"`) to `User`.
- Migration `prisma/migrations/20260928071704_add_account_profile_fields/` applied against the dev DB (0 existing rows, so no backfill was needed).

**Application logic**
- `src/lib/username.ts` (new): pure helpers to derive a unique username from an email's local-part (`baseUsernameFromEmail`, `generateUniqueUsername`).
- `src/actions/index.ts`: `signUp()` now generates a unique username on account creation; `getUser()` now selects the new profile fields.

**UI**
- `src/components/account/AccountDetails.tsx` (new): presentational component rendering the two-panel account card (dark identity panel + white detail rows), matching the mockup.
- `src/app/account/page.tsx` (new): server component that guards the route via `getUser()` + `redirect("/")` (same pattern as `src/app/page.tsx`), then renders `AccountDetails`.
- `src/components/HeaderActions.tsx`: added a "My Account" icon button (`UserCircle`) that navigates to `/account`.

**Tests**
- `src/lib/__tests__/username.test.ts` (new, 5 tests).
- `src/components/account/__tests__/AccountDetails.test.tsx` (new, 3 tests).

**Docs** (`docs/`, new directory)
- `requirement-CD-3.md`, `architecture-CD-3.md`, `design-review-CD-3.md`, `impl-plan-CD-3.md`, `review-CD-3.md`, `verification-CD-3.md`, and this file — lightweight docs for each SDLC phase, as agreed with the user in place of the repo's generic (and unrelated-project) `.claude/agents/*.md` templates.

## No new dependencies
Everything was built from primitives already in `package.json` (Radix UI wrappers, `lucide-react`, Tailwind).

## Test plan / evidence
See `docs/verification-CD-3.md`: `npm run lint` clean, `npx vitest run` → 193/193 passing (8 new), and manual verification of both the signed-out redirect and signed-in render of `/account` via a real dev server + browser session.

## Out of scope / follow-ups
- Editing account fields (CD-3 only requires read-only display).
- `mcp.json` contains a live JIRA API token in plaintext, checked into the repo. This predates this change and wasn't introduced or modified by it, but it's worth flagging: the token should be rotated and moved out of source control (e.g. into an untracked env file), independent of CD-3.
