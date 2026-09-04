/**
 * The search index for en, as a static file at /learn-index.en.json.
 *
 * At the site root with this name on purpose: nginx matches one
 * `location /learn-index.` prefix for all three, where three paths under
 * /learn/ would have needed a regex location. Fetched on the first open of the
 * search palette and never on page load.
 */
import type { APIRoute } from 'astro';
import { buildIndex } from '../lib/learn-index';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildIndex('en')), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
