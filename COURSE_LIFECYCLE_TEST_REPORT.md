# Course Lifecycle Verification

Date: 2026-10-01

## Passed

- API lifecycle suite: 38 successful checks covering mentor/admin login, student and other-mentor restrictions, creation, duplicate codes, invalid values, thumbnail upload/removal, category changes, publication/unpublication, module and lesson creation/update/delete, student enrollment, mentor deletion requests, admin updates, and admin deletion.
- Deleting an enrolled course with remaining lessons succeeds; course, modules, and enrollments are removed; subsequent course lookup returns 404.
- Manual browser: empty-form validation, course creation with category, name/duration/status update, reload persistence, module creation, lesson creation, and lesson content entry.
- Manual browser delete returned to the catalog. Database verification confirmed the temporary course and its curriculum were removed.
- Course-builder mobile layout at 390px had no page-level horizontal overflow.
- TypeScript and Vite production build passed.

## Fixed

- The create button claimed to publish but saved a draft. Creation now has an explicit Draft/Published control.
- Category selection stored a number while its UI compared strings.
- Save bypassed required-field and numeric validation.
- Backend validation failures and duplicate/ownership errors returned incorrect server errors.
- Empty categories could become invalid numbers; they now support explicit removal.
- External thumbnail URLs were prefixed with the local API host; thumbnail removal was not saved.
- Course deletion failed with enrollment/workspace references; deletion now handles related records in a transaction.
- Mentor deletion requests wrote a nonexistent notification metadata field; notifications now link to the course.
- Lesson creation did not expose content/video URL fields.
- Course changes/deletions did not invalidate catalog and dashboard caches.
- Lesson delete controls were hidden on touch devices; they now remain visible and have accessible names.

Only temporary QA courses were modified or deleted. Automated test notifications and the uploaded test image were cleaned up. External video playback and physical-device testing were not part of this pass.

Run the lifecycle suite from BackEnd with `node scripts/course-lifecycle.cjs`. It creates and removes its own temporary records.
