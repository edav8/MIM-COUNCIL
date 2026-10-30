import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const homeSource = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
const teamSource = await readFile(new URL('../app/team/page.tsx', import.meta.url), 'utf8');

test('all three homepage team links use full-page navigation', () => {
  const teamLinks = homeSource.match(/<a\b[^>]*href="\/team"[^>]*>/g) ?? [];

  assert.equal(teamLinks.length, 3);
  assert.doesNotMatch(homeSource, /<Link\b[^>]*href="\/team"/);
});

test('both team-page returns use full-page navigation to the ideas page', () => {
  const ideaLinks = teamSource.match(/<a\b[^>]*href="\/"[^>]*>/g) ?? [];

  assert.equal(ideaLinks.length, 2);
  assert.doesNotMatch(teamSource, /<Link\b[^>]*href="\/"/);
});
