import type { Polyhedron } from '../types';

interface SidebarProps {
  polyhedra: Polyhedron[];
  selected: Polyhedron;
  onSelect: (p: Polyhedron) => void;
}

export function Sidebar({ polyhedra, selected, onSelect }: SidebarProps) {
  const platonic = polyhedra.filter(p => p.category === 'platonic');
  const archimedean = polyhedra.filter(p => p.category === 'archimedean');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Polyhedra</h1>
        <p className="subtitle">Origami Modeler</p>
      </div>

      <div className="sidebar-section">
        <h2>Platonic Solids</h2>
        <ul>
          {platonic.map(p => (
            <li key={p.name}>
              <button
                className={`poly-button ${selected.name === p.name ? 'active' : ''}`}
                onClick={() => onSelect(p)}
              >
                <span className="poly-name">{p.name}</span>
                <span className="poly-info">{p.faces.length}f · {p.vertices.length}v</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h2>Archimedean Solids</h2>
        <ul>
          {archimedean.map(p => (
            <li key={p.name}>
              <button
                className={`poly-button ${selected.name === p.name ? 'active' : ''}`}
                onClick={() => onSelect(p)}
              >
                <span className="poly-name">{p.name}</span>
                <span className="poly-info">{p.faces.length}f · {p.vertices.length}v</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
