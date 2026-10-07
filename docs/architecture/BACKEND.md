# Backend Architecture

This describes the current checkout, not a claim of production completeness.
The backend is a CommonJS Node.js / Express modular monolith with Prisma and
PostgreSQL. Domain modules share one process and database; they are not separately
deployable services. The frontend is outside this document's ownership.

## Runtime And Boundaries

- `BackEnd/src/server.js` loads dotenv, creates the HTTP server, initializes
  Socket.IO, and listens on `PORT` (default 5005).
- `src/app.js` composes Swagger, Helmet, CORS, a global IP limiter, JSON parsing,
  static storage, `/api` routing, and final error handling. Importing the app does
  not initialize sockets. Swagger is mounted before the global security stack.
- `src/routes/index.js` is the authoritative mount inventory. Route files define
  endpoint paths and middleware; controllers adapt HTTP inputs and response
  envelopes; services implement domain rules and query Prisma directly.
- `src/config/prisma.js` owns the shared Prisma client. `config/db.js` is empty;
  it is not another persistence implementation.
- `utils/responseHelper.js`, `catchAsync.js`, `AppError.js`, `pagination.js`,
  `generateTokens.js`, `email.js`, and `logger.js` provide shared infrastructure.
  Service-level authorization is still required when calls bypass HTTP routes.

## Module Ownership

All prefixes below are relative to `/api` and verified against the central router.

| Module | Mounted APIs | Service and data responsibility |
| --- | --- | --- |
| `auth` | `/auth` | Registration, login, profile, avatar, password and OTP flows; `auth.service.js`, User, Role, PasswordResetOTP |
| `users` | `/users` | Mentor discovery, user search, activity in `user.service.js`; mentor application submission, listing, review and latest lookup in `mentorApplication.service.js` |
| `admin` | `/admin`, `/reports`, `/resources/:resourceId/report` | User and role management, platform aggregates and audit reads in `admin.service.js`; resource reports currently use `report.controller.js` directly, without a dedicated report service |
| `courses` | `/categories`, `/courses`, `/modules`, `/lessons`, `/resources` | Category/course/module/lesson/resource services; curriculum, publishing and resource metadata/files |
| `learning` | `/assignments`, `/enrollments`, `/progress`, `/reviews`, `/submissions` | Assignment, enrollment, progress, review and submission services; learning participation, grading and progress |
| `practice` | `/problems`, `/coding-submissions`, `/testcases` | Problem/test-case/submission services; code execution delegates through `codeExecution.service.js` to `judge0.service.js` |
| `community` | `/chat`, `/discussions`, `/follows`, `/notifications` | Conversations, workspaces, channels, messages/replies, discussions, follow relationships/requests, and notification services; realtime chat gateway shares chat service rules |
| `documents` | `/documents` | PDF validation, metadata, local files, extraction/chunking, Ollama embeddings and Redis vector indexing in `document.service.js` |
| `ai` | `/ai` | Authenticated streaming chat, image verification and metadata stripping; retrieval/LLM in `ai.service.js`, image handling in controller |
| `contact` | `/contact` | Public form submission and admin listing through contact controller/service |

`practice/labs.routes.js` and `practice/practiceStats.routes.js` exist but are not
mounted by `routes/index.js`; their file presence does not make those APIs live.
`compiler.service.js` simulates Java execution and is not the production Judge0
execution path. Prisma models such as LiveSession do not imply a mounted API.

## Mentor Application Contract

Routes and response envelopes remain unchanged:

| Method | Path under `/api/users` | Access |
| --- | --- | --- |
| POST | `/apply-mentor` | Authenticated; service permits only active students |
| GET | `/my-mentor-application` | Authenticated; latest application or null |
| GET | `/mentor-applications` | Authenticated admin, checked in controller |
| PUT | `/mentor-applications/:id/status` | Authenticated admin, checked in controller |

`user.service.js` re-exports all four application methods for existing consumers.
The user controller calls the focused application service directly. Application
text is trimmed and bounded: bio/experience 10,000 characters, skills 2,000.
Review IDs must be positive PostgreSQL Int values and decisions must be APPROVED
or REJECTED. Existing known submission errors remain HTTP 400; repeat reviews are
409 and missing applications are 404.

Submission locks the applicant's `users` row with parameterized `FOR UPDATE`
inside a transaction before checking for pending applications. Review claims a
PENDING row using a conditional update; concurrent decisions cannot both commit.
Approval conditionally promotes only an active student, so a concurrent admin
role change/deactivation is not overwritten. A failed promotion rolls back the
claimed application status. Future admin changes after approval remain possible.
There is no reviewer identity, decision reason, review timestamp, or durable
review audit implemented here. The pending check is a service protocol, not a
database unique constraint; other writers must follow that protocol.

