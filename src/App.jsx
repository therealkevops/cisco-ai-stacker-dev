import React, { useEffect, useState } from 'react';
import { parseRoute, nodeById, primitiveById, caseById } from './data/model.js';
import HexMap from './map/HexMap.jsx';
import Panel from './panel/Panel.jsx';

const TITLE = 'The Cisco AI Stack';

function titleFor(route) {
  const names = { primitive: primitiveById, usecase: caseById };
  const name = route.kind ? (names[route.kind] || nodeById).get(route.id).name : null;
  return name ? `${name} · ${TITLE}` : TITLE;
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement)) window.location.hash = '#/';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app">
      <main className="map-wrap">
        <HexMap route={route} />
      </main>
      <Panel route={route} />
    </div>
  );
}
