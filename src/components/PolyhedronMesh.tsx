import { useMemo } from 'react';
import * as THREE from 'three';
import type { Polyhedron, DisplayMode } from '../types';
import { SonobeOverlay } from './SonobeOverlay';
import { normalizeScale, triangulateFace } from '../utils/geometry';

interface PolyhedronMeshProps {
  polyhedron: Polyhedron;
  displayMode: DisplayMode;
}

export function PolyhedronMesh({ polyhedron, displayMode }: PolyhedronMeshProps) {
  const scaledVertices = useMemo(
    () => normalizeScale(polyhedron.vertices),
    [polyhedron]
  );

  const solidGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];

    for (const face of polyhedron.faces) {
      const tris = triangulateFace(scaledVertices, face);
      for (const [i0, i1, i2] of tris) {
        const a = scaledVertices[i0];
        const b = scaledVertices[i1];
        const c = scaledVertices[i2];

        positions.push(a[0], a[1], a[2]);
        positions.push(b[0], b[1], b[2]);
        positions.push(c[0], c[1], c[2]);

        // Compute face normal
        const e1 = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        const e2 = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
        const n = e1.cross(e2).normalize();

        normals.push(n.x, n.y, n.z);
        normals.push(n.x, n.y, n.z);
        normals.push(n.x, n.y, n.z);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geo;
  }, [polyhedron, scaledVertices]);

  const edgesGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const edgeSet = new Set<string>();

    for (const face of polyhedron.faces) {
      for (let i = 0; i < face.length; i++) {
        const a = face[i];
        const b = face[(i + 1) % face.length];
        const key = [Math.min(a, b), Math.max(a, b)].join('-');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          const va = scaledVertices[a];
          const vb = scaledVertices[b];
          points.push(
            new THREE.Vector3(va[0], va[1], va[2]),
            new THREE.Vector3(vb[0], vb[1], vb[2])
          );
        }
      }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [polyhedron, scaledVertices]);

  if (displayMode === 'sonobe') {
    return (
      <SonobeOverlay
        vertices={scaledVertices}
        faces={polyhedron.faces}
      />
    );
  }

  if (displayMode === 'wireframe') {
    return (
      <group>
        <lineSegments geometry={edgesGeometry}>
          <lineBasicMaterial color="#2a2a2a" linewidth={1.5} />
        </lineSegments>
        {/* Small spheres at vertices */}
        {scaledVertices.map((v, i) => (
          <mesh key={i} position={v}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
        ))}
      </group>
    );
  }

  // Solid mode
  return (
    <group>
      <mesh geometry={solidGeometry}>
        <meshStandardMaterial
          color="#e8ddd3"
          roughness={0.6}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#8a7e74" linewidth={1} />
      </lineSegments>
    </group>
  );
}
