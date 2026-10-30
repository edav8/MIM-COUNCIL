import { env } from 'cloudflare:workers';
export function getDatabase() {
  if (!env.DB) throw new Error('The ideas inbox is temporarily unavailable.');
  return env.DB;
}
