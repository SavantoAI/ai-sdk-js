# @savantoai/ai-sdk

Official JavaScript/TypeScript SDK for [Savanto](https://savanto.ai) — AI-powered search, chat, recommendations, and knowledge base management.

Auto-generated from the [Savanto OpenAPI spec](https://savanto.ai/docs/api). Every endpoint is fully typed with zero manual maintenance.

## Installation

```bash
npm install @savantoai/ai-sdk
```

Requires **Node.js >= 18** (uses native `fetch`). Works in modern browsers with no polyfills.

## Quick Start

```typescript
import { createClient, searchProducts, chat } from '@savantoai/ai-sdk';

const client = createClient({
  baseUrl: 'https://api.savanto.ai',
  auth: 'if_sk_...',
});

// Search products
const { data } = await searchProducts({
  client,
  body: { query: 'blue running shoes', limit: 10 },
});
console.log(data);

// AI chat
const { data: chatResponse } = await chat({
  client,
  body: { message: 'What shoes do you recommend?', threadId: 'thread-1' },
});
```

## Authentication

Pass your API key via the `auth` option on the client:

```typescript
const client = createClient({
  baseUrl: 'https://api.savanto.ai',
  auth: 'if_sk_...',
});
```

The client automatically sends it as `Authorization: Bearer <key>` on every request.

| Key Type | Prefix | Use |
|----------|--------|-----|
| **Secret** | `if_sk_` | Server-side only. Full access to all endpoints. |
| **Publishable** | `if_pk_` | Safe for client-side. Limited to search, chat, feedback, and prompts. |

## Examples

### Products

```typescript
import {
  searchProducts,
  upsertProduct,
  getProduct,
  deleteProduct,
  bulkUpsertProducts,
  bulkDeleteProducts,
  listProductIds,
} from '@savantoai/ai-sdk';

// Search
const { data } = await searchProducts({
  client,
  body: { query: 'warm jacket', limit: 10 },
});

// Upsert
await upsertProduct({
  client,
  body: { id: 'prod-1', name: 'Running Shoe', price: 99.99 },
});

// Get / Delete
const { data: product } = await getProduct({ client, path: { id: 'prod-1' } });
await deleteProduct({ client, path: { id: 'prod-1' } });

// Bulk operations
await bulkUpsertProducts({
  client,
  body: { items: [{ id: 'p1', name: 'Shoe' }, { id: 'p2', name: 'Boot' }] },
});
await bulkDeleteProducts({ client, body: { ids: ['p1', 'p2'] } });

// List IDs
const { data: ids } = await listProductIds({ client });
```

### Chat

```typescript
import { chat } from '@savantoai/ai-sdk';

// `throwOnError: true` makes `response` non-optional so `response.body` is
// safe to read directly. Without it (since 2.2.0) `response` is typed as
// `Response | undefined`. See CHANGELOG.md for details.
const { data, response } = await chat({
  client,
  body: {
    message: 'What is your return policy?',
    threadId: 'thread-1',
    stream: true,
  },
  throwOnError: true,
});

// For streaming (NDJSON), read the response body directly:
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const lines = decoder.decode(value).split('\n').filter(Boolean);
  for (const line of lines) {
    const chunk = JSON.parse(line);
    if (chunk.type === 'text_delta') process.stdout.write(chunk.data);
  }
}
```

### Posts

Same pattern as products — `upsertPost`, `searchPosts`, `getPost`, `deletePost`, `bulkUpsertPosts`, `bulkDeletePosts`, `listPostIds`.

```typescript
import { searchPosts, upsertPost } from '@savantoai/ai-sdk';

await upsertPost({
  client,
  body: { id: 'post-1', title: 'Return Policy', content: '...' },
});

const { data } = await searchPosts({
  client,
  body: { query: 'shipping policy' },
});
```

### Feedback

```typescript
import { submitFeedback, listFeedback } from '@savantoai/ai-sdk';

// Submit (publishable key safe)
await submitFeedback({
  client,
  body: { threadId: 'thread-1', messageIndex: 0, rating: 5, comment: 'Helpful!' },
});

// List (secret key)
const { data } = await listFeedback({ client });
```

### Threads

```typescript
import { searchThreads, getThreadMessages, deleteThread } from '@savantoai/ai-sdk';

const { data } = await searchThreads({
  client,
  body: { query: 'returns' },
});

const { data: messages } = await getThreadMessages({ client, path: { id: 'thread-1' } });
await deleteThread({ client, path: { id: 'thread-1' } });
```

### Webhooks

```typescript
import { createWebhook, listWebhooks, testWebhook } from '@savantoai/ai-sdk';

await createWebhook({
  client,
  body: { name: 'Inventory sync', url: 'https://example.com/hook', events: ['product.upsert'] },
});

const { data } = await listWebhooks({ client });
const { data: result } = await testWebhook({ client, path: { id: 'webhook-1' } });
```

### Recommendations

```typescript
import { getProductRecommendations } from '@savantoai/ai-sdk';

const { data } = await getProductRecommendations({
  client,
  body: { productId: 'prod-1', maxRecommendations: 5 },
});
```

### Crawl & Scrape

```typescript
import { startCrawl, getCrawlStatus, scrapePage } from '@savantoai/ai-sdk';

await startCrawl({ client, body: { url: 'https://mystore.com' } });
const { data } = await getCrawlStatus({ client, path: { id: 'crawl-abc' } });
await scrapePage({ client, body: { url: 'https://mystore.com/about' } });
```

## Response Format

Every function returns `{ data, error, response }`:

```typescript
const result = await searchProducts({ client, body: { query: 'shoes' } });

if (result.error) {
  // Typed error: { error: { message: string, code: string } }
  console.error(result.error);
} else {
  console.log(result.data);
}
```

To throw on errors instead of returning them:

```typescript
const { data } = await searchProducts({
  client,
  body: { query: 'shoes' },
  throwOnError: true,
});
```

## TypeScript

All types are exported:

```typescript
import type {
  Product,
  ProductInput,
  ProductSearchRequest,
  Post,
  ChatRequest,
  ChatStreamChunk,
  Taxonomy,
  Prompt,
  FeedbackSubmission,
  ErrorResponse,
} from '@savantoai/ai-sdk';
```

## Utilities

```typescript
import { workspaceIdFromUrl } from '@savantoai/ai-sdk';

workspaceIdFromUrl('https://mystore.com');       // 'mystore-com'
workspaceIdFromUrl('my-store.myshopify.com');     // 'my-store-myshopify-com'
```

## API Reference

Full endpoint documentation with request/response schemas:

**[savanto.ai/docs/api](https://savanto.ai/docs/api)**

## Versioning & changelog

See [CHANGELOG.md](./CHANGELOG.md) for per-version migration notes,
including the TypeScript-level breaking changes in `2.2.0`. Type
narrowings and generator-driven shape changes are treated as major.

## Regeneration

The SDK is auto-generated from the OpenAPI spec. To regenerate after API changes:

```bash
cd cloud && npm run openapi          # extract spec to cloud/openapi.json
cd sdks/javascript && npm run generate  # regenerate src/generated/
```

## License

MIT
