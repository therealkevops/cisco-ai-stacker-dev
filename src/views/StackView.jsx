import React from 'react';
import { nodesIn, stackLayers, crossLayers, frameLayer, hrefLayer, hrefNode } from '../data/model.js';
import { NODES, LINKS } from '../data/stack.js';
import { VendorDot, Legend } from './Marks.jsx';

function Chips({ layerId }) {
  return (
    <ul className="chips">
      {nodesIn(layerId).map((n) => (
        <li key={n.id}>
          <a className={'chip' + (n.status === 'check' ? ' unverified' : '')} href={hrefNode(n.id)}>
            <VendorDot vendor={n.vendor} />
            {n.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Band({ layer, index }) {
  return (
    <section className="band" aria-labelledby={`b-${layer.id}`}>
      <a className="band-head" href={hrefLayer(layer.id)}>
        <span className="num">{String(index).padStart(2, '0')}</span>
        <span>
          <h2 id={`b-${layer.id}`}>{layer.name}</h2>
          <span className="summary">{layer.summary}</span>
        </span>
        <span className="open" aria-hidden="true">Open</span>
      </a>
      <Chips layerId={layer.id} />
    </section>
  );
}

export default function StackView() {
  return (
    <>
      <header className="masthead">
        <p className="kicker">The Cisco AI Stack</p>
        <h1>What sits where, and how it connects</h1>
        <p className="lede">
          Choose a layer to see its products, or a product to see its integrations. {NODES.length} products, {LINKS.length} integrations.
        </p>
      </header>

      <div className="frame">
        <section className="frame-head" aria-labelledby="b-design">
          <a className="band-head" href={hrefLayer(frameLayer.id)}>
            <span>
              <h2 id="b-design">{frameLayer.name}</h2>
              <span className="summary">{frameLayer.summary}</span>
            </span>
            <span className="open" aria-hidden="true">Open</span>
          </a>
          <Chips layerId={frameLayer.id} />
        </section>

        <div className="frame-body">
          <div className="stack" role="group" aria-label="The stack, top to bottom">
            {stackLayers.map((l, i) => (
              <Band key={l.id} layer={l} index={i + 1} />
            ))}
          </div>
          <div className="cross" role="group" aria-label="Layers that run across the whole stack">
            {crossLayers.map((l) => (
              <section key={l.id} className="band cross-band" aria-labelledby={`b-${l.id}`}>
                <a className="band-head" href={hrefLayer(l.id)}>
                  <span>
                    <h2 id={`b-${l.id}`}>{l.name}</h2>
                    <span className="summary">{l.summary}</span>
                  </span>
                  <span className="open" aria-hidden="true">Open</span>
                </a>
                <Chips layerId={l.id} />
                <p className="spans">Runs across every layer</p>
              </section>
            ))}
          </div>
        </div>
      </div>
      <Legend />
    </>
  );
}
