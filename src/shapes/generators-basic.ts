import { CX, CY, RENDER_SIZE, S12 } from '../constants';
import type { ShapeResult, Vertex } from './types';
import { catmullRomPath, circleHolePath, f2, pickCenterFeature, polygonPath } from './helpers';

/**
 * Звезда с 3–8 лучами. innerR задаёт толщину лучей.
 */
function buildStar(rng: () => number): ShapeResult {
  const points = 3 + Math.floor(rng() * 6); // 3–8
  const outerR = 8 + rng() * 2; // 8–10 (2px margin от края viewBox)
  const innerR = outerR * (0.3 + rng() * 0.35); // 30–65% of outerR.
  const startAngle = rng() * Math.PI * 2;

  const vertices: Vertex[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / (points * 2);
    const r = i % 2 === 0 ? outerR : innerR;
    vertices.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    });
  }

  const base = polygonPath(vertices);
  const cf = pickCenterFeature(rng, true);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Кольцо с разрывом. innerR задаёт толщину, gapAngle — размер разрыва.
 */
function buildArcRing(rng: () => number): ShapeResult {
  const outerR = 7 + rng() * 3; // 7–10
  const innerR = outerR * (0.35 + rng() * 0.35); // 35–70%
  const gapAngle = (40 + rng() * 150) * (Math.PI / 180); // 40–190°
  const startAngle = rng() * Math.PI * 2;
  const endAngle = startAngle + Math.PI * 2 - gapAngle;

  const outerStart = {
    x: CX + Math.cos(startAngle) * outerR,
    y: CY + Math.sin(startAngle) * outerR,
  };
  const outerEnd = {
    x: CX + Math.cos(endAngle) * outerR,
    y: CY + Math.sin(endAngle) * outerR,
  };
  const innerStart = {
    x: CX + Math.cos(endAngle) * innerR,
    y: CY + Math.sin(endAngle) * innerR,
  };
  const innerEnd = {
    x: CX + Math.cos(startAngle) * innerR,
    y: CY + Math.sin(startAngle) * innerR,
  };

  const largeArc = Math.PI * 2 - gapAngle > Math.PI ? 1 : 0;

  return {
    path: [
      `M${f2(outerStart.x)} ${f2(outerStart.y)}`,
      `A${f2(outerR)} ${f2(outerR)} 0 ${largeArc} 1 ${f2(outerEnd.x)} ${f2(outerEnd.y)}`,
      `L${f2(innerStart.x)} ${f2(innerStart.y)}`,
      `A${f2(innerR)} ${f2(innerR)} 0 ${largeArc} 0 ${f2(innerEnd.x)} ${f2(innerEnd.y)}`,
      'Z',
    ].join(' '),
  };
}

/**
 * Щит с закруглённым контуром и заострённым низом.
 */
function buildShield(rng: () => number): ShapeResult {
  const w = 3 + rng() * 5; // 3–8
  const h = 7 + rng() * 3; // 7–10
  const pointDepth = 1 + rng() * 4; // 1–5

  const vertices: Vertex[] = [
    { x: CX - w, y: CY - h * 0.85 },
    { x: CX, y: CY - h },
    { x: CX + w, y: CY - h * 0.85 },
    { x: CX + w, y: CY + h * 0.2 },
    { x: CX + pointDepth, y: CY + h },
    { x: CX - pointDepth, y: CY + h },
    { x: CX - w, y: CY + h * 0.2 },
  ];

  const base = catmullRomPath(vertices, 0.06 + rng() * 0.12);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  const cfInner = cf.innerSvg ?? '';

  if (rng() > 0.6) {
    const stripeY = CY - h * 0.2 + rng() * h * 0.3;
    const stripeW = w * 0.85;
    const stripeSvg = `<line x1="${f2(CX - stripeW)}" y1="${f2(stripeY)}" x2="${f2(CX + stripeW)}" y2="${f2(stripeY)}" stroke="white" stroke-width="0.6" opacity="0.35"/>`;
    return { path, innerSvg: cfInner + stripeSvg, fillRule: cf.fillRule };
  }

  return { path, innerSvg: cfInner, fillRule: cf.fillRule };
}

/**
 * Линза (vesica piscis) без центральной детали.
 */
function buildEye(rng: () => number): ShapeResult {
  const w = 5 + rng() * 5; // 5–10
  const h = 3 + rng() * 4; // 3–7

  const path = [
    `M${f2(CX - w)} ${S12}`,
    `A${f2(w)} ${f2(h)} 0 0 1 ${f2(CX + w)} ${S12}`,
    `A${f2(w)} ${f2(h)} 0 0 1 ${f2(CX - w)} ${S12}`,
    'Z',
  ].join(' ');

  return { path };
}

