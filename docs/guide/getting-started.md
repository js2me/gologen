# Getting started

## Install

```bash
pnpm add gologen
```

The package has no runtime dependencies and works in browsers and Node.js
environments that support `Map` and `encodeURIComponent`.

## Generate an SVG

```ts
import { makeIdentIcon } from 'gologen';

const svg = makeIdentIcon('account-42');
document.querySelector('#logo')!.innerHTML = svg;
```

Identifiers are normalized to a numeric seed for shape and color generation.
String identifiers that do not start with a number use `0`, while the original
identifier still determines the cache key.

## Use an image URL

```ts
import { makeIdentIconDataUrl } from 'gologen';

const image = document.querySelector('img')!;
image.src = makeIdentIconDataUrl(42);
```

The helper URL-encodes the SVG and prefixes it with
`data:image/svg+xml;charset=utf-8,`.
