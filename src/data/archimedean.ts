import type { Polyhedron, Vec3 } from '../types';

const phi = (1 + Math.sqrt(5)) / 2;

// Even (cyclic) permutations with all sign changes — for icosahedral symmetry
function evenPerms(a: number, b: number, c: number): Vec3[] {
  const result: Vec3[] = [];
  const cyclic: Vec3[] = [[a, b, c], [c, a, b], [b, c, a]];
  for (const p of cyclic) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          result.push([p[0] * sx, p[1] * sy, p[2] * sz]);
        }
      }
    }
  }
  return dedup(result);
}

// All 6 permutations with all sign changes — for octahedral symmetry
function allPerms(a: number, b: number, c: number): Vec3[] {
  const result: Vec3[] = [];
  const perms: Vec3[] = [
    [a, b, c], [a, c, b], [b, a, c], [b, c, a], [c, a, b], [c, b, a],
  ];
  for (const p of perms) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          result.push([p[0] * sx, p[1] * sy, p[2] * sz]);
        }
      }
    }
  }
  return dedup(result);
}

function dedup(verts: Vec3[]): Vec3[] {
  const seen = new Set<string>();
  return verts.filter(v => {
    const key = v.map(x => (Object.is(x, -0) ? 0 : x).toFixed(8)).join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Compute faces of a convex polyhedron from vertices
function computeFaces(vertices: Vec3[]): number[][] {
  const eps = 1e-5;
  const n = vertices.length;
  const faces: number[][] = [];
  const faceSet = new Set<string>();

  // For each pair of adjacent vertices, try to find a supporting plane
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const v0 = vertices[i];
        const v1 = vertices[j];
        const v2 = vertices[k];

        // Compute normal
        const e1: Vec3 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        const e2: Vec3 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1];
        const ny = e1[2] * e2[0] - e1[0] * e2[2];
        const nz = e1[0] * e2[1] - e1[1] * e2[0];
        const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (nLen < eps) continue;
        const nnx = nx / nLen, nny = ny / nLen, nnz = nz / nLen;
        const d = nnx * v0[0] + nny * v0[1] + nnz * v0[2];

        // Check all vertices: coplanar or on one side
        const coplanar: number[] = [];
        let minDist = Infinity;
        let valid = true;

        for (let m = 0; m < n; m++) {
          const dist = nnx * vertices[m][0] + nny * vertices[m][1] + nnz * vertices[m][2] - d;
          if (Math.abs(dist) < eps) {
            coplanar.push(m);
          } else if (dist < -eps) {
            valid = false;
            break;
          } else {
            minDist = Math.min(minDist, dist);
          }
        }

        if (!valid || coplanar.length < 3) continue;

        // Sort coplanar vertices to form convex polygon
        const sorted = [...coplanar];
        const key = sorted.sort((a, b) => a - b).join(',');
        if (faceSet.has(key)) continue;
        faceSet.add(key);

        // Sort by angle around centroid in the face plane
        const cx = coplanar.reduce((s, idx) => s + vertices[idx][0], 0) / coplanar.length;
        const cy = coplanar.reduce((s, idx) => s + vertices[idx][1], 0) / coplanar.length;
        const cz = coplanar.reduce((s, idx) => s + vertices[idx][2], 0) / coplanar.length;

        // Local coordinate system on the plane
        const ux = v1[0] - v0[0], uy = v1[1] - v0[1], uz = v1[2] - v0[2];
        const uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
        const uux = ux / uLen, uuy = uy / uLen, uuz = uz / uLen;
        const vx = nny * uuz - nnz * uuy;
        const vy = nnz * uux - nnx * uuz;
        const vz = nnx * uuy - nny * uux;

        const ordered = [...coplanar].sort((a, b) => {
          const dax = vertices[a][0] - cx, day = vertices[a][1] - cy, daz = vertices[a][2] - cz;
          const dbx = vertices[b][0] - cx, dby = vertices[b][1] - cy, dbz = vertices[b][2] - cz;
          const angleA = Math.atan2(dax * vx + day * vy + daz * vz, dax * uux + day * uuy + daz * uuz);
          const angleB = Math.atan2(dbx * vx + dby * vy + dbz * vz, dbx * uux + dby * uuy + dbz * uuz);
          return angleA - angleB;
        });

        faces.push(ordered);
      }
    }
  }

  return faces;
}

