import React, { useEffect, useState } from 'react';
import { parseRoute, layerById, nodeById } from './data/model.js';
import StackView from './views/StackView.jsx';
import LayerView from './views/LayerView.jsx';
import NodeView from './views/NodeView.jsx';

const TITLE = 'The Cisco AI Stack';

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Each level is its own page as far as the reader is concerned: new title, back at the top.
  useEffect(() => {
    const name = route.view === 'layer' ? layerById.get(route.id).name : route.view === 'node' ? nodeById.get(route.id).name : null;
    document.title = name ? `${name} · ${TITLE}` : TITLE;
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <main className="page">
      {route.view === 'layer' && <LayerView id={route.id} />}
      {route.view === 'node' && <NodeView id={route.id} />}
      {route.view === 'stack' && <StackView />}
    </main>
  );
}
