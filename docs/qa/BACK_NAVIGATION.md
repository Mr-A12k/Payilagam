# Back navigation verification

Date: 2026-10-02

## Behavior

Page-level back controls use React Router's current browser history index.
When an earlier app entry exists, they navigate back one entry instead of
pushing a fixed catalog or dashboard route. Direct entries replace the current
entry with the relevant fallback, preventing a back/fallback loop.

Applied to course details, course creation/editing, mentor profiles, lessons,
unavailable practice problems, coming-soon pages, 404 pages, and the default
sign-in/sign-up back control. Explicit sign-in links in password workflows,
pagination, curriculum steps, and mobile chat panes retain their own semantics.

## Browser checks

- Admin overview -> course details -> Go back: returns to `/admin`.
- Catalog -> create course -> reload -> Go back: returns to `/courses`.
- Catalog -> edit course -> Go back: returns to `/courses`.
- Fresh tab at create course -> Go back: falls back to `/admin` for admin.
- Catalog-first creation exposed a category-query cache shape conflict;
  fixed by storing the same API response and selecting the array per observer.
  Creation and editing rendered normally afterward.

No courses were created, edited, or deleted during these navigation checks.
Mentor, lesson, auth, and unavailable-page controls were covered by the shared
navigation implementation and type checking, not individually browser-tested.

## Automated checks

- `node scripts/test-back-navigation.cjs`: passed previous-entry handling,
  direct-entry replacement, malformed history values, and default fallback.
- TypeScript application check: passed.
- Vite production build: passed; existing bundle-size warning remains.

The system npm launcher points at a missing npm CLI. Checks used the installed
Node executable and local TypeScript/Vite binaries without changing tooling.