function makeArchimedean(name: string, vertices: Vec3[]): Polyhedron {
  const verts = dedup(vertices);
  return {
    name,
    category: 'archimedean',
    vertices: verts,
    faces: computeFaces(verts),
  };
}

// === OCTAHEDRAL SYMMETRY (use allPerms) ===

// 1. Truncated Tetrahedron: 12v, 8f
const truncatedTetrahedron = makeArchimedean('Truncated Tetrahedron',
  allPerms(1, 1, 3).filter(v => {
    const negCount = v.filter(x => x < 0).length;
    return negCount % 2 === 0;
  })
);

// 2. Cuboctahedron: 12v, 14f
const cuboctahedron = makeArchimedean('Cuboctahedron', allPerms(0, 1, 1));

// 3. Truncated Cube: 24v, 14f
const truncatedCube = makeArchimedean('Truncated Cube', allPerms(Math.SQRT2 - 1, 1, 1));

// 4. Truncated Octahedron: 24v, 14f
const truncatedOctahedron = makeArchimedean('Truncated Octahedron', allPerms(0, 1, 2));

// 5. Rhombicuboctahedron: 24v, 26f
const rhombicuboctahedron = makeArchimedean('Rhombicuboctahedron', allPerms(1, 1, 1 + Math.SQRT2));

// 6. Truncated Cuboctahedron: 48v, 26f
const truncatedCuboctahedron = makeArchimedean('Truncated Cuboctahedron',
  allPerms(1, 1 + Math.SQRT2, 1 + 2 * Math.SQRT2)
);

// 7. Snub Cube: 24v, 38f
const snubCube = (() => {
  const t = 1.8392867552141612; // tribonacci constant
  const verts: Vec3[] = [];
  const vals: [number, number, number] = [1, 1 / t, t];

  // Even permutations with even sign count
  const even: Vec3[] = [[vals[0], vals[1], vals[2]], [vals[2], vals[0], vals[1]], [vals[1], vals[2], vals[0]]];
  for (const p of even) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          if ([sx, sy, sz].filter(s => s < 0).length % 2 === 0) {
            verts.push([p[0] * sx, p[1] * sy, p[2] * sz]);
          }
        }
      }
    }
  }
  // Odd permutations with odd sign count
  const odd: Vec3[] = [[vals[0], vals[2], vals[1]], [vals[1], vals[0], vals[2]], [vals[2], vals[1], vals[0]]];
  for (const p of odd) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          if ([sx, sy, sz].filter(s => s < 0).length % 2 === 1) {
            verts.push([p[0] * sx, p[1] * sy, p[2] * sz]);
          }
        }
      }
    }
  }
  return makeArchimedean('Snub Cube', verts);
})();

// === ICOSAHEDRAL SYMMETRY (use evenPerms) ===

// 8. Icosidodecahedron: 30v, 32f
const icosidodecahedron = (() => {
  const verts: Vec3[] = [
    ...evenPerms(0, 0, phi),
    ...evenPerms(0.5, phi / 2, phi * phi / 2),
  ];
  return makeArchimedean('Icosidodecahedron', verts);
})();

// 9. Truncated Dodecahedron: 60v, 32f
const truncatedDodecahedron = (() => {
  const invPhi = 1 / phi;
  const verts: Vec3[] = [
    ...evenPerms(0, invPhi, 2 + phi),
    ...evenPerms(invPhi, phi, 2 * phi),
    ...evenPerms(phi, 2, phi + 1),
  ];
  return makeArchimedean('Truncated Dodecahedron', verts);
})();

// 10. Truncated Icosahedron: 60v, 32f (soccer ball)
const truncatedIcosahedron = (() => {
  const verts: Vec3[] = [
    ...evenPerms(0, 1, 3 * phi),
    ...evenPerms(1, 2 + phi, 2 * phi),
    ...evenPerms(2, 1 + 2 * phi, phi),
  ];
  return makeArchimedean('Truncated Icosahedron', verts);
})();

// 11. Rhombicosidodecahedron: 60v, 62f
const rhombicosidodecahedron = (() => {
  const phi2 = phi * phi;
  const phi3 = phi * phi * phi;
  const verts: Vec3[] = [
    ...evenPerms(1, 1, phi3),
    ...evenPerms(phi2, phi, 2 * phi),
    ...evenPerms(2 + phi, 0, phi2),
  ];
  return makeArchimedean('Rhombicosidodecahedron', verts);
})();

