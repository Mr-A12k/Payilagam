# Admin Mentor Application Queue

- Dedicated admin-only route: `/admin/mentor-applications` with sidebar navigation.
- Pending requests by default, server-side search/status filtering and 20-row pagination.
- Responsive table/list with a compact review and decision confirmation dialog.
- Transactional approval updates mentor role and profile together; conditional status updates prevent conflicting reviews.
- Applicant-level row locking prevents duplicate concurrent pending submissions.
- Indexed status/date queue and applicant/status lookups; bounded page size and input lengths.
- Local additive index migration applied; production deployment must run Prisma migrations.

## Verification
- Frontend TypeScript and production build passed; existing bundle-size warning remains.
- Queue integration tests: 21 checks passed, including admin authorization, pagination, invalid inputs, duplicate submissions, competing decisions, rejection and reapplication.
- Existing mentor lifecycle regression: 49 checks passed, including approval and mentor profile/role changes.
- Manual browser: seeded admin navigation, pending application visibility, full review details, 390px mobile review, confirmed rejection and rejected filter.
- Disposable test applicants and applications cleaned up; existing applications preserved.

## Scaling Notes
- This uses bounded offset pagination and indexes, not unbounded downloads.
- Substring search and deep offset pagination can still become expensive on very large queues; cursor pagination/search indexing would be the next step after measuring production load.
