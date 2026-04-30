/**
 * @savantoai/ai-sdk — Auto-generated from the Savanto OpenAPI spec.
 *
 * Usage:
 *   import { createClient, searchProducts } from '@savantoai/ai-sdk';
 *
 *   const client = createClient({
 *     baseUrl: 'https://api.savanto.ai',
 *     auth: 'if_sk_...',
 *   });
 *
 *   const { data } = await searchProducts({ client, body: { query: 'shoes' } });
 */

export type {
  Client,
  ClientOptions,
  Config,
  Options,
  RequestOptions,
  RequestResult,
} from './generated/client';
export { createClient, createConfig } from './generated/client';
export { client } from './generated/client.gen';

export * from './generated/sdk.gen';
export type * from './generated/types.gen';

export { workspaceIdFromUrl } from './util';