Queue pagination defaults to page 1 / limit 20, rejects invalid values, caps page
at 100,000 and limit at 100, and bounds search at 200 characters. Filters are ALL,
PENDING, APPROVED, REJECTED. Rows sort by createdAt then id descending; latest
lookup uses the same tie-breaker. Rows/count share a transaction but no explicit
snapshot isolation, so concurrent writes can still affect count consistency.
Offset pages can shift between requests and deep offsets/contains searches remain
costly. The shared pagination helper coerces/clamps input instead, so it is not
used to silently change this strict queue contract.

## Persistence And Integrations

`prisma/schema.prisma` is the authoritative model/relationship/map definition;
`prisma/migrations` records schema changes. Model families include identities and
OTP; categories/courses/modules/lessons/resources; enrollments/progress/reviews;
assignments/submissions; coding problems/test cases/tags/submissions; discussions;
notifications; conversations/workspaces/channels/membership/messages; follows;
reports, documents, contacts, live sessions, audit logs and mentor applications.
The existing application queue migration adds `(status, created_at, id)` and
`(user_id, status)` indexes. Applying migrations is separate from this refactor.

Local resources resolve through `config/storage.js` and `RESOURCE_STORAGE_PATH`;
uploads live under `BackEnd/uploads`. Nodemailer handles outbound email. Judge0
handles sandboxed code execution externally, with request timeouts and provider
configuration required. AI uses Ollama, Redis vector search and optional Tavily
web fallback. These dependencies must be operated independently; they are not
made available merely by starting Express.

## Middleware And Gateways

`authMiddleware.authenticate` verifies Bearer JWTs and reloads account activity
and role from PostgreSQL for each request. `authorize` gates route roles; domain
services add ownership/membership checks. Users' public mentor routes use their
own optional token decoding, not full account authentication. `validators.js`
and domain validation files have different contracts; validation is not uniform.
`errorMiddleware.js` maps selected Prisma and upload errors and hides generic
500 messages; some controllers handle errors locally instead.

Multer policies vary: image middleware 10 MB, avatar route 5 MB, PDF upload 50 MB
with extension/MIME checks plus parser validation, resource upload 500 MB, AI
image upload 10 MB in memory. These are not malware scanning or tenant quotas.

`config/socket.js` owns Socket.IO initialization, handshake JWT/account checks,
personal rooms, and process-local online presence. `community/chat.gateway.js`
owns joins/leaves, send/edit/delete, typing, read receipts, acknowledgments and
recipient delivery checks. It rechecks token/account/membership for events and
recipients, calling `chat.service.js` for domain operations. HTTP routes and
gateway events are distinct transport adapters, not separate chat backends.

## Scaling And Security Limits

- No distributed Socket.IO adapter is configured; presence and rooms are local
  to one process. Multi-instance deployment needs coordinated delivery/presence.
  Recipient authorization performs database work per recipient and increases
  fan-out cost. HTTP rate limiting does not itself rate-limit socket events.
- Rate-limit stores are process-local by default. Global HTTP policy is 150
  requests per IP per 15 minutes; auth has additional route-specific limiting.
  Proxy/trust configuration and shared limits require deployment review.
- `/uploads` and `/resources` are served statically without per-file auth. API
  ownership checks do not protect direct file URLs. CORS is not authorization.
- PDF indexing is launched in-process without a durable queue, retry ledger or
  recovery worker. Database, filesystem and Redis changes are not one atomic
  transaction. Redis cleanup uses KEYS; large indexes need a safer scan strategy.
- Some collections and aggregates remain unbounded. Connection pools, query
  plans, cursor pagination, quotas and load budgets are not established here.
- Admin-created users currently receive a hard-coded default password when one
  is omitted, with a must-change flag. Production provisioning requires review;
  this document does not certify that every endpoint enforces that flag.
- Secrets/config validation, distributed job ownership, comprehensive audit
  coverage, malware scanning, backup/restore verification, observability and
  deployment hardening are not completed by this service extraction.

## Verification

Run from `BackEnd`: `node scripts/mentor-application-queue.cjs` (21 checks),
`node scripts/mentor-lifecycle.cjs` (49 checks when its conditional course fixture
exists), and `node scripts/mentor-application-service.cjs` (focused regressions).
The lifecycle script requires a backend on localhost:5005 and existing fixture
accounts; the queue script starts an ephemeral HTTP listener. These are database
integration scripts that create and clean up temporary records, not seed/reset
commands. `npm test` is still a placeholder. They do not establish full-module,
provider, browser, security or load-test coverage.
