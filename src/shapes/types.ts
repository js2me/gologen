export type Vertex = { x: number; y: number };

export type ShapeResult = {
  path: string;
  innerSvg?: string;
  fillRule?: 'evenodd';
};

export type Rng = () => number;
