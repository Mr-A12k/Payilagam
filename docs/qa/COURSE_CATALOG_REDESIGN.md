# Course Catalog Redesign

## Delivered

- Replaced the sidebar/category-preview layout with one paginated collection.
- Full-width search and shadcn category, level and sort controls.
- Consistent image-led course tiles, metadata, price, instructor and update date.
- One backend course query per page instead of per-category preview queries.
- Search is debounced; filtering and sorting reset pagination.
- Dedicated `CatalogResources.tsx` retains previews, downloads, reports and sharing.
- `CatalogPdfPreview.tsx` uses the installed React-PDF library, lazy-loaded only
  when needed, with responsive pages, text layer, pagination and download fallback.
- Course creation/editing remain permission-aware; mentors and labs have direct links.

## Bug Fixed

Direct PDF iframes were blocked by backend frame-protection headers. The viewer
now fetches the public file, validates the PDF signature, creates a temporary
object URL and renders through PDF.js. Requests are aborted and object URLs
revoked on cleanup. Preview is limited to 50 MB; larger files remain downloadable.
No backend security headers were weakened.

## Verification

- Frontend TypeScript and production build passed. Existing bundle warning remains.
- Public catalog showed backend count of 18 published courses.
- Pagination displayed 12 courses on page one and 6 on page two.
- Search from page two reset pagination and produced a zero-match empty state.
- Clear filters restored results.
- Data Science selection showed the matching course; level selector tested.
- Name sorting returned alphabetically ordered backend results.
- Seeded admin sign-in verified 12 edit links and the create-course link.
- Sharing dialog opened, cancelled, and disabled submission without required inputs.
- Actual 32-page PDF rendered with visible text; navigation to page two worked.
- Light desktop and Forest public/mobile layouts visually inspected.
- No page-level horizontal overflow at 1440, 768, 390 and 320px.
- Scoped whitespace diff check passed.

No existing data was modified and no report was submitted against a real resource.
Upload submission, video/image preview and all role-specific mutation flows were
not repeated in this focused UI pass. Existing API paths remain unchanged.
No Figma frame was supplied, so this is a project-native design rather than a
pixel-perfect Figma implementation.

Screenshots at the workspace root:
- `payilagam-course-catalog-v2-desktop.jpg`
- `payilagam-course-catalog-v2-mobile.jpg`
- `payilagam-course-resource-pdf-fixed.jpg`
