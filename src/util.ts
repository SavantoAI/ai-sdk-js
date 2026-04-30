/**
 * Convert a URL or domain to a normalized workspace ID.
 *
 * @example
 * workspaceIdFromUrl('https://mystore.com')       // 'mystore-com'
 * workspaceIdFromUrl('my-store.myshopify.com')     // 'my-store-myshopify-com'
 * workspaceIdFromUrl('example.com/path')           // 'example-com'
 */
export function workspaceIdFromUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.replace(/\./g, '-').toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/[^a-z0-9-]/gi, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}
