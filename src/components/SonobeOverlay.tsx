import { useMemo } from 'react';
import * as THREE from 'three';
import type { Vec3 } from '../types';
import { triangulateFace, sonobeSubdivide, faceNormal } from '../utils/geometry';

interface SonobeOverlayProps {
  vertices: Vec3[];
  faces: number[][];
}

// Warm color palette for sonobe units — inspired by origami paper
const SONOBE_COLORS = [
  '#c9735b', // terracotta
  '#d4a574', // warm tan
  '#8b9e7a', // sage
  '#7a8fa6', // dusty blue
  '#b5838d', // mauve
  '#a8865a', // amber
];

export function SonobeOverlay({ vertices, faces }: SonobeOverlayProps) {
  const { geometry, edgeGeometry } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const normals: number[] = [];
    const edgePoints: number[] = [];

    let triCounter = 0;

    for (let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
      const face = faces[faceIdx];
      const tris = triangulateFace(vertices, face);

      for (const [i0, i1, i2] of tris) {
        const a = vertices[i0];
        const b = vertices[i1];
        const c = vertices[i2];

        // Get sonobe pyramid subdivision (apex is raised)
        const sonobe = sonobeSubdivide(a, b, c);

        // 3 colors for the 3 sonobe units meeting at this face
        const unitColors = [
          new THREE.Color(SONOBE_COLORS[(triCounter * 3) % SONOBE_COLORS.length]),
          new THREE.Color(SONOBE_COLORS[(triCounter * 3 + 1) % SONOBE_COLORS.length]),
          new THREE.Color(SONOBE_COLORS[(triCounter * 3 + 2) % SONOBE_COLORS.length]),
        ];

        for (let t = 0; t < sonobe.triangles.length; t++) {
          const tri = sonobe.triangles[t];
          const color = unitColors[sonobe.colors[t]];

          const p0 = sonobe.vertices[tri[0]];
          const p1 = sonobe.vertices[tri[1]];
          const p2 = sonobe.vertices[tri[2]];

          // Compute per-triangle normal (since pyramid faces have different orientations)
          const n = faceNormal(p0, p1, p2);

          positions.push(p0[0], p0[1], p0[2]);
          positions.push(p1[0], p1[1], p1[2]);
          positions.push(p2[0], p2[1], p2[2]);

          colors.push(color.r, color.g, color.b);
          colors.push(color.r, color.g, color.b);
          colors.push(color.r, color.g, color.b);

          normals.push(n[0], n[1], n[2]);
          normals.push(n[0], n[1], n[2]);
          normals.push(n[0], n[1], n[2]);
        }

        // Edge lines for the pyramid
        const sv = sonobe.vertices;
        // apex = 6, edges from apex to vertices and midpoints
        const edgePairs = [
          [0, 6], [1, 6], [2, 6],       // vertices to apex
          [3, 6], [4, 6], [5, 6],       // midpoints to apex
          [0, 3], [3, 1], [1, 4], [4, 2], [2, 5], [5, 0], // base edges
        ];
        for (const [ei, ej] of edgePairs) {
          edgePoints.push(sv[ei][0], sv[ei][1], sv[ei][2]);
          edgePoints.push(sv[ej][0], sv[ej][1], sv[ej][2]);
        }

        triCounter++;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePoints, 3));

    return { geometry: geo, edgeGeometry: edgeGeo };
  }, [vertices, faces]);

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          roughness={0.7}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color="#3a3a3a" linewidth={1} />
      </lineSegments>
    </group>
  );
}
