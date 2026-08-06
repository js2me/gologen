import { CX, CY } from '../constants';
import type { Rng, ShapeResult, Vertex } from './types';
import { catmullRomPath } from './helpers';

/** Build a rotationally symmetric outline with repeated radii. */
export function buildPolarOutline(
  rng: Rng,
  symmetry: number,
  vertexCount: number,
  baseR: number,
  tension: number,
): ShapeResult {
  const rMin = baseR * 0.45;
  const startAngle = rng() * Math.PI * 2;
  const totalVertices = symmetry * vertexCount;
  const step = (Math.PI * 2) / totalVertices;
  const jitter = step * 0.35;
  const baseRadii: number[] = [];
  for (let i = 0; i < vertexCount; i++) baseRadii.push(rMin + rng() * (baseR - rMin));

  const vertices: Vertex[] = [];
  for (let si = 0; si < symmetry; si++) {
    for (let vi = 0; vi < vertexCount; vi++) {
      const angle = startAngle + step * (si * vertexCount + vi) + (rng() - 0.5) * jitter;
      const r = baseRadii[vi]!;
      vertices.push({ x: CX + Math.cos(angle) * r, y: CY + Math.sin(angle) * r });
    }
  }
  return { path: catmullRomPath(vertices, tension) };
}
