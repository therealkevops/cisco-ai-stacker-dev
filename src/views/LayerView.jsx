import React from 'react';
import { layerById, nodesIn, layerConnections, linksOf, hrefLayer, hrefNode } from '../data/model.js';
import { VendorDot, Legend } from './Marks.jsx';

export default function LayerView({ id }) {
  const layer = layerById.get(id);
  const connections = layerConnections(id);

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#/">Stack</a> <span aria-hidden="true">/</span> <span aria-current="page">{layer.name}</span>
      </nav>
      <header className="masthead">
        <p className="kicker">Layer</p>
        <h1>{layer.name}</h1>
        <p className="lede">{layer.summary}</p>
      </header>

      <ul className="cards">
        {nodesIn(id).map((n) => {
          const count = linksOf(n.id).length;
          return (
            <li key={n.id}>
              <a className={'card' + (n.status === 'check' ? ' unverified' : '')} href={hrefNode(n.id)}>
                <span className="meta"><VendorDot vendor={n.vendor} />{n.vendor === 'cisco' ? 'Cisco' : 'Partner'}</span>
                <h2>{n.name}</h2>
                <span className="blurb">{n.blurb}</span>
                <span className="count">{count} integration{count === 1 ? '' : 's'}</span>
              </a>
            </li>
          );
        })}
      </ul>

      <section className="section" aria-labelledby="conn">
        <h2 id="conn" className="label">Connects to other layers</h2>
        {connections.map(({ layer: other, items }) => (
          <div key={other.id} className="conn">
            <h3><a href={hrefLayer(other.id)}>{other.name}</a></h3>
            <ul>
              {items.map((it) => (
                <li key={it.from.id + it.to.id + it.type}>
                  <a href={hrefNode(it.from.id)}>{it.from.name}</a>
                  <span className="rel"> {it.phrase.toLowerCase()} </span>
                  <a href={hrefNode(it.to.id)}>{it.to.name}</a>
                  <span className="why">
                    {it.label}
                    {it.status === 'check' && <em> (unverified)</em>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <Legend />
    </>
  );
}
