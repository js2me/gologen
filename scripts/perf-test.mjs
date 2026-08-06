import assert from 'node:assert/strict';
import { makeIdentIconDataUrl } from '../dist/index.js';

const ICON_COUNT = 3000;
const MAX_FIRST_PASS_MS = 2000;
const MAX_CACHED_PASS_MS = 500;
const ids = Array.from({ length: ICON_COUNT }, (_, index) => index);

const firstPassStart = performance.now();
const firstPass = ids.map((id) => makeIdentIconDataUrl(id));
const firstPassMs = performance.now() - firstPassStart;

assert.equal(firstPass.length, ICON_COUNT);
assert(firstPass.every((dataUrl) => dataUrl.startsWith('data:image/svg+xml;')));
assert(new Set(firstPass).size > ICON_COUNT * 0.99, 'generated icons are not varied');

const cachedPassStart = performance.now();
const cachedPass = ids.map((id) => makeIdentIconDataUrl(id));
const cachedPassMs = performance.now() - cachedPassStart;

assert.deepEqual(cachedPass, firstPass, 'cached output changed');
assert(
  firstPassMs < MAX_FIRST_PASS_MS,
  `first pass took ${firstPassMs.toFixed(1)}ms (limit: ${MAX_FIRST_PASS_MS}ms)`,
);
assert(
  cachedPassMs < MAX_CACHED_PASS_MS,
  `cached pass took ${cachedPassMs.toFixed(1)}ms (limit: ${MAX_CACHED_PASS_MS}ms)`,
);

console.log(
  `Performance OK: ${ICON_COUNT} unique icons in ${firstPassMs.toFixed(1)}ms, ` +
    `cached pass in ${cachedPassMs.toFixed(1)}ms`,
);
