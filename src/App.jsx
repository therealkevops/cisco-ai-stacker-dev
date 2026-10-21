import React, { useEffect, useState } from 'react';
import { parseRoute, layerById, nodeById, journeyById } from './data/model.js';
import StackView from './views/StackView.jsx';
import LayerView from './views/LayerView.jsx';
import NodeView from './views/NodeView.jsx';

const TITLE = 'The Cisco AI Stack';

function titleFor(route) {
  let name = null;
  if (route.view === 'layer') name = layerById.get(route.id).name;
  else if (route.view === 'node') name = nodeById.get(route.id).name;
  else if (route.pick) name = nodeById.get(route.pick).name;
  else if (route.journey) name = journeyById.get(route.journey.id).title;
  return name ? `${name} · ${TITLE}` : TITLE;
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Moving between pages scrolls back to the top. Picking a product or stepping through a journey
  // stays on the stack page and must not, or the diagram would jump under the reader.
  const pageKey = route.view === 'stack' ? 'stack' : `${route.view}/${route.id}`;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageKey]);

  useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  return (
    <main className="page">
      {route.view === 'layer' && <LayerView id={route.id} />}
      {route.view === 'node' && <NodeView id={route.id} />}
      {route.view === 'stack' && <StackView pick={route.pick} journey={route.journey} />}
    </main>
  );
}
