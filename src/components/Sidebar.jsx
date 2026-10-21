import React from 'react';
import { LAYERS, NODES, LINK_TYPES } from '../data/stack.js';
import { LINK_STYLE } from '../render/draw.js';

function Swatch({ type }) {
  const s = LINK_STYLE[type];
  return (
    <svg width="34" height="8" aria-hidden="true">
      <line
        x1="1" y1="4" x2="33" y2="4"
        stroke="currentColor"
        strokeWidth={s.width}
        strokeDasharray={s.dash.length ? s.dash.join(' ') : undefined}
        strokeLinecap={s.cap || 'butt'}
      />
    </svg>
  );
}

export default function Sidebar({ query, setQuery, matchIds, selectedId, onSelect, hiddenTypes, toggleType, gravity, setGravity, drift, setDrift, onReset }) {
  const onSearchKey = (e) => {
    if (e.key === 'Enter' && matchIds && matchIds.size) {
      onSelect(NODES.find((n) => matchIds.has(n.id)).id);
    }
    if (e.key === 'Escape') setQuery('');
  };

  return (
    <aside className="side" aria-label="Browse and tune the chart">
      <header className="masthead">
        <p className="kicker">Plate I</p>
        <h1>The Cisco AI Stack, in orbit</h1>
        <p className="lede">
          Heavy hardware sinks toward the centre; software and agents ride the outer orbits. Lines are the integrations between them.
        </p>
      </header>

      <label className="field">
        <span className="label">Find</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onSearchKey}
          placeholder="Product, partner or word"
          spellCheck="false"
        />
      </label>

      <section aria-labelledby="tune">
        <h2 id="tune" className="label">Mechanics</h2>
        <label className="row">
          <span>Gravity</span>
          <input type="range" min="0" max="2" step="0.05" value={gravity} onChange={(e) => setGravity(Number(e.target.value))} aria-label="Gravity" />
          <output>{gravity.toFixed(2)}</output>
        </label>
        <div className="row buttons">
          <button type="button" aria-pressed={drift} onClick={() => setDrift(!drift)}>
            {drift ? 'Orbiting' : 'Held still'}
          </button>
          <button type="button" onClick={onReset}>Reset layout</button>
        </div>
      </section>

      <section aria-labelledby="legend">
        <h2 id="legend" className="label">Integrations</h2>
        <ul className="legend">
          {LINK_TYPES.map((t) => (
            <li key={t.id}>
              <button type="button" aria-pressed={!hiddenTypes.has(t.id)} onClick={() => toggleType(t.id)} title={t.note}>
                <Swatch type={t.id} />
                <span>{t.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="key">
          <span className="dot filled" aria-hidden="true" /> Cisco
          <span className="dot open" aria-hidden="true" /> Partner
          <span className="dot filled tick" aria-hidden="true" /> Unverified
        </p>
      </section>

      <nav aria-label="Bodies by orbit">
        {LAYERS.map((layer, i) => (
          <section key={layer.id} className="orbit">
            <h2 className="label">
              <span className="num">{String(i + 1).padStart(2, '0')}</span> {layer.name}
            </h2>
            <ul>
              {NODES.filter((n) => n.layer === layer.id).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={'node' + (matchIds && !matchIds.has(n.id) ? ' faded' : '')}
                    aria-pressed={selectedId === n.id}
                    onClick={() => onSelect(selectedId === n.id ? null : n.id)}
                  >
                    <span className={'dot ' + (n.vendor === 'cisco' ? 'filled' : 'open')} aria-hidden="true" />
                    {n.name}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
