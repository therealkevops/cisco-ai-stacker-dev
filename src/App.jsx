import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NODES } from './data/stack.js';
import Chart from './components/Chart.jsx';
import Sidebar from './components/Sidebar.jsx';
import Detail from './components/Detail.jsx';

const ids = new Set(NODES.map((n) => n.id));
const fromHash = () => {
  const id = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''));
  return ids.has(id) ? id : null;
};

export default function App() {
  const [selectedId, setSelectedId] = useState(fromHash);
  const [query, setQuery] = useState('');
  const [hiddenTypes, setHiddenTypes] = useState(() => new Set());
  const [gravity, setGravity] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  // The selection lives in the URL hash, so a view can be shared as a link.
  useEffect(() => {
    const onHash = () => setSelectedId(fromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const onSelect = useCallback((id) => {
    setSelectedId(id);
    const next = id ? `#/${id}` : '';
    if (window.location.hash !== next) history.replaceState(null, '', window.location.pathname + window.location.search + next);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) onSelect(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSelect]);

  const matchIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(NODES.filter((n) => (n.name + ' ' + n.blurb).toLowerCase().includes(q)).map((n) => n.id));
  }, [query]);

  const toggleType = useCallback((id) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="app">
      <Sidebar
        query={query} setQuery={setQuery} matchIds={matchIds}
        selectedId={selectedId} onSelect={onSelect}
        hiddenTypes={hiddenTypes} toggleType={toggleType}
        gravity={gravity} setGravity={setGravity}
        onReset={() => setResetKey((k) => k + 1)}
      />
      <main className="stage">
        <Chart
          selectedId={selectedId} onSelect={onSelect}
          hiddenTypes={hiddenTypes} matchIds={matchIds}
          gravity={gravity} resetKey={resetKey}
        />
        <Detail nodeId={selectedId} onSelect={onSelect} onClose={() => onSelect(null)} />
        {!selectedId && <p className="hint">Drag a body, scroll to zoom, select one to pull in its integrations.</p>}
      </main>
    </div>
  );
}
