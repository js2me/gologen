# API

## `makeIdentIcon(id)`

```ts
function makeIdentIcon(id: string | number): string;
```

Returns a complete 24×24 SVG string. The output is deterministic for a given
identifier and includes a gradient background, a generated mark, and optional
decorative details.

## `makeIdentIconDataUrl(id)`

```ts
function makeIdentIconDataUrl(id: string | number): string;
```

Returns the SVG from `makeIdentIcon` as an encoded data URL suitable for an
`img` element, CSS `background-image`, or an SVG `<image>`.

Both functions use a bounded cache of 4,096 entries. Cache eviction regenerates
older values and does not change the generated output.
