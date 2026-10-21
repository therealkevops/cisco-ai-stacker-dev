import React from 'react';
import { routeEdges } from './geometry.js';

// Dash patterns per link type, so types read apart without relying on colour.
const DASH = {
  composes: undefined,
  runs: '2 4',
  network: '10 4',
  manages: '5 3',
  secures: '12 3 2 3',
  observes: '1 5',
  feeds: '7 3 1.5 3',
};

// The lines drawn over the stack. They sit below the chips (which are opaque) and above the band
// backgrounds, and never take pointer events.
export default function Overlay({ links, rects, width, height, hoverId, anchorId }) {
  if (!rects || !width) return null;
  const routed = routeEdges(links, rects);
  return (
    <svg className="overlay" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M1,1 L9,5 L1,9" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
        </marker>
        <marker id="whole" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <circle cx="5" cy="5" r="3.2" fill="var(--paper)" stroke="var(--accent)" strokeWidth="1.5" />
        </marker>
      </defs>
      {routed.map(({ link, d }) => {
        const other = anchorId ? (link.a === anchorId ? link.b : link.a) : null;
        const emphasised = hoverId && (other === hoverId || link.a === hoverId || link.b === hoverId);
        const faded = hoverId && !emphasised;
        return (
          <path
            key={link.a + link.b + link.type}
            d={d}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={emphasised ? 2.6 : 1.5}
            strokeDasharray={DASH[link.type]}
            strokeLinecap={link.type === 'observes' ? 'round' : 'butt'}
            opacity={faded ? 0.18 : 1}
            markerStart={link.type === 'composes' ? 'url(#whole)' : undefined}
            markerEnd={link.type === 'composes' ? undefined : 'url(#arrow)'}
          />
        );
      })}
    </svg>
  );
}
