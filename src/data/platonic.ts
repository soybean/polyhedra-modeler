import type { Polyhedron, Vec3 } from '../types';

const phi = (1 + Math.sqrt(5)) / 2;

const tetrahedron: Polyhedron = {
  name: 'Tetrahedron',
  category: 'platonic',
  vertices: [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ],
  faces: [
    [0, 1, 2],
    [0, 2, 3],
    [0, 3, 1],
    [1, 3, 2],
  ],
};

const cube: Polyhedron = {
  name: 'Cube',
  category: 'platonic',
  vertices: [
    [-1, -1, -1],
    [-1, -1, 1],
    [-1, 1, -1],
    [-1, 1, 1],
    [1, -1, -1],
    [1, -1, 1],
    [1, 1, -1],
    [1, 1, 1],
  ],
  faces: [
    [0, 2, 3, 1],
    [4, 5, 7, 6],
    [0, 1, 5, 4],
    [2, 6, 7, 3],
    [0, 4, 6, 2],
    [1, 3, 7, 5],
  ],
};

const octahedron: Polyhedron = {
  name: 'Octahedron',
  category: 'platonic',
  vertices: [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ],
  faces: [
    [0, 2, 4],
    [0, 4, 3],
    [0, 3, 5],
    [0, 5, 2],
    [1, 4, 2],
    [1, 3, 4],
    [1, 5, 3],
    [1, 2, 5],
  ],
};

const dodecahedron: Polyhedron = {
  name: 'Dodecahedron',
  category: 'platonic',
  vertices: (() => {
    const invPhi = 1 / phi;
    const verts: Vec3[] = [
      // cube vertices
      [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
      [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1],
      // rectangle in xy plane
      [0, phi, invPhi], [0, phi, -invPhi], [0, -phi, invPhi], [0, -phi, -invPhi],
      // rectangle in yz plane
      [invPhi, 0, phi], [-invPhi, 0, phi], [invPhi, 0, -phi], [-invPhi, 0, -phi],
      // rectangle in xz plane
      [phi, invPhi, 0], [phi, -invPhi, 0], [-phi, invPhi, 0], [-phi, -invPhi, 0],
    ];
    return verts;
  })(),
  faces: [
    [0, 8, 4, 13, 12],
    [0, 12, 2, 17, 16],
    [0, 16, 1, 9, 8],
    [1, 16, 17, 3, 14],
    [1, 14, 5, 9],
    [2, 12, 13, 6, 10],
    [2, 10, 11, 3, 17],
    [3, 11, 7, 15, 14],
    [4, 8, 9, 5, 18],
    [4, 18, 19, 6, 13],
    [5, 14, 15, 18],
    [6, 19, 7, 11, 10],
    // fix: dodecahedron faces are all pentagons
  ],
};

// Recompute dodecahedron properly
const dodecahedronFixed: Polyhedron = (() => {
  const invPhi = 1 / phi;
  const vertices: Vec3[] = [
    [1, 1, 1],       // 0
    [1, 1, -1],      // 1
    [1, -1, 1],      // 2
    [1, -1, -1],     // 3
    [-1, 1, 1],      // 4
    [-1, 1, -1],     // 5
    [-1, -1, 1],     // 6
    [-1, -1, -1],    // 7
    [0, invPhi, phi],   // 8
    [0, -invPhi, phi],  // 9
    [0, invPhi, -phi],  // 10
    [0, -invPhi, -phi], // 11
    [invPhi, phi, 0],   // 12
    [-invPhi, phi, 0],  // 13
    [invPhi, -phi, 0],  // 14
    [-invPhi, -phi, 0], // 15
    [phi, 0, invPhi],   // 16
    [phi, 0, -invPhi],  // 17
    [-phi, 0, invPhi],  // 18
    [-phi, 0, -invPhi], // 19
  ];
  return {
    name: 'Dodecahedron',
    category: 'platonic' as const,
    vertices,
    faces: [
      [0, 8, 4, 13, 12],
      [0, 12, 1, 17, 16],
      [0, 16, 2, 9, 8],
      [1, 12, 13, 5, 10],
      [1, 10, 11, 3, 17],
      [2, 16, 17, 3, 14],
      [2, 14, 15, 6, 9],
      [4, 8, 9, 6, 18],
      [4, 18, 19, 5, 13],
      [5, 19, 7, 11, 10],
      [6, 15, 7, 19, 18],
      [3, 11, 7, 15, 14],
    ],
  };
})();

const icosahedron: Polyhedron = {
  name: 'Icosahedron',
  category: 'platonic',
  vertices: [
    [0, 1, phi],
    [0, -1, phi],
    [0, 1, -phi],
    [0, -1, -phi],
    [1, phi, 0],
    [-1, phi, 0],
    [1, -phi, 0],
    [-1, -phi, 0],
    [phi, 0, 1],
    [-phi, 0, 1],
    [phi, 0, -1],
    [-phi, 0, -1],
  ],
  faces: [
    [0, 1, 8],
    [0, 8, 4],
    [0, 4, 5],
    [0, 5, 9],
    [0, 9, 1],
    [1, 6, 8],
    [1, 7, 6],
    [1, 9, 7],
    [2, 3, 11],
    [2, 4, 10],
    [2, 5, 4],
    [2, 10, 3],
    [2, 11, 5],
    [3, 6, 7],
    [3, 7, 11],
    [3, 10, 6],
    [4, 8, 10],
    [5, 11, 9],
    [6, 10, 8],
    [7, 9, 11],
  ],
};

export const platonicSolids: Polyhedron[] = [
  tetrahedron,
  cube,
  octahedron,
  dodecahedronFixed,
  icosahedron,
];
