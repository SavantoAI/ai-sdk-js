# Changelog

All notable changes to `@savantoai/ai-sdk` will be documented in this file.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and we follow [semantic versioning](https://semver.org/) — see _Versioning policy_
below for the one nuance that applies to a generated SDK.

## Versioning policy

This SDK is fully regenerated from `cloud/openapi.json` by
[`@hey-api/openapi-ts`](https://github.com/hey-api/openapi-ts). Generator and
schema changes can _both_ produce TypeScript-only breaking changes (e.g. a
field gains `| null`, a `body` shape narrows, a top-level helper type
widens) without changing any runtime behaviour. We treat those as breaking
under semver, meaning:

- A change that **narrows** a previously-accepted type (e.g. record →
  concrete interface) is a major version bump.
- A change that **widens** a previously-non-nullable type to include `null`
  is a major version bump.
- Generator-driven changes to top-level re-exports (`Client`, `Config`,
  `Options`, `RequestResult`, `RequestOptions`) are major version bumps.
- Pure additions (new endpoints, new optional fields on requests,
  newly-exported types) are minor.
- Internal regen with no public-surface diff is patch.

`@hey-api/openapi-ts` is pinned to `~0.97.x` (patch range only) in
`package.json` so generator-driven type narrowings can't slip in via a
caret update. Bumping that range is itself a major-version event for the
SDK.

## 3.0.0 — 2026-05-12

### Breaking (TypeScript)

- **`POST /threads/search` `sortBy` enum renamed.** Previously the SDK
  emitted `'timestamp' | 'message_count' | 'token_count'`, but the
  server-side handler routed those names through to OpenSearch
  unchanged — and OpenSearch indexes those fields as `messageCount`
  and `tokenCount`, so the snake_case values produced an invalid
  sort clause that callers either silently ignored or got a 500 on.
  The schema now matches the OpenSearch field names:
  `'timestamp' | 'messageCount' | 'tokenCount'`.
  **Migration**: switch `sortBy: 'message_count'` →
  `sortBy: 'messageCount'`, `'token_count'` → `'tokenCount'`.

### Other

- `UpdateMcpConfigRequest` body has been reopened server-side to
  accept arbitrary string-URL fields (`catchall(z.string().url())`),
  so the generated SDK type now allows forward-compatible MCP URI
  keys (e.g. a future `crmUri`) without an SDK regen. This restores
  some of the pre-2.2.0 surface flagged in the 2.2.0 section below,
  but with per-field URL/length validation instead of `passthrough()`.

## 2.2.0 — 2026-05-07

This release was published as a minor bump but **contains TypeScript-level
breaking changes** that, per the policy above, should have been a major
(`3.0.0`). It is documented here retroactively so consumers know to add
null-guards / update destructuring patterns when upgrading from `2.1.x`.
The next regeneration will be released as `3.0.0`.

### Breaking (TypeScript)

- **~30 fields gained `| null`.** The cloud OpenAPI emitter switched from
  3.0 (`app.doc()`) to 3.1 (`app.doc31()`), so fields whose Zod schema
  uses `.nullable()` now serialise as `type: [..., 'null']`, and the
  generator faithfully reflects that with `T | null`. Affected fields
  include:
  - `ErrorResponse.error.param` (`string` → `string | null`)
  - `Pagination.total` / `Pagination.cursor` (`number | null`,
    `string | null`) — note that `total` lives on every paginated list
    response in the SDK.
  - `Product.price`, `Product.salePrice`, `Product.priceMin`,
    `Product.priceMax`, `Product.weight`, `Product.dimensions`,
    `Product.image`, `Product.attributes`, `Product.rating`, and their
    `ProductInput.*` counterparts.
  - `Post.publishedAt`, `Post.featuredImage`, `Post.attributes`.
  - `TenantStatus.publishableKey`.

  Consumer code like `product.price.toFixed(2)` or
  `if (pagination.total > 0)` will fail TypeScript strict-mode typecheck.
  **Migration**: add nullish guards or use `??` defaults:

  ```ts
  product.price?.toFixed(2);
  if ((pagination.total ?? 0) > 0) { /* … */ }
  ```

- **Five admin/tenant request bodies narrowed from open-record to concrete
  interface.** Cloud PR #138 replaced a `genericBody` Zod schema with six
  typed request schemas. The regenerated SDK reflects this in:
  - `UpdateWorkspaceData.body` → `UpdateWorkspaceRequest`
  - `GetUploadUrlData.body` → `GetUploadUrlRequest`
  - `UpdateMcpConfigData.body` → `UpdateMcpConfigRequest` _(reopened
    server-side after audit #153 — see Unreleased)_
  - `StoreCredentialsData.body` → `StoreLiveAgentCredentialsRequest`
  - `UpdateLiveAgentScheduleData.body` →
    `UpdateLiveAgentScheduleRequest`

  Callers that were passing extra forward-compatible fields will fail
  TypeScript typecheck. **Migration**: drop the extra fields — the cloud
  was always ignoring them; the type just no longer admits them. (The
  one exception, `updateMcpConfig`, has been reopened server-side; see
  _Unreleased_.)

- **`RequestResult.request` / `response` made optional.** Generator bump
  `@hey-api/openapi-ts` `0.94.x` → `0.97.x` changed the success branch of
  `RequestResult` from `& { request: Request; response: Response }` to
  `& { request?: Request; response?: Response }`. The change reflects
  that `request` / `response` can be `undefined` if the failure happened
  before the network call (DNS, request-building, etc.). Consumer code
  like `const { data, response } = await chat(...); response.body` will
  fail strict typecheck. **Migration** — either:

  ```ts
  // Option A — guard with `if (response)`:
  const { data, response } = await chat({ client, body: { … } });
  if (response) { /* response.body, response.status, etc. */ }

  // Option B — opt in to `throwOnError`, which keeps response non-optional:
  const { data, response } = await chat({
    client,
    body: { … },
    throwOnError: true,
  });
  response.body; // typed as `Response`, not `Response | undefined`
  ```

### Other notes

- `@hey-api/openapi-ts` was bumped from `^0.94.x` to `^0.97.1` as part of
  this release. Subsequent versions pin to `~0.97.x` to avoid further
  silent generator-driven type narrowings via caret updates.

## 2.1.0 and earlier

No formal changelog kept prior to 2.2.0. The git history (`sdks/javascript/`)
is the source of truth for older releases.
