import React from 'react';
import { PRIMITIVES, LINK_TYPES, NODES, LINKS } from '../data/stack.js';
import { USE_CASES } from '../data/usecases.js';
import {
  nodeById, primitiveById, productsIn, designs, coverage, linksOf, primitiveLinks, designsIncluding, membersOf, href,
  caseById, assess, summarise, casesNeeding,
} from '../data/model.js';

function Dot({ vendor }) {
  return <span className={'dot ' + (vendor === 'cisco' ? 'filled' : 'open')} aria-hidden="true" />;
}

const Swatch = ({ id }) => <span className={`pip p-${id}`} aria-hidden="true" />;

function Legend({ useCase }) {
  return (
    <section className="legend" aria-label="Key">
      <h2 className="label">Key</h2>
      <p><span className="key-hex cisco" aria-hidden="true" /> Cisco product</p>
      <p><span className="key-hex partner" aria-hidden="true" /> Partner product</p>
      <p><span className="key-hex partner dashed" aria-hidden="true" /> Not yet confirmed against a public page</p>
      {useCase && (
        <p className="key-lines">
          <em>Solid outline</em>: required. <em>Dashed outline</em>: recommended.
          With a design chosen: <em>tick</em> means the design meets it, <em>plus</em> means it is a gap to fill.
        </p>
      )}
      <p className="key-lines">Lines run the way the relationship does: <em>carries traffic</em>, <em>manages</em>, <em>secures</em>, <em>observes</em>, <em>feeds</em>, <em>runs on</em>; a ringed end means <em>contains</em>.</p>
    </section>
  );
}

