import { buildPolarOutline } from './generators-geometric';
import {
  buildArcRing, buildArrow, buildBolt, buildBowtie, buildCapsule, buildChevron,
  buildComma, buildConcaveTriangle, buildCrescent, buildCross, buildDiamond,
  buildDroplet, buildEye, buildFlower, buildGem, buildHeart, buildHexagon,
  buildInfinity, buildLeaf, buildPaperPlane, buildPentagon, buildPieSegment,
  buildPin, buildRingOverlay, buildRoundedDiamond, buildRoundedSquare, buildShield,
  buildSpeaker, buildStar, buildTriangle, buildWave, buildOctagram,
} from './generators-basic';
import type { ShapeResult, Rng } from './types';

const SHAPE_GENERATORS: Array<(rng: Rng) => ShapeResult> = [
  buildStar, buildArcRing, buildShield, buildEye, buildFlower, buildGem,
  buildCross, buildBolt, buildRingOverlay, buildArrow, buildDiamond, buildCrescent,
  buildTriangle, buildHeart, buildDroplet, buildHexagon, buildChevron, buildPin,
  buildCapsule, buildLeaf, buildInfinity, buildPieSegment, buildPentagon, buildComma,
  buildRoundedSquare, buildRoundedDiamond, buildConcaveTriangle, buildSpeaker,
  buildPaperPlane, buildOctagram, buildBowtie, buildWave,
];

export function generateShape(rng: Rng): ShapeResult {
  if (rng() < 0.06) {
    const symmetryOptions = [2, 3, 5, 6];
    const symmetry = symmetryOptions[Math.floor(rng() * symmetryOptions.length)]!;
    const vertexCount = 2 + Math.floor(rng() * 3);
    const baseR = 8 + rng() * 4;
    const tension = 0.15 + rng() * 0.3;
    return buildPolarOutline(rng, symmetry, vertexCount, baseR, tension);
  }
  return SHAPE_GENERATORS[Math.floor(rng() * SHAPE_GENERATORS.length)]!(rng);
}
