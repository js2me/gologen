import { caches, getCacheValue, setCacheValue } from "./constants";
import { makeIdentIcon } from "./make-ident-icon";

export function makeIdentIconDataUrl(id: string | number): string {
  const key = `${id}`;
  const cache = caches.dataUrls ?? (caches.dataUrls = new Map());

  let dataUrl = getCacheValue(cache, key);
  if (dataUrl !== undefined) return dataUrl;

  dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    makeIdentIcon(id),
  )}`;

  setCacheValue(cache, key, dataUrl);
  return dataUrl;
}
