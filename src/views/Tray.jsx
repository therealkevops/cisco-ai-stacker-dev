import React, { useEffect, useState } from 'react';
import { nodeById, layerById, linksOf, hrefNode, hrefPick, hrefJourney } from '../data/model.js';
import { LINK_TYPES } from '../data/stack.js';
import { VendorDot } from './Marks.jsx';

// The panel pinned to the foot of the screen. It is kept short so the diagram stays visible above
// it, and it never moves the diagram, so a reader can click from chip to chip without the page
// shifting under the pointer.

export function PickTray({ id, onHover }) {
  const node = nodeById.get(id);
  const links = linksOf(id);
  const [hint, setHint] = useState(null);
  const groups = LINK_TYPES.flatMap((t) =>
    [t.from, t.to].map((name) => ({ key: t.id + name, name, items: links.filter((l) => l.type === t.id && l.phrase === name) })),
  ).filter((g) => g.items.length);

  const show = (l) => {
    setHint(l);
    onHover(l.other.id);
  };
  const clear = () => {
    setHint(null);
    onHover(null);
  };

  return (
    <aside className="tray" aria-label={`${node.name}: connections`}>
      <div className="tray-top">
        <div>
          <p className="kicker"><VendorDot vendor={node.vendor} />{node.vendor === 'cisco' ? 'Cisco' : 'Partner'} &middot; {layerById.get(node.layer).name}</p>
          <h2>{node.name}</h2>
        </div>
        <p className="tray-actions">
          <a href={hrefNode(id)}>Open page</a>
          <a href="#/">Clear</a>
        </p>
      </div>
      <p className="tray-text" aria-live="polite">
        {hint ? (
          <>
            <strong>{hint.phrase} {hint.other.name}.</strong> {hint.label}
            {hint.status === 'check' && <em> Not yet confirmed against a public page.</em>}
          </>
        ) : (
          <>
            {node.blurb}
            {node.status === 'check' && <em> Not yet confirmed against a public page.</em>}
          </>
        )}
      </p>
      <div className="rel-inline" onMouseLeave={clear}>
        {groups.map((g) => (
          <div key={g.key} className="rel-g">
            <span className="rg-name">{g.name}</span>
            {g.items.map((l) => (
              <a key={l.other.id + l.type} href={hrefPick(l.other.id)} className={l.status === 'check' ? 'unverified' : ''}
                onMouseEnter={() => show(l)} onFocus={() => show(l)} onBlur={clear}>
                {l.other.name}
              </a>
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}

export function JourneyTray({ journey, step }) {
  const total = journey.steps.length;
  const s = journey.steps[step - 1];
  const prev = step > 1 ? hrefJourney(journey.id, step - 1) : null;
  const next = step < total ? hrefJourney(journey.id, step + 1) : null;

  // Arrow keys step through, unless the reader is typing somewhere.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowRight' && next) window.location.hash = next;
      if (e.key === 'ArrowLeft' && prev) window.location.hash = prev;
      if (e.key === 'Escape') window.location.hash = '#/';
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <aside className="tray journey" aria-label={`${journey.title}, step ${step} of ${total}`}>
      <div className="tray-top">
        <div>
          <p className="kicker">{journey.title} &middot; Step {step} of {total}</p>
          <h2>{s.title}</h2>
        </div>
        <p className="tray-actions">
          {prev ? <a href={prev}>Back</a> : <span className="off">Back</span>}
          {next ? <a href={next} className="primary">Next</a> : <a href="#/" className="primary">Finish</a>}
          <a href="#/">Exit</a>
        </p>
      </div>
      <p className="tray-text">{s.text}</p>
      <ol className="step-pills">
        {journey.steps.map((st, i) => (
          <li key={st.title}>
            <a href={hrefJourney(journey.id, i + 1)} title={st.title} aria-label={`Step ${i + 1}: ${st.title}`} aria-current={i + 1 === step ? 'step' : undefined}>
              {i + 1}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
