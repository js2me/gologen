import {
  caches,
  CX,
  CY,
  getCacheValue,
  RENDER_SIZE,
  S12,
  S24,
  setCacheValue,
} from './constants';
import { generateShape } from "./shapes";
import { f1, f2 } from './shapes/helpers';
import type { ShapeResult } from './shapes/types';

function createRng(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function hashId(id: number): number {
  let hash = 2166136261;
  hash ^= id & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (id >>> 8) & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (id >>> 16) & 0xff;
  hash = Math.imul(hash, 16777619);
  hash ^= (id >>> 24) & 0xff;
  hash = Math.imul(hash, 16777619);
  return hash >>> 0;
}

function getGradientColors(id: number): { from: string; to: string } {
  const hue = ((id * 137.508) % 360 + 360) % 360;
  const hueShift = 42 + ((id % 36) + 36) % 36;
  const hue2 = (hue + hueShift) % 360;
  return { from: `hsl(${f1(hue)} 65% 62%)`, to: `hsl(${f1(hue2)} 55% 34%)` };
}

function buildBackgroundPatterns(rng: () => number): string {
  const parts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const type = Math.floor(rng() * 6);
    const x = 2 + rng() * 20;
    const y = 2 + rng() * 20;
    const opacity = f2(0.08 + rng() * 0.15);
    const size = 1 + rng() * 2;
    switch (type) {
      case 0:
        parts.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(size)}" fill="white" opacity="${opacity}"/>`);
        break;
      case 1:
        parts.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(size)}" stroke="white" stroke-width="0.3" fill="none" opacity="${opacity}"/>`);
        break;
      case 2:
        parts.push(`<path d="M${f2(x)} ${f2(y - size)}L${f2(x + size)} ${f2(y)}L${f2(x)} ${f2(y + size)}L${f2(x - size)} ${f2(y)}Z" fill="white" opacity="${opacity}"/>`);
        break;
      case 3: {
        const half = size * 0.7;
        parts.push(`<path d="M${f2(x - half)} ${f2(y)}L${f2(x + half)} ${f2(y)}M${f2(x)} ${f2(y - half)}L${f2(x)} ${f2(y + half)}" stroke="white" stroke-width="0.4" opacity="${opacity}"/>`);
        break;
      }
      case 4: {
        const ts = size * 1.2;
        parts.push(`<path d="M${f2(x)} ${f2(y - ts)}L${f2(x + ts * 0.866)} ${f2(y + ts * 0.5)}L${f2(x - ts * 0.866)} ${f2(y + ts * 0.5)}Z" fill="white" opacity="${opacity}"/>`);
        break;
      }
      case 5: {
        const angle = rng() * Math.PI * 2;
        const len = size * 1.5;
        parts.push(`<line x1="${f2(x)}" y1="${f2(y)}" x2="${f2(x + Math.cos(angle) * len)}" y2="${f2(y + Math.sin(angle) * len)}" stroke="white" stroke-width="0.4" stroke-linecap="round" opacity="${opacity}"/>`);
        break;
      }
    }
  }
  return parts.join('');
}

function getMarkGradientAttrs(id: number) {
  const angle = ((id * 137.508 + 90) % 360) * (Math.PI / 180);
  return {
    x1: f2(CX - Math.cos(angle) * 10), y1: f2(CY - Math.sin(angle) * 10),
    x2: f2(CX + Math.cos(angle) * 10), y2: f2(CY + Math.sin(angle) * 10),
  };
}

const CSS_DROP_SHADOW = 'filter:drop-shadow(0 1px .5px rgba(0,0,0,.15))';

function buildSvg(id: number): string {
  const { from, to } = getGradientColors(id);
  const uid = `pl-${id}`;
  const grad = getMarkGradientAttrs(id);
  const rng = createRng(hashId(id));
  const baseRotation = Math.floor(rng() * 24) * 15;
  const rotationJitter = Math.round((rng() - 0.5) * 14);
  const rotateTransform = `rotate(${baseRotation + rotationJitter} ${S12} ${S12})`;
  const shape: ShapeResult = generateShape(rng);
  const bgPatterns = buildBackgroundPatterns(rng);
  const fillRuleAttr = shape.fillRule ? ` fill-rule="${shape.fillRule}"` : '';
  const innerSvg = shape.innerSvg ? `<g transform="${rotateTransform}">${shape.innerSvg}</g>` : '';
  return [
    `<svg width="${RENDER_SIZE}" height="${RENDER_SIZE}" viewBox="0 0 ${S24} ${S24}" fill="none" xmlns="http://www.w3.org/2000/svg">`,
    `<rect width="${S24}" height="${S24}" fill="url(#${uid}-bg)"/>`, bgPatterns,
    `<g style="${CSS_DROP_SHADOW}">`,
    `<path d="${shape.path}" fill="url(#${uid}-mark)" transform="${rotateTransform}"${fillRuleAttr}/>`, innerSvg, '</g>', '<defs>',
    `<linearGradient id="${uid}-bg" x1="${S12}" y1="0" x2="${S12}" y2="${S24}" gradientUnits="userSpaceOnUse">`,
    `<stop stop-color="${from}"/>`, `<stop offset="1" stop-color="${to}"/>`, '</linearGradient>',
    `<linearGradient id="${uid}-mark" x1="${grad.x1}" y1="${grad.y1}" x2="${grad.x2}" y2="${grad.y2}" gradientUnits="userSpaceOnUse">`,
    '<stop stop-color="white"/>', '<stop offset="1" stop-color="#CCFBFF"/>', '</linearGradient>', '</defs>', '</svg>',
  ].join('');
}

export function makeIdentIcon(id: string | number): string {
  const key = `${id}`;
  const cache = caches.svg ?? (caches.svg = new Map());
  let svg = getCacheValue(cache, key);
  if (svg !== undefined) return svg;
  const numericId = typeof id === 'number' ? id : Number.parseInt(String(id), 10) || 0;
  svg = buildSvg(numericId);
  setCacheValue(cache, key, svg);
  return svg;
}
