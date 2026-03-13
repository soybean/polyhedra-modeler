import type { DisplayMode } from '../types';

interface ControlPanelProps {
  displayMode: DisplayMode;
  onModeChange: (mode: DisplayMode) => void;
  autoRotate: boolean;
  onAutoRotateChange: (v: boolean) => void;
  sonobeEnabled: boolean;
}

export function ControlPanel({
  displayMode,
  onModeChange,
  autoRotate,
  onAutoRotateChange,
  sonobeEnabled,
}: ControlPanelProps) {
  const modes: { value: DisplayMode; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'wireframe', label: 'Wireframe' },
    { value: 'sonobe', label: 'Sonobe' },
  ];

  return (
    <div className="control-panel">
      <div className="mode-toggles">
        {modes.map(m => (
          <button
            key={m.value}
            className={`mode-button ${displayMode === m.value ? 'active' : ''}`}
            onClick={() => onModeChange(m.value)}
            disabled={m.value === 'sonobe' && !sonobeEnabled}
            title={m.value === 'sonobe' && !sonobeEnabled ? 'Sonobe only works on polyhedra with triangular faces' : undefined}
          >
            {m.label}
          </button>
        ))}
      </div>
      <label className="rotate-toggle">
        <input
          type="checkbox"
          checked={autoRotate}
          onChange={e => onAutoRotateChange(e.target.checked)}
        />
        <span>Auto-rotate</span>
      </label>
    </div>
  );
}