// 12. Truncated Icosidodecahedron: 120v, 62f
const truncatedIcosidodecahedron = (() => {
  const invPhi = 1 / phi;
  const phi2 = phi * phi;
  const verts: Vec3[] = [
    ...evenPerms(invPhi, invPhi, 3 + phi),
    ...evenPerms(2 * invPhi, phi, 1 + 2 * phi),
    ...evenPerms(invPhi, phi2, 3 * phi - 1),
    ...evenPerms(2 * phi - 1, 2, 2 + phi),
    ...evenPerms(phi, 3, 2 * phi),
  ];
  return makeArchimedean('Truncated Icosidodecahedron', verts);
})();

// 13. Snub Dodecahedron: 60v, 92f
const snubDodecahedron = (() => {
  // Use exact coordinates from the canonical form
  // ξ is the real root of ξ³ - 2ξ = φ where φ = golden ratio
  const xi = 1.7461018734783655;

  // The 60 vertices are even permutations of these with appropriate sign rules:
  const alpha = xi / phi;                    // ξ/φ
  const beta = xi * phi;                      // ξφ
  const gamma = (xi * phi - 1 / xi + phi);   // approximate
  const delta = (-xi / phi + xi * xi + 1 / phi);

  // Simpler approach: generate vertices using the known formulas
  // Even perms of (±2α, ±2, ±2β) where α = ξ-1/ξ and β = ξφ+φ²+φ/ξ
  const a2 = xi - 1 / xi;
  const b2 = xi * phi + phi * phi + phi / xi;

  const verts: Vec3[] = [];

  // Set 1: even perms of (±2α, ±2, ±2β) with even sign changes
  const s1: Vec3[] = [[2 * a2, 2, 2 * b2], [2 * b2, 2 * a2, 2], [2, 2 * b2, 2 * a2]];
  for (const p of s1) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          if ([sx, sy, sz].filter(s => s < 0).length % 2 === 0)
            verts.push([p[0] * sx, p[1] * sy, p[2] * sz]);
        }
      }
    }
  }

  // Set 2: even perms with different combinations
  const a3 = xi * xi + xi / phi + phi;
  const b3 = -xi * xi * phi + xi + 1 / phi;
  const c3 = xi * xi / phi + xi * phi - 1;
  const s2: Vec3[] = [[a3, b3, c3], [c3, a3, b3], [b3, c3, a3]];
  for (const p of s2) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          if ([sx, sy, sz].filter(s => s < 0).length % 2 === 0)
            verts.push([p[0] * sx, p[1] * sy, p[2] * sz]);
        }
      }
    }
  }

  // Set 3
  const a4 = -xi / phi + xi * xi + phi;
  const b4 = xi * xi / phi - xi + 1 / phi;
  const c4 = xi / phi + xi * xi / phi + 1;
  const s3: Vec3[] = [[a4, b4, c4], [c4, a4, b4], [b4, c4, a4]];
  for (const p of s3) {
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          if ([sx, sy, sz].filter(s => s < 0).length % 2 === 1)
            verts.push([p[0] * sx, p[1] * sy, p[2] * sz]);
        }
      }
    }
  }

  const dedupVerts = dedup(verts);
  // Normalize all to same radius for a clean shape
  if (dedupVerts.length > 0) {
    const r0 = Math.sqrt(dedupVerts[0][0] ** 2 + dedupVerts[0][1] ** 2 + dedupVerts[0][2] ** 2);
    const normalized: Vec3[] = dedupVerts.map(v => {
      const r = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
      const s = r0 / r;
      return [v[0] * s, v[1] * s, v[2] * s] as Vec3;
    });
    return makeArchimedean('Snub Dodecahedron', normalized);
  }
  return makeArchimedean('Snub Dodecahedron', dedupVerts);
})();

export const archimedeanSolids: Polyhedron[] = [
  truncatedTetrahedron,
  cuboctahedron,
  truncatedCube,
  truncatedOctahedron,
  rhombicuboctahedron,
  truncatedCuboctahedron,
  snubCube,
  icosidodecahedron,
  truncatedDodecahedron,
  truncatedIcosahedron,
  rhombicosidodecahedron,
  truncatedIcosidodecahedron,
  snubDodecahedron,
];
