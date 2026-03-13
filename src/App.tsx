import { useState } from 'react';
import { Viewer } from './components/Viewer';
import { Sidebar } from './components/Sidebar';
import { ControlPanel } from './components/ControlPanel';
import { platonicSolids } from './data/platonic';
import { archimedeanSolids } from './data/archimedean';
import type { Polyhedron, DisplayMode } from './types';

const allPolyhedra = [...platonicSolids, ...archimedeanSolids];

function App() {
  const [selected, setSelected] = useState<Polyhedron>(allPolyhedra[4]); // Icosahedron
  const [displayMode, setDisplayMode] = useState<DisplayMode>('solid');
  const [autoRotate, setAutoRotate] = useState(true);

  const allTriangular = selected.faces.every(f => f.length === 3);

  const handleSelect = (p: Polyhedron) => {
    setSelected(p);
    const isTriangular = p.faces.every(f => f.length === 3);
    if (!isTriangular && displayMode === 'sonobe') {
      setDisplayMode('solid');
    }
  };

  return (
    <div className="app">
      <Sidebar
        polyhedra={allPolyhedra}
        selected={selected}
        onSelect={handleSelect}
      />
      <main className="main">
        <ControlPanel
          displayMode={displayMode}
          onModeChange={setDisplayMode}
          autoRotate={autoRotate}
          onAutoRotateChange={setAutoRotate}
          sonobeEnabled={allTriangular}
        />
        <div className="viewer-container">
          <Viewer
            polyhedron={selected}
            displayMode={displayMode}
            autoRotate={autoRotate}
          />
        </div>
        <div className="info-bar">
          <span className="info-name">{selected.name}</span>
          <span className="info-stats">
            {selected.vertices.length} vertices · {selected.faces.length} faces ·{' '}
            {new Set(selected.faces.map(f => f.length)).size === 1
              ? `${selected.faces[0].length}-gon faces`
              : [...new Set(selected.faces.map(f => f.length))].sort().map(n => `${n}-gon`).join(', ')
            }
          </span>
        </div>
      </main>
    </div>
  );
}

export default App;
