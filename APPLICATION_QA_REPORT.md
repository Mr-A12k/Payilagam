# Application QA Report

Tested locally October 1-2, 2026. This is broad regression coverage, not a claim of exhaustive testing or production readiness.

## Results

| Suite | Passing checks | Coverage |
| --- | ---: | --- |
| platform-lifecycle.cjs | 109 | Auth, profile, OTP registration/reset, role restrictions, avatars, contact privacy, admin reads, categories, resources, reports, PDF upload/delete, coding permissions, AI image tools |
| learning-lifecycle.cjs | 103 | Assignments, submissions, grading, enrollment, progress, reviews, ownership, invalid inputs, numeric/CUID/UUID enrollment IDs |
| community-lifecycle.cjs | 232 | 130 API + 102 Socket.IO checks: conversations, messages, workspaces, channels, discussions, replies, notifications, room authorization, receipts, revoked membership, handshake validation |
| course-lifecycle.cjs | 38 | Draft creation, updates, publication, curriculum, enrollment, deletion requests, cascading deletion |
| mentor-lifecycle.cjs | 49 | Admin-created mentors, updates, deactivation/reactivation, applications, approval/rejection, student access |
| network-lifecycle.cjs | 60 | Follow requests, approvals/rejections, cancellation, unfollow/removal, authorization, concurrent decisions |
| practice-execution.cjs | 52 | Local Judge0-compatible HTTP fixture: execution verdicts, submissions, hidden-case sanitation, stats, leaderboard, invalid requests |
| **Total** | **643** | **541 API checks + 102 socket checks** |

The latest frontend TypeScript check and production build passed. Scoped `git diff --check` passed. Vite reports a large-bundle warning; this is not a build failure.

## Fixes

- Restricted private contact submissions to admins and repaired report queries that referenced nonexistent Prisma relations.
- Normalized resource/avatar storage paths, repaired PDF parsing for the installed library, bounded Redis connection failures, and improved upload validation and cleanup.
- Replaced the fixed signup OTP with generated, expiring, attempt-limited OTPs; blocked public registration as admin/mentor and corrected expected authentication error statuses.
- Corrected assignment/submission/enrollment/progress/review authorization and input validation, including UUID enrollment support and stale progress cleanup.
- Hardened chat API and socket membership checks, read receipts, message ownership, inactive/deleted-account handshakes, and duplicate delivery.
- Removed fake successful coding verdicts from the active execution path, enforced supported languages, preserved runtime/time-limit verdicts, and prevented hidden test details leaking through stored output.
- Restored document upload/delete controls for admins and mentors by using the normalized role string; fixed document URLs to use the configured API origin and added a separate load-error/retry state.
- Fixed fresh unauthenticated protected pages getting stuck on "Authenticating"; logout now removes only auth storage keys, and forced login clears loading.
- Signup now collects unique usernames/mobile numbers and accepts the generated six-digit OTP.

## Browser Checks

`browser-module-smoke-results.json` contains 48 route/viewport observations: 30 desktop route entries at 1440px, 10 primary workflow entries at 390px, and 8 at 768px. The signed-in home entry redirects to admin as expected. Observed document width did not exceed viewport width. These are rendering/navigation smoke checks, not full interactive mutation coverage on every page.

Additional manual checks verified fresh-session login redirection, seeded admin sign-in, the document upload dialog, mobile navigation, and required signup fields at 390px. The document dialog stayed within the phone viewport. Temporary viewport overrides were reset. Proof: `payilagam-documents-final-verified.jpg` and `payilagam-document-controls-verified.jpg`.

## Running Tests

Run `node scripts/<suite-name>` from `BackEnd`. The platform, learning, community, and practice-execution suites create isolated test servers; course, mentor, and network suites use the local API on port 5005. Existing rate limits remain enabled, so shared-server runs may need to wait for their rate-limit window. Use a disposable development database, not production. Seed scripts are not required or executed. Generated fixtures are cleaned up; seeded accounts are preserved.

## Remaining Limits And Launch Checks

- Real SMTP delivery was not tested: email calls were captured in local suites. Configure and verify SMTP before launch. Production now refuses the development-only Ethereal fallback when SMTP is missing.
- Real Judge0 execution was not tested; the local fixture verifies the integration contract, not compilation, isolation, or execution correctness. Unconfigured execution returns 503.
- Successful Redis/Ollama document indexing and AI chat generation were not verified. PDF storage/deletion and unavailable-index handling were tested; the current document schema cannot distinguish failed indexing from pending processing.
- Labs are a planned/catalog experience. Dormant backend lab routes are not mounted and reference a model absent from the Prisma schema; they were not activated or represented as working execution flows.
- Quiz-specific completion, physical-device/browser compatibility, email deliverability, load/flood testing, distributed socket adapters, deployment, and exhaustive end-to-end UI mutations remain outside verified coverage.
- Existing unrelated working-tree changes were preserved. No deployment or commit was performed.
