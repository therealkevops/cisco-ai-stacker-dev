import React, { useMemo } from 'react';
import { PRIMITIVES, NODES } from '../data/stack.js';
import { nodeById, layoutOrder, linksBetweenProducts, membersOf, coverage, productsIn, assess, caseById, href } from '../data/model.js';
import { layoutMap, allCells, hexPoints, toPixel, linkPath, wrapLabel, cellKey } from './hexgrid.js';

const SIZE = 52; // centre-to-corner of a cell, in map units
const GAP = 0.93; // hexes are drawn slightly smaller than their cell, leaving a thin channel between
const MAX_LABEL = 11; // characters per line inside a product hex

// Dash pattern per relationship, so types read apart without relying on colour.
const DASH = { composes: undefined, runs: '2 4', network: '10 4', manages: '5 3', secures: '12 3 2 3', observes: '1 5', feeds: '7 3 1.5 3' };

const layout = layoutMap(PRIMITIVES, layoutOrder(), SIZE);
const used = new Set([...layout.values()].map((c) => cellKey(c.q, c.r)));
const ghosts = allCells(6).filter(([q, r]) => !used.has(cellKey(q, r))).map(([q, r]) => ({ q, r, ...toPixel(q, r, SIZE) }));

const bounds = (() => {
  const xs = [];
  const ys = [];
  for (const c of layout.values()) for (const [x, y] of hexPoints(c.x, c.y, SIZE)) (xs.push(x), ys.push(y));
  const pad = 26;
  return { x: Math.min(...xs) - pad, y: Math.min(...ys) - pad, w: Math.max(...xs) - Math.min(...xs) + pad * 2, h: Math.max(...ys) - Math.min(...ys) + pad * 2 };
})();

function Label({ lines, cls, dy = 0 }) {
  const lh = cls === 'primitive-label' ? 20 : 14;
  const start = -((lines.length - 1) * lh) / 2 + dy;
  // A single long word cannot wrap, so the label shrinks a little to stay inside its hexagon.
  const long = Math.max(...lines.map((l) => l.length)) >= 12;
  return (
    <text className={cls} textAnchor="middle" style={long ? { fontSize: '10px' } : undefined}>
      {lines.map((line, i) => (
        <tspan key={i} x="0" y={start + i * lh} dominantBaseline="central">{line}</tspan>
      ))}
    </text>
  );
}

