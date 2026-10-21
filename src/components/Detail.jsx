import React from 'react';
import { LAYERS, NODES, LINKS, LINK_TYPES } from '../data/stack.js';

const byId = new Map(NODES.map((n) => [n.id, n]));
const layerName = new Map(LAYERS.map((l) => [l.id, l.name]));

export default function Detail({ nodeId, onSelect, onClose }) {
  const node = nodeId ? byId.get(nodeId) : null;
  if (!node) return null;

  const mine = LINKS.filter((l) => l.a === node.id || l.b === node.id);
  const groups = LINK_TYPES.map((t) => ({ type: t, items: mine.filter((l) => l.type === t.id) })).filter((g) => g.items.length);

  return (
    <section className="detail" aria-label={`Details for ${node.name}`}>
      <button type="button" className="close" onClick={onClose} aria-label="Close details">Close</button>
      <p className="kicker">
        {layerName.get(node.layer)} &middot; {node.vendor === 'cisco' ? 'Cisco' : 'Partner'}
      </p>
      <h2>{node.name}</h2>
      <p className="blurb">{node.blurb}</p>
      {node.status === 'check' && (
        <p className="note">Not confirmed against a public page. Check before quoting.</p>
      )}
      <p className="count">{mine.length} integration{mine.length === 1 ? '' : 's'}</p>
      {groups.map(({ type, items }) => (
        <div key={type.id} className="group">
          <h3 className="label">{type.name}</h3>
          <ul>
            {items.map((l) => {
              const other = byId.get(l.a === node.id ? l.b : l.a);
              return (
                <li key={l.a + l.b + l.type}>
                  <button type="button" onClick={() => onSelect(other.id)}>{other.name}</button>
                  <span className="why">
                    {l.label}
                    {l.status === 'check' && <em> (unverified)</em>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <a className="source" href={node.url} target="_blank" rel="noreferrer">Source</a>
    </section>
  );
}
