import React, { useEffect, useState } from 'react';
import { parseRoute, MODELS } from './data/model.js';
import HexMap from './map/HexMap.jsx';
import Panel from './panel/Panel.jsx';

function titleFor(route) {
  const model = MODELS[route.lens];
  const names = { primitive: model.primitiveById, usecase: model.caseById };
  const name = route.kind ? (names[route.kind] || model.nodeById).get(route.id).name : null;
  return name ? `${name} · ${model.data.title}` : model.data.title;
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      setHoverId(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) window.location.hash = MODELS[parseRoute(window.location.hash).lens].href.home;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const model = MODELS[route.lens];
  return (
    <div className="app">
      <main className="map-wrap">
        <HexMap model={model} route={route} hoverId={hoverId} />
      </main>
      <Panel model={model} route={route} onHover={setHoverId} />
    </div>
  );
}
