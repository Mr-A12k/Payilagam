# Payilagam UI design contract

Snapshot: 2026-10-02. **Current** describes code read in this working tree. **Intended** is the refresh direction, not a claim of completed implementation or passed tests.

## Current architecture

- `FrontEnd/src/app/AppProviders.tsx` composes Redux, TanStack React Query, and shared `ThemeProvider`. Redux currently registers only `auth`; do not describe it as the course cache.
- `App.tsx` owns BrowserRouter and SocketProvider. `routes/AppRoutes.tsx` uses lazy pages, RouteBoundary, ProtectedRoute, PublicLayout, and SidebarLayout. Public course pages switch shells with authentication; learning and coding arenas intentionally run without the normal shell.
- `components/ui/` contains reusable controls (including Radix-backed dialogs/selects and Lucide icons). `components/workspace/Workspace.tsx` supplies WorkspacePage, PageHeader, LoadingState, and EmptyState; `styles/workspace.css` supplies shared layout. These are separate existing directories, not a new `ui/components/workspace` hierarchy.
- `app/queryClient.ts`: five-minute stale time, one query retry, no window-focus refetch. Course query hooks use filter-aware keys. Not every page uses query hooks: CourseDetail and Settings also perform direct HTTP calls and hold local state.
- `api/commonServices.ts` returns Axios responses, not an unwrapped domain object. `api/axiosConfig.ts` uses `VITE_API_URL`, adds the local token as Bearer authorization, removes stored credentials on 401, and emits error toasts. The catalog currently reads `response.data.data` and `response.data.pagination`.
- `BackEnd/src/app.js` mounts Express APIs at `/api`; `src/routes/index.js` delegates domain routes. Controllers/services and Prisma's PostgreSQL schema own persisted data. UI visibility never replaces backend authorization.
- `context/ThemeContext.tsx` supports light, dark, ocean, rose, graphite, forest, ember. It sets `data-theme` for brightness and `data-palette` for palette. Actual fallback is **light**, despite stale dark-default comments. It stores preferences locally and attempts authenticated `PUT /auth/profile`; persistence failures currently only warn.

## Intended design invariants

1. Build a neutral, compact learning workspace: restrained typography, clear dividers, dense readable lists, no marketing hero or nested decorative cards. Use restrained violet actions for default light/dark themes through semantic tokens, with separately verified contrast in each palette.
2. Preserve existing graphite, dark, and light experiences and all other registered palettes. Do not rename saved theme values or force one theme. Keep ThemeContext as the only theme coordinator; define action colors centrally rather than hard-coding accents per page.
3. Extend SidebarLayout and the shared workspace/UI components. Preserve public and fullscreen route exceptions, existing route URLs, role restrictions, active navigation, and back-navigation behavior.
4. Retain collapsible desktop navigation and mobile drawer behavior. Keep Escape dismissal, focus containment/restoration, active-link semantics, and accessible icon labels. Stack toolbars/forms on narrow screens; allow horizontal scrolling only in genuinely wide data/code regions.
5. Use visible labels, correct input types/autocomplete, linked inline errors, pending/disabled states, and visible keyboard focus. Reuse Radix primitives for dialogs, menus, and popovers; verify trigger state, Escape, dismissal, viewport collision, and focus return. Never use a toast as the sole field-error explanation.
6. Courses: provide Gallery, List, and Resources tabs with URL-persisted view/filter state; refine the existing catalog's search, category/level filters, sorting, pagination, real thumbnails, and detail/enrollment actions. Preserve mentor ownership rules and builder workflows. Missing price/rating/duration must remain unknown, not fabricated zeros or sample content.
7. Settings: refresh profile/avatar, security, role-specific mentor details/application, and appearance surfaces coherently. Keep forms independently understandable; preserve dirty input on failure and distinguish local theme selection from confirmed server persistence.
8. Backend data remains authoritative for courses, enrollment, progress, profile, permissions, and counts. Keep transient filters, drawers, and unsaved form values local. Reconcile successful writes with returned data/refetch/query invalidation; do not create a parallel Redux domain store or cosmetic success state.
9. Preserve loading, empty, filtered-empty, error/retry, forbidden, pending, and success states. Do not silently convert failed requests to empty results. Avoid duplicate page/interceptor error toasts. A timeout is not proof that a write failed; reconcile before retrying non-idempotent operations.

## Existing API examples

Paths below include Express's `/api` prefix; frontend constants omit that prefix and rely on the configured API base URL.

| Operation | Existing endpoint | UI obligation |
| --- | --- | --- |
| Published catalog | `GET /api/courses/published` | Preserve server filtering/pagination |
| Course details | `GET /api/courses/:id` | Preserve existing identifier semantics |
| Enroll | `POST /api/enrollments/:courseId/enroll` | Confirm server result before success |
| Profile and theme | `PUT /api/auth/profile` | Reconcile profile; disclose theme-save failure |
| Password | `PUT /api/auth/change-password` | Keep credentials out of logs/persistence |
| Avatar | `POST` or `DELETE /api/auth/profile/avatar` | Retain upload/delete validation |

Check domain route/controller contracts when changing callers; this is not a new API schema or a claim that every endpoint has the same envelope.

## Proposed acceptance gates

- Verify guest, student, mentor, admin, and unauthorized deep links; preserve fullscreen arenas.
- Exercise courses, detail/enrollment, builder, profile/avatar, password, and theme persistence with real API responses, missing fields, failures, and reloads.
- Inspect 360, 768, and 1440 px widths plus 200% zoom across light/dark/graphite; smoke-check remaining palettes. No clipped text, obscured focus, or unexpected page overflow.
- Keyboard-check navigation, forms, menus, selects, dialogs, and popovers. Target 4.5:1 normal-text contrast and 3:1 control/focus contrast as design criteria, not certified conformance.
- Run relevant frontend build/type checks and focused interaction tests before rollout. This documentation task did **not** run application tests, builds, browser checks, or accessibility audits.

## Review decisions

Confirm palette-specific action contrast, cross-page query invalidation conventions, theme persistence failure UX, and review/rollout owners before implementation. Sequence: shared tokens and shell, controls and states, courses/settings, then remaining workspace pages. Revert UI changes without schema migrations if acceptance gates fail.

## Source map

Read implementation sources: `FrontEnd/src/App.tsx`, `app/AppProviders.tsx`, `app/queryClient.ts`, `routes/AppRoutes.tsx`, `store/store.ts`, `context/ThemeContext.tsx`, `components/SidebarLayout.tsx`, `components/workspace/Workspace.tsx`, `components/ui/Input.tsx`, `components/ui/dialog.tsx`, `styles/workspace.css`, `hooks/queries/useCourses.ts`, `api/{constants,commonServices,axiosConfig}.ts`, `pages/courses/{CourseCatalog,CourseDetail}.tsx`, `pages/settings/Settings.tsx`; `BackEnd/src/{app.js,routes/index.js,modules/courses/course.routes.js}` and `BackEnd/prisma/schema.prisma`.

Paths in this source map are repository-relative. The DOCX uses the user-selected System Design retained reference; structural validation and render limitations are recorded in `qa/`.