/**
 * Цветок с 3–8 лепестками вокруг центра.
 */
function buildFlower(rng: () => number): ShapeResult {
  const petals = 3 + Math.floor(rng() * 6); // 3–8
  const petalH = 7 + rng() * 3; // 7–10
  const petalW = 2.5 + rng() * 2; // 2.5–4.5
  const betweenR = petalW * (0.35 + rng() * 0.2); // 35–55%
  const startAngle = rng() * Math.PI * 2;

  const totalPoints = petals * 4;
  const vertices: Vertex[] = [];

  for (let i = 0; i < totalPoints; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / totalPoints;
    const phase = i % 4;
    let r: number;
    if (phase === 0) {
      r = petalH;
    } else if (phase === 2) {
      r = betweenR;
    } else {
      r = petalW;
    }
    vertices.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    });
  }

  // Контур сохраняет видимый центр, не превращая его в заполненную точку.
  const centerR = 1 + rng() * 2;
  const innerSvg = `<circle cx="${S12}" cy="${S12}" r="${f2(centerR)}" stroke="white" stroke-width="0.6" fill="none" opacity="0.5"/>`;

  return { path: catmullRomPath(vertices, 0.18 + rng() * 0.22), innerSvg };
}

/**
 * Многоугольник с радиальными гранями.
 */
function buildGem(rng: () => number): ShapeResult {
  const sides = 4 + Math.floor(rng() * 5); // 4–8
  const r = 7 + rng() * 3; // 7–10
  const startAngle = rng() * Math.PI * 2;

  const vertices: Vertex[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / sides;
    vertices.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    });
  }

  const facetLines: string[] = [];
  for (const v of vertices) {
    facetLines.push(
      `<line x1="${S12}" y1="${S12}" x2="${f2(v.x)}" y2="${f2(v.y)}" stroke="white" stroke-width="0.5" opacity="0.35"/>`,
    );
  }

  return { path: polygonPath(vertices), innerSvg: facetLines.join('') };
}

/**
 * Крест с равными вертикальной и горизонтальной осями.
 */