function Overview() {
  return (
    <>
      <p className="kicker">The Cisco AI Stack</p>
      <h1>Primitives, mapped to the portfolio</h1>
      <p className="lede">
        At the centre is the AI workload. Around it are the six primitives it needs, and beside each sit the products that provide it:
        Cisco first, partners further out. {NODES.filter((n) => !n.kind).length} products, {LINKS.length} integrations.
      </p>
      <ul className="how">
        <li><b>Pick a product</b> to draw its integrations.</li>
        <li><b>Pick a primitive</b> to see everything that provides it.</li>
        <li><b>Pick a design</b> to see which primitives it covers, and which it leaves open.</li>
        <li><b>Pick a use case</b> to see what a customer scenario needs, then check it against a design.</li>
      </ul>
      <section aria-labelledby="uc-h">
        <h2 id="uc-h" className="label">Customer use cases</h2>
        <ul className="list">
          {USE_CASES.map((u) => (
            <li key={u.id}>
              <a href={href.usecase(u.id)}><span className="pip uc" aria-hidden="true" />{u.name}</a>
              <span className={'sub' + (u.status === 'draft' ? ' unv' : '')}>{u.status === 'draft' ? 'draft' : `${u.needs.length} needs`}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="designs-h">
        <h2 id="designs-h" className="label">Validated designs: the portfolio lens</h2>
        <ul className="list">
          {designs.map((d) => (
            <li key={d.id}>
              <a href={href.design(d.id)}><Dot vendor={d.vendor} />{d.name}</a>
              <span className="sub">{coverage(d.id).filter((r) => r.have > 0).length} of 6 primitives</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="prims-h">
        <h2 id="prims-h" className="label">The primitives</h2>
        <ul className="list">
          {PRIMITIVES.map((p) => (
            <li key={p.id}>
              <a href={href.primitive(p.id)}><Swatch id={p.id} />{p.name}</a>
              <span className="sub">{productsIn(p.id).length} products</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

const Back = () => <a className="back" href={href.home}>Clear selection</a>;

function ProductPanel({ id }) {
  const node = nodeById.get(id);
  const prim = primitiveById.get(node.primitive);
  const links = linksOf(id);
  const groups = LINK_TYPES.flatMap((t) =>
    [t.from, t.to].map((name) => ({ key: t.id + name, name, items: links.filter((l) => l.type === t.id && l.phrase === name) })),
  ).filter((g) => g.items.length);
  const inDesigns = designsIncluding(id);

  return (
    <>
      <Back />
      <p className="kicker"><Dot vendor={node.vendor} />{node.vendor === 'cisco' ? 'Cisco' : 'Partner'} &middot; <a href={href.primitive(prim.id)}>{prim.name}</a></p>
      <h1>{node.name}</h1>
      <p className="lede">{node.blurb}</p>
      {node.status === 'check' && <p className="note">Not yet confirmed against a public page. Check before quoting.</p>}
      <p className="src"><a href={node.url} target="_blank" rel="noreferrer">Source</a></p>

      {inDesigns.length > 0 && (
        <section>
          <h2 className="label">Included in</h2>
          <ul className="chips">
            {inDesigns.map((d) => <li key={d.id}><a href={href.design(d.id)}>{d.name}</a></li>)}
          </ul>
        </section>
      )}

      {casesNeeding(id).length > 0 && (
        <section>
          <h2 className="label">Needed for</h2>
          <ul className="list">
            {casesNeeding(id).map(({ useCase, role }) => (
              <li key={useCase.id}>
                <a href={href.usecase(useCase.id)}><span className="pip uc" aria-hidden="true" />{useCase.name}</a>
                <span className="sub">{role}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="label">{links.length} integration{links.length === 1 ? '' : 's'}</h2>
        {groups.map((g) => (
          <div key={g.key} className="group">
            <h3>{g.name}</h3>
            <ul>
              {g.items.map((l) => (
                <li key={l.other.id + l.type}>
                  <a href={l.other.kind ? href.design(l.other.id) : href.product(l.other.id)}>{l.other.name}</a>
                  <span className="why">{l.label}{l.status === 'check' && <em> (unverified)</em>}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </>
  );
}

function PrimitivePanel({ id }) {
  const prim = primitiveById.get(id);
  const prods = productsIn(id);
  const touches = primitiveLinks(id);
  return (
    <>
      <Back />
      <p className="kicker"><Swatch id={id} />Primitive</p>
      <h1>{prim.name}</h1>
      <p className="lede">{prim.summary}</p>
      <section>
        <h2 className="label">{prods.length} products</h2>
        <ul className="list">
          {prods.map((n) => (
            <li key={n.id}>
              <a href={href.product(n.id)}><Dot vendor={n.vendor} />{n.name}</a>
              {n.status === 'check' && <span className="sub unv">unverified</span>}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="label">Integrates most with</h2>
        <ul className="list">
          {touches.map(({ primitive, count }) => (
            <li key={primitive.id}>
              <a href={href.primitive(primitive.id)}><Swatch id={primitive.id} />{primitive.name}</a>
              <span className="sub">{count} integration{count === 1 ? '' : 's'}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function DesignPanel({ id }) {
  const design = nodeById.get(id);
  const rows = coverage(id);
  const covered = rows.filter((r) => r.have > 0);
  const gaps = rows.filter((r) => r.have === 0);
  const members = [...membersOf(id)].map((m) => nodeById.get(m)).filter((n) => !n.kind);
  return (
    <>
      <Back />
      <p className="kicker"><Dot vendor={design.vendor} />Validated design &middot; portfolio lens</p>
      <h1>{design.name}</h1>
      <p className="lede">{design.blurb}</p>
      {design.status === 'check' && <p className="note">Not yet confirmed against a public page. Check before quoting.</p>}
      <p className="src"><a href={design.url} target="_blank" rel="noreferrer">Source</a></p>

      {design.bom && (
        <section aria-labelledby="bom-h">
          <h2 id="bom-h" className="label">As published</h2>
          <ul className="bom">
            {design.bom.map((line) => <li key={line}>{line}</li>)}
          </ul>
          {design.offMap.length > 0 && (
            <p className="offmap">
              <b>Also in the design, but not on this map:</b> {design.offMap.join('; ')}.
            </p>
          )}
        </section>
      )}

      <section>
        <h2 className="label">Covers {covered.length} of {rows.length} primitives</h2>
        <ul className="cover">
          {rows.map((r) => (
            <li key={r.primitive.id} className={r.have === 0 ? 'gap' : ''}>
              <a href={href.primitive(r.primitive.id)}><Swatch id={r.primitive.id} />{r.primitive.name}</a>
              <span className="bar" aria-hidden="true">
                {Array.from({ length: r.total }, (_, i) => <i key={i} className={i < r.have ? `on p-${r.primitive.id}` : ''} />)}
              </span>
              <span className="sub">{r.have === 0 ? 'Not covered' : `${r.have} of ${r.total}`}</span>
            </li>
          ))}
        </ul>
        {gaps.length > 0 && (
          <p className="gapnote">
            Left open: {gaps.map((g) => g.primitive.name.toLowerCase()).join(', ')}. Another design or product has to supply {gaps.length === 1 ? 'it' : 'them'}.
          </p>
        )}
      </section>

      <section aria-labelledby="duc-h">
        <h2 id="duc-h" className="label">Use cases</h2>
        <ul className="list">
          {USE_CASES.map((u) => {
            const sum = summarise(assess(u.id, id));
            return (
              <li key={u.id}>
                <a href={href.usecase(u.id, id)}><span className="pip uc" aria-hidden="true" />{u.name}</a>
                <span className="sub">{sum.required.met} of {sum.required.total} required{u.designs.includes(id) ? ' \u00b7 validated' : ''}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="label">{members.length} products included</h2>
        <ul className="list">
          {members.map((n) => (
            <li key={n.id}>
              <a href={href.product(n.id)}><Dot vendor={n.vendor} />{n.name}</a>
              <span className="sub">{primitiveById.get(n.primitive).label}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function NeedRow({ need, found }) {
  const names = need.products.map((id) => nodeById.get(id));
  const state = found ? (found.met ? 'met' : 'gap') : 'open';
  return (
    <li className={`need-row ${state}`}>
      <span className={`mark ${state}`} aria-label={state === 'met' ? 'Met' : state === 'gap' ? 'Gap' : undefined}>
        {state === 'met' ? '\u2713' : state === 'gap' ? '+' : ''}
      </span>
      <div>
        <p className="need-name">
          {names.map((n, i) => (
            <React.Fragment key={n.id}>
              {i > 0 && <span className="or"> or </span>}
              <a href={href.product(n.id)}>{n.name}</a>
            </React.Fragment>
          ))}
        </p>
        <p className="why">
          {need.why}
          {found?.met && names.length > 1 && <em className="metby"> Met by {found.metBy.map((m) => nodeById.get(m).name).join(', ')}.</em>}
        </p>
      </div>
    </li>
  );
}

function UseCasePanel({ id, designId }) {
  const uc = caseById.get(id);
  const assessed = designId ? assess(id, designId) : null;
  const sum = assessed ? summarise(assessed) : null;
  const design = designId ? nodeById.get(designId) : null;
  const others = designs.filter((d) => !uc.designs.includes(d.id));
  const rows = (role) => uc.needs.map((need, i) => ({ need, found: assessed?.[i] })).filter((r) => r.need.role === role);
  const gaps = assessed ? assessed.filter((a) => !a.met) : [];
  const fit = (d) => summarise(assess(id, d.id));

  const designRow = (d) => (
    <li key={d.id}>
      <a href={href.usecase(id, d.id)} aria-current={d.id === designId ? 'true' : undefined}><Dot vendor={d.vendor} />{d.name}</a>
      <span className="sub">{fit(d).required.met} of {fit(d).required.total} required</span>
    </li>
  );

  return (
    <>
      <Back />
      <p className="kicker"><span className="pip uc" aria-hidden="true" />Customer use case</p>
      <h1>{uc.name}</h1>
      <p className="lede">{uc.summary}</p>
      {uc.status === 'draft' ? (
        <p className="note">Draft: an editorial reading of Cisco's published designs. Review before using with a customer.</p>
      ) : (
        <p className="lede small">The required needs come from the design guides below. The recommended ones are suggestions, not part of those designs.</p>
      )}
      <p className="src"><a href={uc.url} target="_blank" rel="noreferrer">Source</a></p>

      {sum && (
        <section className="verdict" aria-live="polite">
          <p>
            <strong>{design.name}</strong> meets {sum.required.met} of {sum.required.total} required needs
            and {sum.recommended.met} of {sum.recommended.total} recommended.
          </p>
          {gaps.length > 0 && (
            <p className="gaplist">
              Still to find: {gaps.map((g) => g.need.products.map((p) => nodeById.get(p).name).join(' or ')).join('; ')}.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="chk-h">
        <h2 id="chk-h" className="label">Check it against a design</h2>
        <p className="sublabel">Validated for this use case</p>
        <ul className="list">{uc.designs.map((d) => designRow(nodeById.get(d)))}</ul>
        {others.length > 0 && (
          <details className="others" open={others.some((d) => d.id === designId)}>
            <summary>Compare with another design</summary>
            <ul className="list">{others.map(designRow)}</ul>
          </details>
        )}
        {design && <p className="src"><a href={href.usecase(id)}>Remove the overlay</a></p>}
      </section>

      <section aria-labelledby="req-h">
        <h2 id="req-h" className="label">Required</h2>
        <ul className="needs">{rows('required').map((r) => <NeedRow key={r.need.products.join()} {...r} />)}</ul>
      </section>
      <section aria-labelledby="rec-h">
        <h2 id="rec-h" className="label">Recommended</h2>
        <ul className="needs">{rows('recommended').map((r) => <NeedRow key={r.need.products.join()} {...r} />)}</ul>
      </section>
    </>
  );
}

export default function Panel({ route }) {
  return (
    <aside className="panel" aria-label="Details">
      {route.kind === null && <Overview />}
      {route.kind === 'product' && <ProductPanel id={route.id} />}
      {route.kind === 'primitive' && <PrimitivePanel id={route.id} />}
      {route.kind === 'design' && <DesignPanel id={route.id} />}
      {route.kind === 'usecase' && <UseCasePanel id={route.id} designId={route.design} />}
      <Legend useCase={route.kind === 'usecase'} />
    </aside>
  );
}
