# Output format

Generated logos use a fixed `24 × 24` viewBox and are returned as standalone
SVG documents:

```html
<svg width="24" height="24" viewBox="0 0 24 24" ...>
  ...
</svg>
```

The logo is composed of:

- a deterministic HSL gradient background;
- a white geometric silhouette;
- a cool white mark gradient;
- optional center details and background decorations.

The SVG uses unique gradient IDs derived from the identifier, so multiple
logos can be embedded in the same document without ID collisions between
different identifiers.
