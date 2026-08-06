import assert from 'node:assert/strict';
import {
  makeIdentIcon,
  makeIdentIconDataUrl,
} from '../dist/index.js';

const DATA_URL_PREFIX = 'data:image/svg+xml;charset=utf-8,';

function assertValidSvg(svg) {
  assert(svg.startsWith('<svg '), 'result must start with an SVG element');
  assert(svg.endsWith('</svg>'), 'result must end with a closing SVG element');
  assert.match(svg, /viewBox="0 0 24 24"/);
  assert.match(svg, /<defs>/);
  assert(!svg.includes('undefined'), 'SVG must not contain undefined values');
  assert(!svg.includes('NaN'), 'SVG must not contain NaN values');
}

const numericSvg = makeIdentIcon(42);
assertValidSvg(numericSvg);
assert.equal(makeIdentIcon(42), numericSvg, 'numeric results must be deterministic');
assert.equal(makeIdentIcon('42'), numericSvg, 'numeric and numeric-string IDs must match');
assert.equal(makeIdentIcon('42abc'), numericSvg, 'parseable string IDs must use their numeric prefix');
assert.equal(makeIdentIcon('not-a-number'), makeIdentIcon(0));

for (const id of [-1000, -1, 0, 1, 2 ** 31 - 1]) {
  assertValidSvg(makeIdentIcon(id));
}

const dataUrl = makeIdentIconDataUrl(42);
assert(dataUrl.startsWith(DATA_URL_PREFIX));
assert.equal(
  decodeURIComponent(dataUrl.slice(DATA_URL_PREFIX.length)),
  numericSvg,
  'data URL must contain the encoded SVG output',
);
assert.equal(makeIdentIconDataUrl(42), dataUrl, 'data URL must be deterministic');

const svgs = Array.from({ length: 3000 }, (_, id) => makeIdentIcon(id));
assert.equal(svgs.length, 3000);
assert(svgs.every((svg) => svg.startsWith('<svg ')));
assert(new Set(svgs).size > 2900, 'large ranges should produce varied icons');

// More entries than the bounded cache must still produce stable output after eviction.
for (let id = 3000; id < 5000; id++) makeIdentIcon(id);
assert.equal(makeIdentIcon(0), svgs[0]);
assert.equal(makeIdentIcon(2999), svgs[2999]);

console.log('API tests passed: SVG, Data URL, IDs, determinism, variety, and eviction.');
