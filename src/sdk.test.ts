import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Client } from './generated/client';
import { createClient } from './generated/client';
import {
  chat,
  createApiKey,
  createWebhook,
  deleteProduct,
  getProductRecommendations,
  getSearchAnalytics,
  getThread,
  listApiKeys,
  listPrompts,
  listWebhooks,
  revokeApiKey,
  scrapePage,
  searchPosts,
  searchProducts,
  searchThreads,
  startCrawl,
  submitFeedback,
  upsertProduct,
} from './generated/sdk.gen';

const BASE = 'https://api.savanto.ai';
const TOKEN = 'if_sk_test_key';

let testClient: Client;
let capturedRequests: Request[];

beforeEach(() => {
  capturedRequests = [];
  testClient = createClient({
    baseUrl: BASE,
    auth: TOKEN,
    fetch: (input: Request) => {
      capturedRequests.push(input.clone());
      return Promise.resolve(
        new Response(JSON.stringify({ data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    },
  });
});

afterEach(() => vi.restoreAllMocks());

function lastRequest() {
  return capturedRequests[0];
}

describe('Chat', () => {
  it('POST /chat with message and threadId', async () => {
    await chat({ client: testClient, body: { message: 'hello', threadId: 't1' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/chat`);
    expect(req.method).toBe('POST');
    const body = await req.clone().json();
    expect(body).toMatchObject({ message: 'hello', threadId: 't1' });
  });
});

describe('Products', () => {
  it('POST /products/search', async () => {
    await searchProducts({ client: testClient, body: { text: 'shoes' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/products/search`);
    expect(req.method).toBe('POST');
    const body = await req.clone().json();
    expect(body).toMatchObject({ text: 'shoes' });
  });

  it('POST /products (upsert)', async () => {
    await upsertProduct({ client: testClient, body: { id: 'p1', name: 'Shoe' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/products`);
    expect(req.method).toBe('POST');
  });

  it('DELETE /products/{id}', async () => {
    await deleteProduct({ client: testClient, path: { id: 'p1' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/products/p1`);
    expect(req.method).toBe('DELETE');
  });
});

describe('Posts', () => {
  it('POST /posts/search', async () => {
    await searchPosts({ client: testClient, body: { text: 'guide' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/posts/search`);
    expect(req.method).toBe('POST');
  });
});

describe('Prompts', () => {
  it('GET /prompts', async () => {
    await listPrompts({ client: testClient });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/prompts`);
    expect(req.method).toBe('GET');
  });
});

describe('Feedback', () => {
  it('POST /feedback', async () => {
    await submitFeedback({ client: testClient, body: { threadId: 't1', messageIndex: 0, rating: 'helpful' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/feedback`);
    expect(req.method).toBe('POST');
  });
});

describe('Recommendations', () => {
  it('POST /recommendations/products', async () => {
    await getProductRecommendations({ client: testClient, body: { productId: 'p1' } });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/recommendations/products`);
    expect(req.method).toBe('POST');
  });
});

describe('Webhooks', () => {
  it('GET /webhooks', async () => {
    await listWebhooks({ client: testClient });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/webhooks`);
    expect(req.method).toBe('GET');
  });

  it('POST /webhooks (create)', async () => {
    await createWebhook({
      client: testClient,
      body: { name: 'test', url: 'https://example.com/hook', events: ['product.created'] },
    });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/webhooks`);
    expect(req.method).toBe('POST');
  });
});

describe('API Keys', () => {
  it('GET /provision/keys', async () => {
    await listApiKeys({ client: testClient });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/provision/keys`);
    expect(req.method).toBe('GET');
  });

  it('POST /provision/keys', async () => {
    await createApiKey({ client: testClient, body: { label: 'Test Key' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/provision/keys`);
    expect(req.method).toBe('POST');
  });

  it('POST /provision/keys/{keyId}/revoke', async () => {
    await revokeApiKey({ client: testClient, path: { keyId: 'k1' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/provision/keys/k1/revoke`);
    expect(req.method).toBe('POST');
  });
});

describe('Crawl', () => {
  it('POST /crawl', async () => {
    await startCrawl({ client: testClient, body: { url: 'https://example.com' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/crawl`);
    expect(req.method).toBe('POST');
  });
});

describe('Scrape', () => {
  it('POST /scrape', async () => {
    await scrapePage({ client: testClient, body: { url: 'https://example.com/page' } });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/webhooks/scrape`);
    expect(req.method).toBe('POST');
  });
});

describe('Threads', () => {
  it('GET /threads/{id}', async () => {
    await getThread({ client: testClient, path: { id: 't1' } });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/threads/t1`);
    expect(req.method).toBe('GET');
  });

  it('POST /threads/search', async () => {
    await searchThreads({ client: testClient, body: {} });
    const req = lastRequest();
    expect(req.url).toBe(`${BASE}/threads/search`);
    expect(req.method).toBe('POST');
  });
});

describe('Analytics', () => {
  it('GET /analytics/search', async () => {
    await getSearchAnalytics({ client: testClient });
    const req = lastRequest();
    expect(req.url).toContain(`${BASE}/analytics/search`);
    expect(req.method).toBe('GET');
  });
});

describe('Auth header', () => {
  it('sends Bearer token on all requests', async () => {
    await searchProducts({ client: testClient, body: { text: 'test' } });
    const req = lastRequest();
    expect(req.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
  });
});
