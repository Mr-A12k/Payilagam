# Network Lifecycle Test Report

Date: 2026-10-01

## Verification

- 60 API checks passed with generated disposable student accounts and short-lived test tokens exercising normal authentication middleware.
- Covered sending requests, pending/sent lists, approval, rejection, resending after rejection and unfollow, cancellation, direct-follow compatibility, follower/following lists, unfollow, and removing followers.
- Checked missing authentication, invalid IDs (including integer overflow), self-follow, duplicate requests/connections, nonexistent/inactive targets, unauthorized response/cancellation, and repeated reviews.
- Concurrent approval/rejection produced one 200 and one 409; the stored follow matched the final request status.
- User search returned other matching users and excluded the searching account.
- Browser: approved one disposable request, declined another, removed its follower connection, sent/cancelled/resent an outgoing request, reloaded after target approval, and unfollowed the resulting connection. Counts and cards refreshed successfully.
- Existing real connections were not removed. Generated accounts, follow requests, and connections were cleaned up.
- Inspected the Network view at 390x844: document scroll width was 390, and tabs, cards, and controls fit. Temporary viewport override was reset.
- Production TypeScript/Vite build passed; existing large-bundle warning remains.

## Fixes

- Correct validation and 400/403/404/409 responses rather than generic server errors.
- Reusing reviewed request records now allows reconnecting after unfollow.
- Request responses require a pending state, with transactional updates preventing conflicting reviews.
- Direct follows reconcile pending requests atomically; approval safely handles an already-existing connection.
- Added authenticated sent-request listing, requester-only cancellation, self-scoped unfollow, and follower removal endpoints.
- Added Sent tab, Cancel request, Unfollow, and Remove follower controls.
- Prevented duplicate UI submissions and stale fetches restoring handled requests.
- Refreshed all connection lists/counts after successful mutations and added visible loading-failure retry.
- Inactive users are excluded from network lists and cannot receive new requests/follows.

## Limits

Physical devices and sustained load were not tested. The race check covers simultaneous review of one request, not every possible distributed concurrency scenario. Existing direct-follow behavior was preserved.

Run from BackEnd: `node scripts/network-lifecycle.cjs`.
