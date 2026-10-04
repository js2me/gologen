import { CX, CY } from '../constants';
import { catmullRomPath, pickCenterFeature } from './helpers';
import type { Rng, ShapeResult, Vertex } from './types';

export function generateShape(rng: Rng): ShapeResult {
  const symmetry = 1 + Math.floor(rng() * 6);
  const pointsPerSector = 3 + Math.floor(rng() * 4);
  const points = symmetry * pointsPerSector;
  const step = Math.PI * 2 / points;
  const start = rng() * Math.PI * 2;
  const radii = Array.from({ length: pointsPerSector }, () => 5 + rng() * 7);
  const vertices: Vertex[] = [];

  for (let i = 0; i < points; i++) {
    const sectorPoint = i % pointsPerSector;
    const angle = start + i * step + (rng() - 0.5) * step * 0.3;
    const radius = radii[sectorPoint]!;
    vertices.push({ x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius });
  }

  const feature = pickCenterFeature(rng);
  const path = catmullRomPath(vertices, 0.05 + rng() * 0.2);
  if (feature.holePath) return { path: `${path} ${feature.holePath}`, fillRule: 'evenodd' };
  return { path, innerSvg: feature.innerSvg };
}
