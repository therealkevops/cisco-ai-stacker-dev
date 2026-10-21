import React from 'react';
import { nodeById, layerById, linksOf, hrefLayer, hrefNode, nodesIn } from '../data/model.js';
import { LINK_TYPES } from '../data/stack.js';
import { VendorDot } from './Marks.jsx';

export default function NodeView({ id }) {
  const node = nodeById.get(id);
  const layer = layerById.get(node.layer);
  const links = linksOf(id);
  // One group per way the integration reads from here ("Contains", "Is part of", ...), in type order.
  const groups = LINK_TYPES.flatMap((t) => [t.from, t.to].map((name) => ({ key: t.id + name, name, items: links.filter((l) => l.type === t.id && l.phrase === name) }))).filter((g) => g.items.length);
  const siblings = nodesIn(node.layer).filter((n) => n.id !== id);

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#/">Stack</a> <span aria-hidden="true">/</span> <a href={hrefLayer(layer.id)}>{layer.name}</a>{' '}
        <span aria-hidden="true">/</span> <span aria-current="page">{node.name}</span>
      </nav>
      <header className="masthead">
        <p className="kicker"><VendorDot vendor={node.vendor} /> {node.vendor === 'cisco' ? 'Cisco' : 'Partner'} &middot; {layer.name}</p>
        <h1>{node.name}</h1>
        <p className="lede">{node.blurb}</p>
        {node.status === 'check' && <p className="note">Not confirmed against a public page. Check before quoting.</p>}
        <p><a className="source" href={node.url} target="_blank" rel="noreferrer">Source</a></p>
      </header>

      <section className="section" aria-labelledby="ints">
        <h2 id="ints" className="label">{links.length} integration{links.length === 1 ? '' : 's'}</h2>
        {groups.map(({ key, name, items }) => (
          <div key={key} className="group">
            <h3>{name}</h3>
            <ul>
              {items.map((l) => (
                <li key={l.a + l.b + l.type}>
                  <a href={hrefNode(l.other.id)}>{l.other.name}</a>
                  <span className="layer-tag">{layerById.get(l.other.layer).name}</span>
                  <span className="why">
                    {l.label}
                    {l.status === 'check' && <em> (unverified)</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {siblings.length > 0 && (
        <section className="section" aria-labelledby="sib">
          <h2 id="sib" className="label">Also in {layer.name}</h2>
          <ul className="chips">
            {siblings.map((n) => (
              <li key={n.id}>
                <a className={'chip' + (n.status === 'check' ? ' unverified' : '')} href={hrefNode(n.id)}>
                  <VendorDot vendor={n.vendor} />
                  {n.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
