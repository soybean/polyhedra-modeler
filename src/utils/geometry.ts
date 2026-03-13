import type { Vec3 } from '../types';

export function midpoint(a: Vec3, b: Vec3): Vec3 {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

export function centroid(points: Vec3[]): Vec3 {
  const n = points.length;
  return [
    points.reduce((s, p) => s + p[0], 0) / n,
    points.reduce((s, p) => s + p[1], 0) / n,
    points.reduce((s, p) => s + p[2], 0) / n,
  ];
}

// Triangulate a polygon face using fan triangulation from centroid
export function triangulateFace(vertices: Vec3[], faceIndices: number[]): number[][] {
  if (faceIndices.length === 3) return [faceIndices];
  // Fan from first vertex
  const tris: number[][] = [];
  for (let i = 1; i < faceIndices.length - 1; i++) {
    tris.push([faceIndices[0], faceIndices[i], faceIndices[i + 1]]);
  }
  return tris;
}

// Generate sonobe pyramid for a triangular face
// Each sonobe unit raises the face center outward, creating a 3-sided pyramid
// The pyramid is further divided to show the 3 sonobe units meeting at the apex
export function sonobeSubdivide(
  a: Vec3, b: Vec3, c: Vec3,
  pyramidHeight = 0.35
): { vertices: Vec3[]; triangles: [number, number, number][]; colors: number[] } {
  const center = centroid([a, b, c]);
  const normal = faceNormal(a, b, c);

  // Compute edge length to scale pyramid height proportionally
  const edgeLen = Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
  const height = edgeLen * pyramidHeight;

  // Apex of the pyramid — pushed outward along face normal
  const apex: Vec3 = [
    center[0] + normal[0] * height,
    center[1] + normal[1] * height,
    center[2] + normal[2] * height,
  ];

  const mAB = midpoint(a, b);
  const mBC = midpoint(b, c);
  const mCA = midpoint(c, a);

  // 7 points: 3 vertices + 3 edge midpoints + 1 apex (raised)
  const vertices: Vec3[] = [a, b, c, mAB, mBC, mCA, apex];
  // indices: a=0, b=1, c=2, mAB=3, mBC=4, mCA=5, apex=6

  // 6 triangles forming the 3 pyramid faces, each split in half
  // Each sonobe unit contributes one full pyramid face (2 sub-triangles)
  const triangles: [number, number, number][] = [
    [0, 3, 6],  // a -> mAB -> apex  (unit 1, half a)
    [3, 1, 6],  // mAB -> b -> apex  (unit 1, half b)
    [1, 4, 6],  // b -> mBC -> apex  (unit 2, half a)
    [4, 2, 6],  // mBC -> c -> apex  (unit 2, half b)
    [2, 5, 6],  // c -> mCA -> apex  (unit 3, half a)
    [5, 0, 6],  // mCA -> a -> apex  (unit 3, half b)
  ];

  // Color each pair of triangles as one sonobe unit
  // 3 units per face, 2 triangles per unit
  const colors = [0, 1, 2, 0, 1, 2];

  return { vertices, triangles, colors };
}

// Compute face normal
export function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const e1: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const e2: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n: Vec3 = [
    e1[1] * e2[2] - e1[2] * e2[1],
    e1[2] * e2[0] - e1[0] * e2[2],
    e1[0] * e2[1] - e1[1] * e2[0],
  ];
  const len = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2);
  if (len === 0) return [0, 1, 0];
  return [n[0] / len, n[1] / len, n[2] / len];
}

// Normalize a polyhedron so its vertices sit on a unit sphere (approximately)
export function normalizeScale(vertices: Vec3[]): Vec3[] {
  const maxR = Math.max(...vertices.map(v => Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2)));
  if (maxR === 0) return vertices;
  const scale = 2 / maxR;
  return vertices.map(v => [v[0] * scale, v[1] * scale, v[2] * scale] as Vec3);
}
