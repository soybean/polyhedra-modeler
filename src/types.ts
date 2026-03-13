export type Vec3 = [number, number, number];

export interface Polyhedron {
  name: string;
  vertices: Vec3[];
  faces: number[][];
  category: 'platonic' | 'archimedean';
}

export type DisplayMode = 'solid' | 'wireframe' | 'sonobe';
