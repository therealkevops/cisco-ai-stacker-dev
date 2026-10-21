import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  nodesIn, stackLayers, crossLayers, frameLayer, hrefLayer, hrefPick, hrefJourney,
  edgesOf, edgesAmong, journeyById,
} from '../data/model.js';
import { NODES, LINKS } from '../data/stack.js';
import { JOURNEYS } from '../data/journeys.js';
import { VendorDot, Legend } from './Marks.jsx';
import Overlay from './Overlay.jsx';
import { PickTray, JourneyTray } from './Tray.jsx';

// What a route lights up: the chips, the lines between them and the journey step if there is one.
function focusOf(pick, journey) {
  if (pick) {
    const links = edgesOf(pick);
    return { lit: new Set([pick, ...links.map((l) => (l.a === pick ? l.b : l.a))]), links, step: null };
  }
  if (journey) {
    const step = journeyById.get(journey.id).steps[journey.step - 1];
    return { lit: new Set(step.nodes), links: edgesAmong(step.nodes), step };
  }
  return { lit: null, links: [], step: null };
}

// Scroll so every lit chip sits in the space above the tray, centred if they fit and from the top if
// not. The tray's own height is measured, so this holds on any screen.
function fitToView(chipEls, ids) {
  const tray = document.querySelector('.tray');
  const region = window.innerHeight - (tray ? tray.offsetHeight : 0) - 40;
  let top = Infinity;
  let bottom = -Infinity;
  for (const id of ids) {
    const el = chipEls.get(id);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top + window.scrollY);
    bottom = Math.max(bottom, r.bottom + window.scrollY);
  }
  if (!Number.isFinite(top)) return;
  const height = bottom - top;
  const want = height <= region ? top - (region - height) / 2 : top - 16;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, want), behavior: calm ? 'auto' : 'smooth' });
}

function Chip({ node, state, register }) {
  const cls = ['chip', node.status === 'check' ? 'unverified' : '', state].filter(Boolean).join(' ');
  return (
    <li>
      <a ref={(el) => register(node.id, el)} className={cls} href={state === 'sel' ? '#/' : hrefPick(node.id)} aria-current={state === 'sel' ? 'true' : undefined}>
        <VendorDot vendor={node.vendor} />
        {node.name}
      </a>
    </li>
  );
}

function Chips({ layerId, stateOf, register }) {
  return (
    <ul className="chips">
      {nodesIn(layerId).map((n) => (
        <Chip key={n.id} node={n} state={stateOf(n.id)} register={register} />
      ))}
    </ul>
  );
}

export default function StackView({ pick, journey }) {
  const frameRef = useRef(null);
  const chipEls = useRef(new Map());
  const [geo, setGeo] = useState({ rects: null, width: 0, height: 0 });
  const [hoverId, setHoverId] = useState(null);

  // Bring what was just lit into view, clear of the tray.
  const stepNumber = journey?.step;
  const journeyId = journey?.id;
  useEffect(() => {
    const { lit } = focusOf(pick, journeyId ? { id: journeyId, step: stepNumber } : null);
    if (!lit) return;
    const frame = requestAnimationFrame(() => fitToView(chipEls.current, lit));
    return () => cancelAnimationFrame(frame);
  }, [pick, journeyId, stepNumber]);

  const register = useCallback((id, el) => {
    if (el) chipEls.current.set(id, el);
    else chipEls.current.delete(id);
  }, []);

  // Measure every chip relative to the frame. Runs when the frame resizes and when web fonts land,
  // since either can change how chips wrap. Selection never changes the layout, so it does not rerun.
  useEffect(() => {
    const frame = frameRef.current;
    const measure = () => {
      const f = frame.getBoundingClientRect();
      const rects = new Map();
      for (const [id, el] of chipEls.current) {
        const r = el.getBoundingClientRect();
        rects.set(id, { x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height });
      }
      setGeo({ rects, width: f.width, height: f.height });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    document.fonts?.addEventListener('loadingdone', measure);
    document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener('loadingdone', measure);
    };
  }, []);

  const { lit, links } = focusOf(pick, journey);
  const stateOf = (id) => {
    if (!lit) return '';
    if (id === pick) return 'sel';
    return lit.has(id) ? 'on' : 'dim';
  };

  return (
    <div className={lit ? 'has-tray' : ''}>
      <header className="stack-head">
        <div>
          <p className="kicker">The Cisco AI Stack</p>
          <h1>What sits where, and how it connects</h1>
          <p className="lede">
            Pick any product to light up what it connects to, or follow a journey. {NODES.length} products, {LINKS.length} integrations.
          </p>
        </div>
        <nav aria-label="Guided journeys">
          <p className="label">Guided journeys</p>
          <ul className="journeys">
            {JOURNEYS.map((j) => (
              <li key={j.id}>
                <a href={hrefJourney(j.id)} className={journey?.id === j.id ? 'current' : ''} title={j.blurb}>
                  {j.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <div className="frame" ref={frameRef}>
        <Overlay links={links} rects={geo.rects} width={geo.width} height={geo.height} hoverId={hoverId} anchorId={pick} />
        <section className="frame-head" aria-labelledby="b-design">
          <a className="band-head" href={hrefLayer(frameLayer.id)}>
            <span>
              <h2 id="b-design">{frameLayer.name}</h2>
              <span className="summary">{frameLayer.tagline}</span>
            </span>
            <span className="open" aria-hidden="true">Open layer</span>
          </a>
          <Chips layerId={frameLayer.id} stateOf={stateOf} register={register} />
        </section>

        <div className="frame-body">
          <div className="stack" role="group" aria-label="The stack, top to bottom">
            {stackLayers.map((l, i) => (
              <section key={l.id} className="band" aria-labelledby={`b-${l.id}`}>
                <a className="band-head" href={hrefLayer(l.id)}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <h2 id={`b-${l.id}`}>{l.name}</h2>
                    <span className="summary">{l.tagline}</span>
                  </span>
                  <span className="open" aria-hidden="true">Open layer</span>
                </a>
                <Chips layerId={l.id} stateOf={stateOf} register={register} />
              </section>
            ))}
          </div>
          <div className="cross" role="group" aria-label="Layers that run across the whole stack">
            {crossLayers.map((l) => (
              <section key={l.id} className="band cross-band" aria-labelledby={`b-${l.id}`}>
                <a className="band-head" href={hrefLayer(l.id)}>
                  <span>
                    <h2 id={`b-${l.id}`}>{l.name}</h2>
                    <span className="summary">{l.tagline}</span>
                  </span>
                  <span className="open" aria-hidden="true">Open layer</span>
                </a>
                <Chips layerId={l.id} stateOf={stateOf} register={register} />
                <p className="spans">Runs across every layer</p>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Legend lines={links.length > 0} />

      {pick && <PickTray id={pick} onHover={setHoverId} />}
      {journey && <JourneyTray journey={journeyById.get(journey.id)} step={journey.step} />}
    </div>
  );
}
