# Mentor Lifecycle Test Report

Date: 2026-10-01

## Verification

- 49 API checks passed using disposable mentor and applicant accounts.
- Creation, duplicate identity rejection, required-field/email/role validation, updates, public profile persistence, deactivation, and reactivation passed.
- Student and mentor attempts to administer accounts returned 403; unauthenticated creation returned 401.
- Deactivated accounts disappeared from the mentor directory, returned 404 for public profiles, and existing tokens returned 403.
- Application validation, duplicate pending applications, admin-only review, approval, profile transfer, rejection, reapplication, and rejection of repeated reviews passed.
- Student lists are restricted to the course owner or an administrator.
- Browser: created a mentor, edited its name, reloaded to verify persistence, deactivated it, and reactivated it successfully.
- Mobile: inspected the creation dialog at 390x844; fields and actions fit, with document scroll width equal to viewport width. Temporary viewport override was reset.
- Production TypeScript/Vite build passed. Existing large-bundle warning remains.
- git diff --check passed.

## Fixes

- Aligned the backend default account password with the value displayed in the account form.
- Added backend identity, role, boolean, and password validation and frontend whitespace validation.
- Fixed the shadowed error helper on mentor details; invalid, missing, inactive, and non-mentor profiles now fail cleanly.
- Deactivated login now returns 403 instead of 500.
- Mentor application approval transfers bio, skills, and experience atomically with the role/application change.
- Prevented blank applications and repeated reviews of finalized applications.
- Settings handles malformed or non-array skills without crashing and shows retry on application-load errors.
- Replaced the mentor student page's admin-only account management with a course enrollment view and added course-ownership authorization.

## Scope And Cleanup

DELETE intentionally deactivates accounts rather than permanently deleting user/course data. Only generated QA accounts were mutated. Test accounts and applications were removed after verification; existing accounts and courses were preserved.

Repeated initial login attempts reached the existing authentication rate limit. The final repeatable suite uses short-lived locally signed tokens for generated/test accounts, verifies stored password hashes, and exercises normal authentication middleware without disabling rate limiting. A deactivated login returned 403 before the rate limit was reached.

No physical-device testing was performed. Application review was verified through APIs, not a complete separate applicant browser session.

Run from BackEnd: `node scripts/mentor-lifecycle.cjs`.