function buildCross(rng: () => number): ShapeResult {
  const armW = 1.5 + rng() * 4; // 1.5–5.5
  const armL = 7 + rng() * 3; // 7–10

  const base = polygonPath([
    { x: CX - armW, y: CY - armL },
    { x: CX + armW, y: CY - armL },
    { x: CX + armW, y: CY - armW },
    { x: CX + armL, y: CY - armW },
    { x: CX + armL, y: CY + armW },
    { x: CX + armW, y: CY + armW },
    { x: CX + armW, y: CY + armL },
    { x: CX - armW, y: CY + armL },
    { x: CX - armW, y: CY + armW },
    { x: CX - armL, y: CY + armW },
    { x: CX - armL, y: CY - armW },
    { x: CX - armW, y: CY - armW },
  ]);

  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Молния — зигзаг.
 */
function buildBolt(rng: () => number): ShapeResult {
  const w = 3 + rng() * 4; // 3–7
  const h = 8 + rng() * 2; // 8–10
  const jag = 0.5 + rng() * 3; // 0.5–3.5

  return {
    path: [
      `M${f2(CX + w * 0.3)} ${f2(CY - h)}`,
      `L${f2(CX + w)} ${f2(CY - h * 0.1)}`,
      `L${f2(CX + jag)} ${f2(CY - h * 0.1)}`,
      `L${f2(CX + w * 0.5)} ${f2(CY + h)}`,
      `L${f2(CX - w)} ${f2(CY + h * 0.1)}`,
      `L${f2(CX - jag)} ${f2(CY + h * 0.1)}`,
      'Z',
    ].join(' '),
  };
}

/**
 * Кольцо с внутренней геометрической деталью.
 */
function buildRingOverlay(rng: () => number): ShapeResult {
  const outerR = 7 + rng() * 3; // 7–10
  const innerR = outerR * (0.5 + rng() * 0.2); // 50–70% of outerR.
  const isCircle = rng() < 0.4;

  let ringPath: string;
  if (isCircle) {
    const outer = circleHolePath(CX, CY, outerR);
    const inner = circleHolePath(CX, CY, innerR);
    ringPath = outer + ' ' + inner;
  } else {
    const sides = 7 + Math.floor(rng() * 4); // 7–10
    const startAngle = rng() * Math.PI * 2;
    const outerVertices: Vertex[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + (Math.PI * 2 * i) / sides;
      outerVertices.push({
        x: CX + Math.cos(angle) * outerR,
        y: CY + Math.sin(angle) * outerR,
      });
    }
    const innerVertices: Vertex[] = [];
    for (let i = sides - 1; i >= 0; i--) {
      const angle = startAngle + (Math.PI * 2 * i) / sides;
      innerVertices.push({
        x: CX + Math.cos(angle) * innerR,
        y: CY + Math.sin(angle) * innerR,
      });
    }
    ringPath = polygonPath(outerVertices) + ' ' + polygonPath(innerVertices);
  }

  const innerFeature = Math.floor(rng() * 5); // 0–4
  const fSize = innerR * (0.7 + rng() * 0.25); // 70–95% of innerR.
  const opacity = f2(0.5 + rng() * 0.5); // 50–100% keeps the detail visible.
  let innerSvg: string;

  switch (innerFeature) {
    case 0: {
      innerSvg = `<circle cx="${S12}" cy="${S12}" r="${f2(fSize)}" fill="white" opacity="${opacity}"/>`;
      break;
    }
    case 1: {
      const s = fSize * 0.85;
      innerSvg = [
        `<line x1="${f2(CX - s)}" y1="${S12}" x2="${f2(CX + s)}" y2="${S12}" stroke="white" stroke-width="1.0" opacity="${opacity}"/>`,
        `<line x1="${S12}" y1="${f2(CY - s)}" x2="${S12}" y2="${f2(CY + s)}" stroke="white" stroke-width="1.0" opacity="${opacity}"/>`,
      ].join('');
      break;
    }
    case 2: {
      const d = fSize;
      innerSvg = `<path d="M${S12} ${f2(CY - d)}L${f2(CX + d)} ${S12}L${S12} ${f2(CY + d)}L${f2(CX - d)} ${S12}Z" fill="white" opacity="${opacity}"/>`;
      break;
    }
    case 3: {
      const t = fSize;
      innerSvg = `<path d="M${S12} ${f2(CY - t)}L${f2(CX + t * 0.866)} ${f2(CY + t * 0.5)}L${f2(CX - t * 0.866)} ${f2(CY + t * 0.5)}Z" fill="white" opacity="${opacity}"/>`;
      break;
    }
    default: {
      innerSvg = `<circle cx="${S12}" cy="${S12}" r="${f2(fSize * 1.2)}" stroke="white" stroke-width="1.2" fill="none" opacity="${opacity}"/>`;
      break;
    }
  }

  return { path: ringPath, innerSvg, fillRule: 'evenodd' };
}

/**
 * Стрелка/шеврон — w 2–9, stem 0.5–3.5: узкий ↔ широкий наконечник.
 */
function buildArrow(rng: () => number): ShapeResult {
  const w = 2 + rng() * 6; // 2–8
  const h = 7 + rng() * 3; // 7–10
  const stemW = 0.5 + rng() * 2; // 0.5–2.5
  const headH = h * (0.25 + rng() * 0.4); // 25–65%

  return {
    path: [
      `M${S12} ${f2(CY - h)}`,
      `L${f2(CX + w)} ${f2(CY - h + headH)}`,
      `L${f2(CX + stemW)} ${f2(CY - h + headH)}`,
      `L${f2(CX + stemW)} ${f2(CY + h)}`,
      `L${f2(CX - stemW)} ${f2(CY + h)}`,
      `L${f2(CX - stemW)} ${f2(CY - h + headH)}`,
      `L${f2(CX - w)} ${f2(CY - h + headH)}`,
      'Z',
    ].join(' '),
  };
}

/**
 * Ромб — w 5–10, h 5–10: узкий ↔ широкий. Минимальный w=5 чтобы не смещаться визуально.
 */
function buildDiamond(rng: () => number): ShapeResult {
  const w = 5 + rng() * 5; // 5–10
  const h = 5 + rng() * 5; // 5–10

  const base = [
    `M${S12} ${f2(CY - h)}`,
    `L${f2(CX + w)} ${S12}`,
    `L${S12} ${f2(CY + h)}`,
    `L${f2(CX - w)} ${S12}`,
    'Z',
  ].join(' ');

  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Полумесяц из двух дуг разного радиуса.
 */
function buildCrescent(rng: () => number): ShapeResult {
  const r1 = 7 + rng() * 3; // 7–10
  const offset = 2 + rng() * 4; // смещение 2–6
  const startAngle = rng() * Math.PI * 2;

  // The intersections lie 90° from the offset direction.
  const perpAngle1 = startAngle + Math.PI * 0.5;
  const perpAngle2 = startAngle - Math.PI * 0.5;

  const p1x = CX + Math.cos(perpAngle1) * r1;
  const p1y = CY + Math.sin(perpAngle1) * r1;
  const p2x = CX + Math.cos(perpAngle2) * r1;
  const p2y = CY + Math.sin(perpAngle2) * r1;

  const cx2 = CX + Math.cos(startAngle) * offset;
  const cy2 = CY + Math.sin(startAngle) * offset;

  // Choose the inner radius so the second arc passes through both points.
  const r2 = Math.sqrt((p1x - cx2) ** 2 + (p1y - cy2) ** 2);

  return {
    path: [
      `M${f2(p1x)} ${f2(p1y)}`,
      `A${f2(r1)} ${f2(r1)} 0 1 1 ${f2(p2x)} ${f2(p2y)}`,
      `A${f2(r2)} ${f2(r2)} 0 0 0 ${f2(p1x)} ${f2(p1y)}`,
      'Z',
    ].join(' '),
  };
}

/**
 * Треугольник, центрированный по центроиду.
 */
function buildTriangle(rng: () => number): ShapeResult {
  const h = 7 + rng() * 3; // полувысота 7–10
  const w = 3 + rng() * 5; // полуширина основания 3–8
  const topInset = rng() * w * 0.2; // 0–20%: скругление верхней точки

  // Shift the vertices so the triangle centroid is at (CX, CY).
  const yShift = h * 0.2;

  const vertices: Vertex[] = [
    { x: CX - topInset, y: CY - h - yShift },
    { x: CX + w, y: CY + h * 0.8 - yShift },
    { x: CX - w, y: CY + h * 0.8 - yShift },
  ];

  return { path: catmullRomPath(vertices, 0.1 + rng() * 0.15) };
}

/**
 * Сердце с регулируемой глубиной верхней выемки.
 */
function buildHeart(rng: () => number): ShapeResult {
  const w = 4 + rng() * 5; // полуширина 4–9
  const h = 7 + rng() * 4; // полувысота 7–11
  const topCurve = 0.3 + rng() * 0.4; // 30–70% — глубина верхней выемки

  const vertices: Vertex[] = [
    { x: CX - w * topCurve, y: CY - h * 0.7 },
    { x: CX - w, y: CY - h * 0.35 },
    { x: CX, y: CY + h },
    { x: CX + w, y: CY - h * 0.35 },
    { x: CX + w * topCurve, y: CY - h * 0.7 },
  ];

  return { path: catmullRomPath(vertices, 0.15 + rng() * 0.1) };
}

/**
 * Капля с регулируемыми шириной и высотой.
 */
function buildDroplet(rng: () => number): ShapeResult {
  const w = 3 + rng() * 4; // полуширина 3–7
  const h = 7 + rng() * 4; // полувысота 7–11

  const vertices: Vertex[] = [
    { x: CX, y: CY - h },
    { x: CX + w, y: CY + h * 0.2 },
    { x: CX + w * 0.4, y: CY + h },
    { x: CX, y: CY + h * 0.95 },
    { x: CX - w * 0.4, y: CY + h },
    { x: CX - w, y: CY + h * 0.2 },
  ];

  const base = catmullRomPath(vertices, 0.12 + rng() * 0.1);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Шестиугольник без внутренних граней.
 */
function buildHexagon(rng: () => number): ShapeResult {
  const sides = 6;
  const r = 8 + rng() * 2; // 8–10
  const startAngle = rng() * Math.PI * 2;

  const vertices: Vertex[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / sides;
    vertices.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    });
  }

  const base = polygonPath(vertices);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Шеврон без стержня.
 */
function buildChevron(rng: () => number): ShapeResult {
  const w = 4 + rng() * 5; // полуширина 4–9
  const depth = 4 + rng() * 4; // глубина V 4–8
  const thickness = 1.5 + rng() * 2; // толщина линий 1.5–3.5

  const path = [
    `M${f2(CX - w)} ${f2(CY - depth + thickness)}`,
    `L${S12} ${f2(CY - depth)}`,
    `L${f2(CX + w)} ${f2(CY - depth + thickness)}`,
    `L${f2(CX + w)} ${f2(CY - depth)}`,
    `L${S12} ${f2(CY - depth + thickness + depth)}`,
    `L${f2(CX - w)} ${f2(CY - depth)}`,
    'Z',
  ].join(' ');

  return { path };
}

/**
 * Пин/маркер — форма картографического маркера.
 * ovalW 4–7, ovalH 6.5–8, pointDepth 4–7: широкая ↔ острая.
 */
function buildPin(rng: () => number): ShapeResult {
  const ovalW = 4 + rng() * 3; // полуширина овала 4–7
  const ovalH = 6.5 + rng() * 1.5; // полувысота овала 6.5–8
  const pointDepth = 4 + rng() * 3; // глубина кончика 4–7

  const vertices: Vertex[] = [
    { x: CX, y: CY - ovalH }, // верх овала
    { x: CX + ovalW, y: CY }, // правый бок овала
    { x: CX + ovalW * 0.3, y: CY + ovalH * 0.3 }, // правый переход к кончику
    { x: CX, y: CY + ovalH * 0.3 + pointDepth }, // кончик
    { x: CX - ovalW * 0.3, y: CY + ovalH * 0.3 }, // левый переход к кончику
    { x: CX - ovalW, y: CY }, // левый бок овала
  ];

  const base = catmullRomPath(vertices, 0.15 + rng() * 0.1);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Скруглённый прямоугольник.
 */
function buildCapsule(rng: () => number): ShapeResult {
  const w = 4 + rng() * 4; // полуширина 4–8
  const h = 6 + rng() * 4; // полувысота 6–10
  const maxCr = Math.min(w, h) * 0.6; // Ограничивает радиус, сохраняя форму прямоугольника.
  const cornerR = 1 + rng() * (maxCr - 1); // скругление 1–maxCr

  const cr = f2(Math.min(cornerR, w, h));

  const path = [
    `M${f2(CX + w)} ${f2(CY - h + cornerR)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX + w - cornerR)} ${f2(CY - h)}`,
    `L${f2(CX - w + cornerR)} ${f2(CY - h)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX - w)} ${f2(CY - h + cornerR)}`,
    `L${f2(CX - w)} ${f2(CY + h - cornerR)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX - w + cornerR)} ${f2(CY + h)}`,
    `L${f2(CX + w - cornerR)} ${f2(CY + h)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX + w)} ${f2(CY + h - cornerR)}`,
    'Z',
  ].join(' ');

  const cf = pickCenterFeature(rng);
  const combinedPath = cf.holePath ? path + ' ' + cf.holePath : path;

  return { path: combinedPath, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Асимметричный лист.
 */
function buildLeaf(rng: () => number): ShapeResult {
  const w = 3 + rng() * 4; // полуширина 3–7
  const h = 7 + rng() * 3; // полувысота 7–10
  const skew = 1 + rng() * 3; // асимметрия 1–4

  const vertices: Vertex[] = [
    { x: CX, y: CY - h }, // кончик
    { x: CX + w + skew, y: CY }, // правый бок (сдвиг — асимметрия)
    { x: CX + w * 0.15, y: CY + h * 0.8 }, // правый низ
    { x: CX, y: CY + h }, // основание
    { x: CX - w * 0.15, y: CY + h * 0.8 }, // левый низ
    { x: CX - w, y: CY }, // левый бок
  ];

  const base = catmullRomPath(vertices, 0.12 + rng() * 0.15);
  const cf = pickCenterFeature(rng, true);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  const veinSvg = `<line x1="${S12}" y1="${f2(CY - h * 0.8)}" x2="${S12}" y2="${f2(CY + h * 0.8)}" stroke="white" stroke-width="0.5" opacity="0.35"/>`;

  return {
    path,
    innerSvg: (cf.innerSvg ?? '') + veinSvg,
    fillRule: cf.fillRule,
  };
}

/**
 * Бесконечность / лемниската — figure-8.
 * loopR 3–5, pinch 0.5–2.5: узкая ↔ широкая.
 */
function buildInfinity(rng: () => number): ShapeResult {
  const loopR = 4 + rng() * 2; // радиус петли 4–6
  const pinchW = 0.5 + rng() * 2; // перехват в центре 0.5–2.5
  const stretch = 1.5 + rng() * 1; // горизонтальное растяжение 1.5–2.5

  const halfW = loopR * stretch;
  const halfH = loopR * 0.7;

  const path = [
    `M${f2(CX - pinchW)} ${S12}`,
    `A${f2(halfW)} ${f2(halfH)} 0 0 0 ${f2(CX - halfW * 2 + pinchW)} ${S12}`,
    `A${f2(halfW)} ${f2(halfH)} 0 0 0 ${f2(CX - pinchW)} ${S12}`,
    `M${f2(CX + pinchW)} ${S12}`,
    `A${f2(halfW)} ${f2(halfH)} 0 0 0 ${f2(CX + halfW * 2 - pinchW)} ${S12}`,
    `A${f2(halfW)} ${f2(halfH)} 0 0 0 ${f2(CX + pinchW)} ${S12}`,
  ].join(' ');

  return { path, fillRule: 'evenodd' };
}

/**
 * Сегмент/пирог — сегмент круга (pie slice).
 * angle 90–270°: клин ↔ почти полный круг. r 8–10.
 */
function buildPieSegment(rng: () => number): ShapeResult {
  const r = 8 + rng() * 2; // 8–10
  const angleDeg = 90 + rng() * 180; // 90–270°
  const angle = angleDeg * (Math.PI / 180);
  const startAngle = rng() * Math.PI * 2;

  const endAngle = startAngle + angle;
  const largeArc = angle > Math.PI ? 1 : 0;

  const sx = f2(CX + Math.cos(startAngle) * r);
  const sy = f2(CY + Math.sin(startAngle) * r);
  const ex = f2(CX + Math.cos(endAngle) * r);
  const ey = f2(CY + Math.sin(endAngle) * r);

  const path = [
    `M${S12} ${S12}`,
    `L${sx} ${sy}`,
    `A${f2(r)} ${f2(r)} 0 ${largeArc} 1 ${ex} ${ey}`,
    'Z',
  ].join(' ');

  return { path };
}

/**
 * Правильный пятиугольник со случайным поворотом.
 */
function buildPentagon(rng: () => number): ShapeResult {
  const sides = 5;
  const r = 7 + rng() * 3; // 7–10
  const startAngle = rng() * Math.PI * 2;

  const vertices: Vertex[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / sides;
    vertices.push({
      x: CX + Math.cos(angle) * r,
      y: CY + Math.sin(angle) * r,
    });
  }

  const base = polygonPath(vertices);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Изогнутая форма запятой.
 */
function buildComma(rng: () => number): ShapeResult {
  const w = 2 + rng() * 3; // полуширина 2–5
  const h = 6 + rng() * 4; // полувысота верхней части 6–10
  const tailLen = 2 + rng() * 3; // длина «хвостика» 2–5
  const tailCurve = 0.3 + rng() * 0.5; // кривизна хвостика

  const vertices: Vertex[] = [
    { x: CX, y: CY - h }, // верхняя точка
    { x: CX + w, y: CY - h * 0.3 }, // правый бок
    { x: CX + w * 0.4, y: CY + h * 0.1 }, // правый нижний переход
    { x: CX + w * tailCurve, y: CY + h * 0.1 + tailLen }, // хвостик вправо
    { x: CX, y: CY + h * 0.1 + tailLen * 0.7 }, // конец хвостика
    { x: CX - w * 0.4, y: CY }, // левый переход
    { x: CX - w, y: CY - h * 0.3 }, // левый бок
  ];

  return { path: catmullRomPath(vertices, 0.1 + rng() * 0.12) };
}

/**
 * Скруглённый квадрат.
 */
function buildRoundedSquare(rng: () => number): ShapeResult {
  const w = 5 + rng() * 4; // полуширина 5–9
  const cornerR = 1 + rng() * 3; // скругление 1–4

  const cr = f2(Math.min(cornerR, w));

  const base = [
    `M${f2(CX + w)} ${f2(CY - w + cornerR)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX + w - cornerR)} ${f2(CY - w)}`,
    `L${f2(CX - w + cornerR)} ${f2(CY - w)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX - w)} ${f2(CY - w + cornerR)}`,
    `L${f2(CX - w)} ${f2(CY + w - cornerR)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX - w + cornerR)} ${f2(CY + w)}`,
    `L${f2(CX + w - cornerR)} ${f2(CY + w)}`,
    `A${cr} ${cr} 0 0 1 ${f2(CX + w)} ${f2(CY + w - cornerR)}`,
    'Z',
  ].join(' ');

  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? base + ' ' + cf.holePath : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Ромб со скруглёнными углами.
 */
function buildRoundedDiamond(rng: () => number): ShapeResult {
  const d = 5 + rng() * 4; // полу-диагональ 5–9
  const cr = 1.5 + rng() * 2; // радиус скругления угла 1.5–3.5
  const sqrt2 = 1.4142;
  const crOff = cr / sqrt2; // смещение точки касания вдоль стороны

  const path = [
    `M${f2(CX - crOff)} ${f2(CY - d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX + crOff)} ${f2(CY - d)}`,
    `L${f2(CX + d)} ${f2(CY - crOff)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX + d)} ${f2(CY + crOff)}`,
    `L${f2(CX + crOff)} ${f2(CY + d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX - crOff)} ${f2(CY + d)}`,
    `L${f2(CX - d)} ${f2(CY + crOff)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX - d)} ${f2(CY - crOff)}`,
    'Z',
  ].join(' ');

  const cf = pickCenterFeature(rng);
  const combinedPath = cf.holePath ? `${path} ${cf.holePath}` : path;

  return { path: combinedPath, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Вогнутый треугольник — треугольник с вогнутой верхней стороной.
 * w 4–8, h 7–10, concave 10–30%: почти прямой ↔ заметная впадина.
 */
function buildConcaveTriangle(rng: () => number): ShapeResult {
  const w = 4 + rng() * 4; // полуширина основания 4–8
  const h = 7 + rng() * 3; // полувысота 7–10
  const concave = 0.1 + rng() * 0.2; // глубина впадины 10–30% от h
  // Сдвиг для центрирования (centroid на CY)
  const yShift = h * 0.2;

  // Вершины для вогнутой верхней части
  const verticesWithConcave: Vertex[] = [
    { x: CX - w * 0.5, y: CY - h * 0.95 - yShift }, // левый верхний угол
    { x: CX, y: CY - h + concave * h - yShift }, // центр впадины
    { x: CX + w * 0.5, y: CY - h * 0.95 - yShift }, // правый верхний угол
    { x: CX + w, y: CY + h * 0.8 - yShift }, // правый угол основания
    { x: CX - w, y: CY + h * 0.8 - yShift }, // левый угол основания
  ];

  const base = catmullRomPath(verticesWithConcave, 0.15 + rng() * 0.1);
  const cf = pickCenterFeature(rng);
  const path = cf.holePath ? `${base} ${cf.holePath}` : base;

  return { path, innerSvg: cf.innerSvg, fillRule: cf.fillRule };
}

/**
 * Динамик / speaker — прямоугольная коробка + конус-рупор.
 * boxW 2–4, boxH 4–7, coneW 4–8: узкий ↔ широкий динамик.
 */
function buildSpeaker(rng: () => number): ShapeResult {
  const boxW = 2 + rng() * 2; // полуширина коробки 2–4
  const boxH = 4 + rng() * 3; // полувысота коробки 4–7
  const coneEndH = 1 + rng() * 2; // полувысота конца конуса 1–3
  const coneLen = 4 + rng() * 3; // длина конуса 4–7
  const cr = 0.5 + rng() * 1; // скругление углов коробки 0.5–1.5

  const boxLeft = f2(CX - coneLen - boxW);
  const boxRight = f2(CX - coneLen);
  const coneLeft = f2(CX - coneLen);
  const coneRight = f2(CX - coneLen + coneLen);
  const topBox = f2(CY - boxH);
  const botBox = f2(CY + boxH);
  const topConeEnd = f2(CY - coneEndH);
  const botConeEnd = f2(CY + coneEndH);
  const crStr = f2(Math.min(cr, boxW, boxH));

  const path = [
    `M${boxRight} ${f2(CY - boxH + cr)}`,
    `A${crStr} ${crStr} 0 0 0 ${f2(CX - coneLen - boxW + cr)} ${topBox}`,
    `L${f2(CX - coneLen - boxW + cr)} ${topBox}`,
    `A${crStr} ${crStr} 0 0 0 ${boxLeft} ${f2(CY + boxH - cr)}`,
    `L${boxLeft} ${f2(CY + boxH - cr)}`,
    `A${crStr} ${crStr} 0 0 0 ${f2(CX - coneLen - boxW + cr)} ${botBox}`,
    `L${f2(CX - coneLen - boxW + cr)} ${botBox}`,
    `A${crStr} ${crStr} 0 0 0 ${boxRight} ${f2(CY + boxH - cr)}`,
    `L${coneLeft} ${botBox}`,
    `L${coneRight} ${botConeEnd}`,
    `L${coneRight} ${topConeEnd}`,
    `L${coneLeft} ${topBox}`,
    'Z',
  ].join(' ');

  return { path };
}

/**
 * Бумажный самолёт / paper plane — стрелка отправки.
 * wingW 5–9, bodyLen 7–10, foldRatio 25–55%: длинный ↔ короткий.
 */
function buildPaperPlane(rng: () => number): ShapeResult {
  const wingW = 5 + rng() * 4; // размах «крыльев» 5–9
  const bodyLen = 7 + rng() * 3; // длина тела 7–10
  const foldRatio = 0.25 + rng() * 0.3; // 25–55% — где сгиб
  const tailW = 1 + rng() * 2; // ширина хвостика 1–3

  // Стрелка-самолёт: кончик слева, хвост справа, сгиб-линия сверху
  const tipX = CX - bodyLen;
  const tailX = CX + bodyLen * 0.3;
  const foldX = CX - bodyLen + bodyLen * foldRatio;

  const path = [
    `M${f2(tipX)} ${S12}`, // кончик
    `L${f2(CX + bodyLen * 0.2)} ${f2(CY - wingW)}`, // верхнее крыло
    `L${f2(foldX)} ${S12}`, // сгиб
    `L${f2(tailX + tailW)} ${f2(CY - wingW * 0.3)}`, // верхний хвостик
    `L${f2(tailX)} ${S12}`, // центр хвоста
    `L${f2(tailX + tailW)} ${f2(CY + wingW * 0.3)}`, // нижний хвостик
    `L${f2(foldX)} ${S12}`, // сгиб снизу
    `L${f2(CX + bodyLen * 0.2)} ${f2(CY + wingW)}`, // нижнее крыло
    'Z',
  ].join(' ');

  // Линия сгиба — тонкая внутренняя деталь
  const foldSvg = `<line x1="${f2(foldX)}" y1="${S12}" x2="${f2(tailX)}" y2="${S12}" stroke="white" stroke-width="0.5" opacity="0.35"/>`;

  return { path, innerSvg: foldSvg };
}

/**
 * Восьмиконечная звезда из двух пересекающихся скруглённых квадратов.
 */
function buildOctagram(rng: () => number): ShapeResult {
  const d = 7 + rng() * 2; // полу-диагональ каждого квадрата 7–9
  const cr = 0.5 + rng() * 1; // скругление угла 0.5–1.5
  const sqrt2 = 1.4142;
  const crOff = cr / sqrt2;

  const sq1 = [
    `M${f2(CX + d - cr)} ${f2(CY - d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 0 ${f2(CX + d)} ${f2(CY - d + cr)}`,
    `L${f2(CX + d)} ${f2(CY + d - cr)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 0 ${f2(CX + d - cr)} ${f2(CY + d)}`,
    `L${f2(CX - d + cr)} ${f2(CY + d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 0 ${f2(CX - d)} ${f2(CY + d - cr)}`,
    `L${f2(CX - d)} ${f2(CY - d + cr)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 0 ${f2(CX - d + cr)} ${f2(CY - d)}`,
    'Z',
  ].join(' ');

  const sq2 = [
    `M${f2(CX - crOff)} ${f2(CY - d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX + crOff)} ${f2(CY - d)}`,
    `L${f2(CX + d)} ${f2(CY - crOff)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX + d)} ${f2(CY + crOff)}`,
    `L${f2(CX + crOff)} ${f2(CY + d)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX - crOff)} ${f2(CY + d)}`,
    `L${f2(CX - d)} ${f2(CY + crOff)}`,
    `A${f2(cr)} ${f2(cr)} 0 0 1 ${f2(CX - d)} ${f2(CY - crOff)}`,
    'Z',
  ].join(' ');

  const path = sq1 + ' ' + sq2;

  return { path, fillRule: 'evenodd' };
}

/**
 * Песочные часы из двух треугольников с узким перехватом.
 */
function buildBowtie(rng: () => number): ShapeResult {
  const w = 4 + rng() * 4; // полуширина в widest 4–8
  const h = 7 + rng() * 3; // полувысота 7–10
  const pinch = 0.5 + rng() * 1.5; // перехват в центре 0.5–2

  const vertices: Vertex[] = [
    { x: CX, y: CY - h }, // верхний кончик
    { x: CX + w, y: CY - h * 0.3 }, // правый верх
    { x: CX + pinch, y: CY }, // перехват справа
    { x: CX + w, y: CY + h * 0.3 }, // правый низ
    { x: CX, y: CY + h }, // нижний кончик
    { x: CX - w, y: CY + h * 0.3 }, // левый низ
    { x: CX - pinch, y: CY }, // перехват слева
    { x: CX - w, y: CY - h * 0.3 }, // левый верх
  ];

  return { path: catmullRomPath(vertices, 0.08 + rng() * 0.12) };
}

/**
 * Волна с синусоидальным верхним краем.
 */
function buildWave(rng: () => number): ShapeResult {
  const amplitude = 1.5 + rng() * 2.5; // 1.5–4
  const waves = 2 + Math.floor(rng() * 3); // 2–4
  const thickness = 3 + rng() * 3; // 3–6 (толщина волны)

  const pointsPerWave = 8;
  const totalPoints = waves * pointsPerWave;
  const stepX = (RENDER_SIZE - 2) / totalPoints;

  const vertices: Vertex[] = [];

  for (let i = 0; i <= totalPoints; i++) {
    const x = 1 + i * stepX;
    const waveY = Math.sin((i / pointsPerWave) * Math.PI * 2) * amplitude;
    vertices.push({ x, y: CY - thickness / 2 + waveY });
  }

  vertices.push({ x: RENDER_SIZE - 1, y: CY + thickness / 2 });
  vertices.push({ x: 1, y: CY + thickness / 2 });

  return { path: polygonPath(vertices) };
}

export {
  buildStar, buildArcRing, buildShield, buildEye, buildFlower, buildGem,
  buildCross, buildBolt, buildRingOverlay, buildArrow, buildDiamond,
  buildCrescent, buildTriangle, buildHeart, buildDroplet, buildHexagon,
  buildChevron, buildPin, buildCapsule, buildLeaf, buildInfinity,
  buildPieSegment, buildPentagon, buildComma, buildRoundedSquare,
  buildRoundedDiamond, buildConcaveTriangle, buildSpeaker, buildPaperPlane,
  buildOctagram, buildBowtie, buildWave,
};
