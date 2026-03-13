import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { PolyhedronMesh } from './PolyhedronMesh';
import type { Polyhedron, DisplayMode } from '../types';

interface ViewerProps {
  polyhedron: Polyhedron;
  displayMode: DisplayMode;
  autoRotate: boolean;
}

export function Viewer({ polyhedron, displayMode, autoRotate }: ViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ background: '#fafafa' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} />
      <PolyhedronMesh
        polyhedron={polyhedron}
        displayMode={displayMode}
      />
      <OrbitControls
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        enableDamping
        dampingFactor={0.05}
      />
      <Environment preset="studio" />
    </Canvas>
  );
}