export default function HexMap({ route }) {
  // What is lit for the current selection: a product and its neighbours, a design's members, or a
  // primitive's own products.
  const view = useMemo(() => {
    const none = { lit: null, links: [], selected: null, badges: null, needs: null };
    if (route.kind === 'product') {
      const links = linksBetweenProducts(route.id);
      const lit = new Set([route.id, ...links.map((l) => (l.a === route.id ? l.b : l.a))]);
      lit.add(nodeById.get(route.id).primitive);
      return { lit, links, selected: route.id, badges: null };
    }
    if (route.kind === 'design') {
      const members = membersOf(route.id);
      const rows = coverage(route.id);
      const lit = new Set(members);
      for (const r of rows) if (r.have > 0) lit.add(r.primitive.id);
      return { lit, links: [], selected: null, badges: new Map(rows.map((r) => [r.primitive.id, r])) };
    }
    if (route.kind === 'usecase') {
      // Each product a use case names carries its role, and, with a design chosen, whether the design
      // meets it. Of a set of alternatives, the ones the design does not include fade out.
      const assessed = route.design ? assess(route.id, route.design) : null;
      const needs = new Map();
      caseById.get(route.id).needs.forEach((need, i) => {
        for (const pid of need.products) {
          let state = 'open';
          if (assessed) state = assessed[i].met ? (assessed[i].metBy.includes(pid) ? 'met' : 'alt') : 'gap';
          needs.set(pid, { role: need.role, state });
        }
      });
      const lit = new Set(needs.keys());
      for (const pid of needs.keys()) lit.add(nodeById.get(pid).primitive);
      return { ...none, lit, needs };
    }
    if (route.kind === 'primitive') {
      const lit = new Set([route.id, ...productsIn(route.id).map((n) => n.id)]);
      return { ...none, lit, selected: route.id };
    }
    return none;
  }, [route]);

  const stateOf = (id) => {
    if (!view.lit) return '';
    if (id === view.selected) return 'sel';
    const need = view.needs?.get(id);
    if (need?.state === 'alt') return 'dim';
    return view.lit.has(id) ? 'lit' : 'dim';
  };
  const needClass = (id) => {
    const need = view.needs?.get(id);
    return need && need.state !== 'alt' ? `need ${need.role === 'required' ? 'req' : 'rec'} ${need.state}` : '';
  };

  return (
    <svg
      className="map"
      viewBox={`${bounds.x} ${bounds.y} ${bounds.w} ${bounds.h}`}
      role="group"
      aria-label="Honeycomb map of the Cisco AI stack. The centre is the AI workload, the ring around it is the six primitives, and each primitive's products sit beside it."
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1,1 L9,5 L1,9" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        </marker>
        <marker id="whole" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <circle cx="5" cy="5" r="3.2" fill="var(--paper)" stroke="var(--accent)" strokeWidth="1.6" />
        </marker>
      </defs>

      <g className="ghosts" aria-hidden="true">
        {ghosts.map((c) => (
          <polygon key={cellKey(c.q, c.r)} points={hexPoints(c.x, c.y, SIZE * GAP).map((p) => p.join(',')).join(' ')} />
        ))}
      </g>

      <a href={href.home} aria-label="AI workloads: models and agents. Clear the selection.">
        <g className="hex centre" transform={`translate(${layout.get('__centre').x},${layout.get('__centre').y})`}>
          <polygon points={hexPoints(0, 0, SIZE * GAP).map((p) => p.join(',')).join(' ')} />
        </g>
      </a>

      {PRIMITIVES.map((p) => {
        const c = layout.get(p.id);
        return (
          <a key={p.id} href={href.primitive(p.id)} aria-label={`${p.name}: ${productsIn(p.id).length} products`}>
            <g className={`hex primitive p-${p.id} ${stateOf(p.id)}`} transform={`translate(${c.x},${c.y})`}>
              <title>{p.name}</title>
              <polygon points={hexPoints(0, 0, SIZE * GAP).map((q) => q.join(',')).join(' ')} />
            </g>
          </a>
        );
      })}

      {NODES.filter((n) => !n.kind).map((n) => {
        const c = layout.get(n.id);
        const cls = ['hex', 'product', `p-${n.primitive}`, n.vendor, n.status === 'check' ? 'unverified' : '', stateOf(n.id), needClass(n.id)].filter(Boolean).join(' ');
        return (
          <a key={n.id} href={href.product(n.id)} aria-label={`${n.name}, ${n.vendor === 'cisco' ? 'Cisco' : 'partner'}${n.status === 'check' ? ', not yet confirmed' : ''}`}>
            <g className={cls} transform={`translate(${c.x},${c.y})`}>
              <title>{n.name}</title>
              <polygon points={hexPoints(0, 0, SIZE * GAP).map((q) => q.join(',')).join(' ')} />
            </g>
          </a>
        );
      })}

      {/* Lines sit above the hexes so they are never hidden, each over a paper-coloured halo; they
          stop at the hexagon edges, so labels are not crossed. */}
      <g className="links" aria-hidden="true">
        {view.links.map((l) => {
          const { d } = linkPath(layout.get(l.a), layout.get(l.b), SIZE);
          const key = l.a + l.b + l.type;
          return (
            <g key={key}>
              <path className="halo" d={d} fill="none" />
              <path d={d} fill="none" strokeDasharray={DASH[l.type]}
                strokeLinecap={l.type === 'observes' ? 'round' : 'butt'}
                markerStart={l.type === 'composes' ? 'url(#whole)' : undefined}
                markerEnd={l.type === 'composes' ? undefined : 'url(#arrow)'} />
            </g>
          );
        })}
      </g>

      {/* Labels are the top layer, so a line passing behind a hex never crosses its text. */}
      <g className="labels" aria-hidden="true">
        <g transform={`translate(${layout.get('__centre').x},${layout.get('__centre').y})`}>
          <Label lines={['AI', 'workloads']} cls="centre-label" />
        </g>
        {PRIMITIVES.map((p) => {
          const c = layout.get(p.id);
          const badge = view.badges?.get(p.id);
          return (
            <g key={p.id} className={`hex primitive p-${p.id} ${stateOf(p.id)}`} transform={`translate(${c.x},${c.y})`}>
              <Label lines={[p.label]} cls="primitive-label" dy={badge ? -6 : 0} />
              {badge && (
                <text className="badge" textAnchor="middle" x="0" y="16" dominantBaseline="central">
                  {badge.have} of {badge.total}
                </text>
              )}
            </g>
          );
        })}
        {NODES.filter((n) => !n.kind).map((n) => {
          const c = layout.get(n.id);
          const need = view.needs?.get(n.id);
          return (
            <g key={n.id} className={`hex product p-${n.primitive} ${stateOf(n.id)}`} transform={`translate(${c.x},${c.y})`}>
              <Label lines={wrapLabel(n.short || n.name, MAX_LABEL)} cls="product-label" />
              {need && (need.state === 'met' || need.state === 'gap') && (
                <g className={`need-badge ${need.state}`} transform={`translate(${SIZE * 0.6},${-SIZE * 0.55})`}>
                  <circle r="9.5" />
                  <path d={need.state === 'met' ? 'M-4.2,0.4 L-1.2,3.4 L4.4,-3' : 'M-4,0 H4 M0,-4 V4'} />
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
