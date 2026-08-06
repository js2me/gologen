# logo-generator

Deterministic SVG identicon generator with 32 geometric shapes, seeded colors,
and a data URL helper.

## Installation

```bash
pnpm add logo-generator
```

## Usage

```ts
import { makeIdentIcon, makeIdentIconDataUrl } from 'logo-generator';

const svg = makeIdentIcon('product-123');
const dataUrl = makeIdentIconDataUrl('product-123');
```

The same identifier always produces the same SVG. Both string and numeric
identifiers are supported.

## Development

```bash
pnpm install
pnpm build
pnpm docs:build
pnpm docs:serve
```

## License

MIT
