# Frontend Architecture

Payilagam uses React 19, TypeScript, Vite, React Router, Redux for authentication and TanStack Query for remote data. This is an incremental modularization of the existing application, not a framework migration.

## Ownership

| Directory | Responsibility |
| --- | --- |
| `src/app` | Provider composition, shared query defaults and role-aware workspace navigation |
| `src/routes` | Route declarations, role guards and lazy page loading |
| `src/pages` | Route screens grouped by product domain |
| `src/features` | Domain-specific API contracts and operations; mentor applications is the first extracted feature |
| `src/components/ui` | Accessible Radix/shadcn primitives and shared controls |
| `src/components/workspace` | Page header, page width, loading and empty-state presentation |
| `src/api` | Axios configuration and HTTP helpers |
| `src/store` | Authentication and other existing Redux slices |
| `src/context` | Theme and socket lifecycle |
| `src/styles` | Semantic palettes, legacy compatibility and workspace layout |

## Data Flow

A route guard checks authenticated access before rendering a lazy screen. Screens read backend state through Query. Domain API functions use the shared Axios client. Mutations invalidate the affected query keys and render actionable errors. Authorization remains enforced by the backend; hidden controls are not a security boundary.

## Design System

Graphite remains the requested visual direction. Seven existing palettes share semantic backgrounds, text, borders, action and status tokens. Page headers use a restrained type scale; repeated records can use cards, while larger page sections use dividers and unframed layout. Inputs and Select menus retain real keyboard/focus behavior. UI state must distinguish loading, empty and failed requests.

Use `WorkspacePage`, `PageHeader`, `LoadingState` and `EmptyState` for new operational screens. Domain-specific editors such as chat and course creation retain focused layouts instead of being forced into a generic page wrapper.

## Module Boundaries

Keep HTTP details in a domain API file when a feature has multiple operations or consumers. Keep view state local unless it is shared across screens. Do not move all existing modules merely to achieve a different folder tree; extract when behavior can be covered by regression tests. Existing screens that have not yet been extracted still use `api/commonServices` directly.

## Performance

Routes load on demand, including heavy practice, chat and document screens. Route-level Suspense keeps the surrounding shell mounted, and screen error boundaries provide recovery. The bundled output must be measured after changes; code splitting does not establish production performance or accessibility compliance by itself.

## Verification

`npm run build` checks TypeScript and bundles the app. Backend lifecycle scripts verify API contracts with disposable local fixtures. Manual browser checks cover desktop/mobile layout, navigation, Select controls, dialogs and key screen states. External execution and AI services require separate configured-service checks.

## Remaining Work

Not every legacy page has been migrated to feature APIs. Some public informational and full-screen editor screens still use older styling helpers. The compatibility stylesheet remains until those consumers can be migrated without regressions. Do not claim that this folder organization alone makes the entire platform production-ready.
