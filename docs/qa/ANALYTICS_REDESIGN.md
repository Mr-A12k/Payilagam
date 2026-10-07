# Analytics Redesign

## Structure

- Typed analytics API functions live in `FrontEnd/src/features/analytics/api.ts`.
- Staff reporting lives in `pages/learning/StaffAnalytics.tsx` with scoped CSS.
- `Analytics.tsx` retains the role boundary and existing student progress view.
- Graphite-compatible, unframed metric strip, activity bars, and course table.
- Course search, normalized status filtering, sorting, period selection and refresh.

## Data Scope

Admin course metrics cover the backend's top 20 courses by enrollment, explicitly
labeled in both summary and table. Enrollment activity is platform-wide for the
selected 7/30/90-day period. Filters affect only the course table, not summary
totals or platform activity. Activity bars represent dates returned by the API.
Mentor reports cover up to 100 owned courses; unavailable assignment counts show
a dash rather than fabricated zero. Student progress endpoints remain separate.

## Verification

- TypeScript and production build passed; existing bundle-size warning remains.
- Desktop Graphite layout visually checked.
- Mobile at 390px: two-column metrics and wrapped filters; page width remains
  390px while the 690px table scrolls inside its own region.
- Search with no matches showed the empty state; Clear filters restored records.
- Draft filter returned two draft records from the local dataset.
- Status options collapse mixed-case published values into one option.
- Activity period changed from 30 to 7 days with backend data reloaded.
- Course-name sorting and Refresh analytics checked on live data.
- Independent read-only review identified account cache isolation and mutation
  invalidation problems. Keys now include userId and reuse existing
  `mentorCourses` / `adminCourseAnalytics` invalidation prefixes.

No real course, user, enrollment or application records were changed by UI tests.
No Figma frame was provided; this is a project-design-system implementation,
not a claim of pixel-perfect Figma reproduction. Live mentor/student sessions,
synthetic nonzero multi-day charts, and production load testing are not part of
this focused manual pass.

Screenshots: `payilagam-analytics-redesign-desktop.jpg` and
`payilagam-analytics-redesign-mobile.jpg` at the workspace root.
