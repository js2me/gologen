import { CX, CY, S12 } from '../constants';
import type { Rng, Vertex } from './types';

export function f2(v: number): string {
  const n = Math.round(v * 100);
  const int = (n / 100) | 0;
  const dec = n % 100;
  return dec === 0 ? `${int}` : dec < 10 ? `${int}.0${dec}` : `${int}.${dec}`;
}

export function f1(v: number): string {
  const n = Math.round(v * 10);
  const int = (n / 10) | 0;
  const dec = n % 10;
  return dec === 0 ? `${int}` : `${int}.${dec}`;
}

export function polygonPath(vertices: Vertex[]): string {
  const parts: string[] = [`M${f2(vertices[0]!.x)} ${f2(vertices[0]!.y)}`];
  for (let i = 1; i < vertices.length; i++) {
    parts.push(`L${f2(vertices[i]!.x)} ${f2(vertices[i]!.y)}`);
  }
  return parts.join(' ') + 'Z';
}

export function catmullRomPath(vertices: Vertex[], tension: number): string {
  if (tension === 0) return polygonPath(vertices);
  const parts: string[] = [`M${f2(vertices[0]!.x)} ${f2(vertices[0]!.y)}`];
  for (let i = 0; i < vertices.length; i++) {
    const prev = vertices[(i - 1 + vertices.length) % vertices.length]!;
    const curr = vertices[i]!;
    const next = vertices[(i + 1) % vertices.length]!;
    const nextNext = vertices[(i + 2) % vertices.length]!;
    const cp1x = curr.x + (next.x - prev.x) * tension;
    const cp1y = curr.y + (next.y - prev.y) * tension;
    const cp2x = next.x - (nextNext.x - curr.x) * tension;
    const cp2y = next.y - (nextNext.y - curr.y) * tension;
    parts.push(`C${f2(cp1x)} ${f2(cp1y)} ${f2(cp2x)} ${f2(cp2y)} ${f2(next.x)} ${f2(next.y)}`);
  }
  return parts.join(' ') + 'Z';
}

export function circleHolePath(cx: number, cy: number, r: number): string {
  const rr = f2(r);
  const rightX = f2(cx + r);
  const leftX = f2(cx - r);
  const cyStr = f2(cy);
  return `M${rightX} ${cyStr} A${rr} ${rr} 0 0 1 ${leftX} ${cyStr} A${rr} ${rr} 0 0 1 ${rightX} ${cyStr}`;
}

type CenterFeature = { innerSvg?: string; holePath?: string; fillRule?: 'evenodd' };

export function pickCenterFeature(rng: Rng, excludeHole = false): CenterFeature {
  const maxType = excludeHole ? 4 : 5;
  const raw = Math.floor(rng() * maxType);
  const type = excludeHole && raw >= 1 ? raw + 1 : raw;
  switch (type) {
    case 0: {
      const r = 1.2 + rng() * 2;
      return { innerSvg: `<circle cx="${S12}" cy="${S12}" r="${f2(r)}" fill="white" opacity="0.5"/>` };
    }
    case 1: {
      const r = 2 + rng() * 2.5;
      return { holePath: circleHolePath(CX, CY, r), fillRule: 'evenodd' };
    }
    case 2: {
      const r = 1.5 + rng() * 1.5;
      return { innerSvg: `<circle cx="${S12}" cy="${S12}" r="${f2(r)}" stroke="white" stroke-width="0.6" fill="none" opacity="0.4"/>` };
    }
    case 3: {
      const s = 1 + rng() * 1.5;
      return { innerSvg: `<line x1="${f2(CX - s)}" y1="${S12}" x2="${f2(CX + s)}" y2="${S12}" stroke="white" stroke-width="0.5" opacity="0.4"/><line x1="${S12}" y1="${f2(CY - s)}" x2="${S12}" y2="${f2(CY + s)}" stroke="white" stroke-width="0.5" opacity="0.4"/>` };
    }
    default: return {};
  }
}
