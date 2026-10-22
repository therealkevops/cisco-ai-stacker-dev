import React from 'react';
import { LINK_STYLES, styleOf } from '../map/linkstyle.js';
import { LineSample } from '../map/LineKey.jsx';
import { MODELS, counterparts } from '../data/model.js';

// The lens being shown (Cisco or NVIDIA) is handed down by context, so every piece reads the same data.
const ModelContext = React.createContext(null);
const useModel = () => React.useContext(ModelContext);

const VENDOR_NAMES = { cisco: 'Cisco', nvidia: 'NVIDIA', oss: 'Community or foundation project', partner: 'Partner' };

function Dot({ vendor }) {
  const model = useModel();
  return <span className={'dot ' + (vendor === model.data.focus ? 'filled' : 'open')} aria-hidden="true" />;
}

const Swatch = ({ id }) => <span className={`pip p-${id}`} aria-hidden="true" />;

// Switches the focus of the whole app between the lenses. It always lands on that lens's overview.
function LensSwitch() {
  const current = useModel();
  return (
    <nav className="lens" aria-label="Focus">
      <span className="lens-label">Focus</span>
      {Object.values(MODELS).filter((m) => m.nodes.length > 0).map((m) => (
        <a key={m.data.id} href={m.href.home} aria-current={m === current ? 'true' : undefined}>{m.data.name}</a>
      ))}
    </nav>
  );
}

function Legend({ useCase }) {
  const { data } = useModel();
  return (
    <section className="legend" aria-label="Key">
      <h2 className="label">Key</h2>
      <p><span className="key-hex own" aria-hidden="true" /> {data.ownLabel || `${data.name} product`}</p>
      <p><span className="key-hex partner" aria-hidden="true" /> {data.otherLabel || 'Partner product'}</p>
      <p><span className="key-hex partner dashed" aria-hidden="true" /> {data.dashedLabel || 'Not yet confirmed against a public page'}</p>
      {useCase && (
        <p className="key-lines">
          <em>Solid outline</em>: required. <em>Dashed outline</em>: recommended.
          With a design chosen: <em>tick</em> means the design meets it, <em>plus</em> means it is a gap to fill.
        </p>
      )}
      <h3 className="sublabel">Lines, drawn when you pick a product</h3>
      <ul className="line-legend">
        {LINK_STYLES.map((s) => (
          <li key={s.id}>
            <LineSample style={s} />
            <span><b>{s.label}</b><i>{s.detail}</i></span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Overview() {
  const { data, primitives, nodes, links, cases, designs, coverage, productsIn, href } = useModel();
  return (
    <>
      <p className="kicker">{data.title}</p>
      <h1>Primitives, mapped to the portfolio</h1>
      <p className="lede">
        At the centre is the AI workload. Around it are the six primitives it needs, and beside each sit the products that provide it:
        {' '}{data.name} first, partners further out. {nodes.filter((n) => !n.kind).length} products, {links.length} integrations.
      </p>
      <ul className="how">
        <li><b>Pick a product</b> to draw its integrations.</li>
        <li><b>Pick a primitive</b> to see everything that provides it.</li>
        <li><b>Pick a design</b> to see which primitives it covers, and which it leaves open.</li>
        {cases.length > 0 && <li><b>Pick a use case</b> to see what a customer scenario needs, then check it against a design.</li>}
      </ul>
      {cases.length > 0 && (
      <section aria-labelledby="uc-h">
        <h2 id="uc-h" className="label">Customer use cases</h2>
        <ul className="list">
          {cases.map((u) => (
            <li key={u.id}>
              <a href={href.usecase(u.id)}><span className="pip uc" aria-hidden="true" />{u.name}</a>
              <span className={'sub' + (u.status === 'draft' ? ' unv' : '')}>{u.status === 'draft' ? 'draft' : `${u.needs.length} needs`}</span>
            </li>
          ))}
        </ul>
      </section>
      )}
      <section aria-labelledby="designs-h">
        <h2 id="designs-h" className="label">{data.designsHeading || 'Validated designs: the portfolio lens'}</h2>
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
          {primitives.map((p) => (
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

function Features({ items }) {
  return (
    <ul className="features">
      {items.map((f) => (
        <li key={f.name}>
          <b>{f.name}</b>
          <span>{f.text}</span>
        </li>
      ))}
    </ul>
  );
}

function Back() {
  const { href } = useModel();
  return <a className="back" href={href.home}>Clear selection</a>;
}

const hrefTo = (lens, id) => {
  const m = MODELS[lens];
  return m.nodeById.get(id).kind === 'design' ? m.href.design(id) : m.href.product(id);
};

// Cross-focus links come in two kinds. A documented one is named in the vendor's own pages (it carries
// the page and the date it was read). A counterpart is this app's reading that two things do a similar
// job, and says so.
function EcoSection({ id, documentedTitle, alikeTitle, items }) {
  const documented = items.filter((x) => x.basis === 'documented');
  const alike = items.filter((x) => x.basis !== 'documented');
  const rows = (list) => (
    <ul className="list stack">
      {list.map((x) => (
        <li key={x.key}>
          {x.lead ? <><span className="sub">{x.relation}</span> <a href={x.href}>{x.name}</a></> : <><a href={x.href}>{x.name}</a><span className="sub">{x.relation}</span></>}
          <p className="fineprint">
            {x.note}{' '}
            {x.url && <a className="srclink" href={x.url} target="_blank" rel="noreferrer">source{x.read ? `, read ${x.read}` : ''}</a>}
          </p>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {documented.length > 0 && (
        <section aria-labelledby={`${id}-doc-h`}>
          <h2 id={`${id}-doc-h`} className="label">{documentedTitle}</h2>
          {rows(documented)}
        </section>
      )}
      {alike.length > 0 && (
        <section aria-labelledby={`${id}-alike-h`}>
          <h2 id={`${id}-alike-h`} className="label">{alikeTitle}</h2>
          <p className="sublabel">Our reading: the vendor's pages do not state these</p>
          {rows(alike)}
        </section>
      )}
    </>
  );
}

// For an open-source entry: the vendor products and designs that name it, and the ones it resembles.
function AlsoIn({ node }) {
  if (!node.alsoIn?.length) return null;
  const items = node.alsoIn.map((x) => ({
    ...x,
    key: x.lens + x.id,
    href: hrefTo(x.lens, x.id),
    name: `${MODELS[x.lens].data.name}: ${MODELS[x.lens].nodeById.get(x.id).name}`,
    lead: true,
  }));
  return <EcoSection id="also" documentedTitle="Where Cisco and NVIDIA name it" alikeTitle="In the other focuses" items={items} />;
}

// For a vendor product or design: the open-source entries that point at it.
function Counterparts({ id }) {
  const { data, nodeById } = useModel();
  const found = counterparts(data.id, id);
  if (!found.length) return null;
  const here = nodeById.get(id).kind ? 'this design' : 'this product';
  const items = found.map((c) => ({ ...c, key: c.node.id, href: c.from.href.product(c.node.id), name: c.node.name, relation: `${c.relation} ${here}` }));
  return <EcoSection id="cp" documentedTitle="Open-source projects its documents name" alikeTitle="Open-source counterparts" items={items} />;
}

function ProductPanel({ id, onHover }) {
  const { nodeById, primitiveById, linksOf, designsIncluding, casesNeeding, detailsOf, linkTypes, href } = useModel();
  const node = nodeById.get(id);
  const prim = primitiveById.get(node.primitive);
  const links = linksOf(id);
  const groups = linkTypes.flatMap((t) =>
    [t.from, t.to].map((name) => ({ key: t.id + name, name, items: links.filter((l) => l.type === t.id && l.phrase === name) })),
  ).filter((g) => g.items.length);
  const inDesigns = designsIncluding(id);
  const detail = detailsOf(id);

  return (
    <>
      <Back />
      <p className="kicker"><Dot vendor={node.vendor} />{VENDOR_NAMES[node.vendor] || 'Partner'} &middot; <a href={href.primitive(prim.id)}>{prim.name}</a></p>
      <h1>{node.name}</h1>
      <p className="lede">{detail ? detail.about : node.blurb}</p>
      {node.status === 'check' && <p className="note">Not yet confirmed against a public page. Check before quoting.</p>}
      {!detail && <p className="src"><a href={node.url} target="_blank" rel="noreferrer">Source</a></p>}

      {detail?.facts && (
        <section aria-labelledby="facts-h">
          <h2 id="facts-h" className="label">Licence and governance</h2>
          <dl className="facts">
            {detail.facts.map(([k, v]) => (
              <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>
            ))}
          </dl>
        </section>
      )}

      {detail && (
        <section aria-labelledby="feat-h">
          <h2 id="feat-h" className="label">Most useful features</h2>
          <Features items={detail.features} />
          {detail.caveat && <p className="caveat"><b>Check:</b> {detail.caveat}</p>}
          <p className="refs">
            <span>Sources</span>
            {detail.refs.map(([label, url]) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>
            ))}
          </p>
          <p className="fineprint">Features are as the vendor states them in the pages above, not independent measurements.</p>
        </section>
      )}

      <AlsoIn node={node} />
      <Counterparts id={id} />

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
            <h3><LineSample style={styleOf(g.items[0].type)} />{g.name}</h3>
            <ul onMouseLeave={() => onHover(null)}>
              {g.items.map((l) => (
                <li key={l.other.id + l.type}
                  onMouseEnter={() => onHover(l.other.kind ? null : l.other.id)}
                  onFocus={() => onHover(l.other.kind ? null : l.other.id)}
                  onBlur={() => onHover(null)}>
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
  const { primitiveById, productsIn, primitiveLinks, primitiveDetailsOf, href } = useModel();
  const prim = primitiveById.get(id);
  const prods = productsIn(id);
  const touches = primitiveLinks(id);
  return (
    <>
      <Back />
      <p className="kicker"><Swatch id={id} />Primitive</p>
      <h1>{prim.name}</h1>
      <p className="lede">{prim.summary}</p>
      {primitiveDetailsOf(id) && (
        <section aria-labelledby="bg-h">
          <h2 id="bg-h" className="label">Why it matters for AI</h2>
          <p className="why-it">{primitiveDetailsOf(id).why}</p>
          <h3 className="sublabel">What to look for</h3>
          <Features items={primitiveDetailsOf(id).lookFor} />
          <p className="fineprint">Background explanation, not claims from any vendor.</p>
        </section>
      )}
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
  const { nodeById, primitiveById, coverage, membersOf, cases, assess, summarise, href } = useModel();
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

      <Counterparts id={id} />

      {design.related?.length > 0 && (
        <section aria-labelledby="rel-h">
          <h2 id="rel-h" className="label">In the other lens</h2>
          <ul className="list stack">
            {design.related.map((r) => (
              <li key={r.lens + r.id}>
                <a href={MODELS[r.lens].href.design(r.id)}>{MODELS[r.lens].nodeById.get(r.id).name}</a>
                <span className="sub">{r.relation}</span>
              </li>
            ))}
          </ul>
          {design.related.map((r) => <p key={r.id} className="fineprint">{r.note}</p>)}
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

      {cases.length > 0 && (
      <section aria-labelledby="duc-h">
        <h2 id="duc-h" className="label">Use cases</h2>
        <ul className="list">
          {cases.map((u) => {
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
      )}

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
  const { nodeById, href } = useModel();
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
  const { data, nodeById, designs, caseById, assess, summarise, burden, href } = useModel();
  const elsewhere = Object.values(MODELS).filter((m) => m.data.id !== data.id && m.caseById.has(id));
  const uc = caseById.get(id);
  const assessed = designId ? assess(id, designId) : null;
  const sum = assessed ? summarise(assessed) : null;
  const design = designId ? nodeById.get(designId) : null;
  const others = designs.filter((d) => !uc.designs.includes(d.id));
  const rows = (role) => uc.needs.map((need, i) => ({ need, found: assessed?.[i] })).filter((r) => r.need.role === role);
  const gaps = assessed ? assessed.filter((a) => !a.met) : [];
  const fit = (d) => summarise(assess(id, d.id));
  const choice = burden(id);

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
        <p className="note">Draft: an editorial reading of {data.name}'s published designs. Review before using with a customer.</p>
      ) : (
        <p className="lede small">The required needs come from the design guides below. The recommended ones are suggestions, not part of those designs.</p>
      )}
      <p className="src"><a href={uc.url} target="_blank" rel="noreferrer">Source</a></p>
      {uc.caveat && <p className="caveat"><b>Check:</b> {uc.caveat}</p>}
      {uc.refs?.length > 0 && (
        <p className="refs">
          <span>Read next</span>
          {uc.refs.map(([label, url]) => <a key={url} href={url} target="_blank" rel="noreferrer">{label}</a>)}
        </p>
      )}

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

      {elsewhere.length > 0 && (
        <p className="src">
          The same use case in the other focus: {elsewhere.map((m, i) => (
            <React.Fragment key={m.data.id}>{i > 0 && ', '}<a href={m.href.usecase(id)}>{m.data.name}</a></React.Fragment>
          ))}
        </p>
      )}

      <section aria-labelledby="chk-h">
        <h2 id="chk-h" className="label">Check it against a design</h2>
        <p className="sublabel">Validated for this use case</p>
        {uc.designs.length > 0 ? (
          <ul className="list">{uc.designs.map((d) => designRow(nodeById.get(d)))}</ul>
        ) : (
          <p className="gapnote">No published design validates this scenario end to end. Check it against one of the designs below to see what each leaves open.</p>
        )}
        {others.length > 0 && (
          <details className="others" open={uc.designs.length === 0 || others.some((d) => d.id === designId)}>
            <summary>{uc.designs.length === 0 ? 'Check against a design' : 'Compare with another design'}</summary>
            <ul className="list">{others.map(designRow)}</ul>
          </details>
        )}
        {design && <p className="src"><a href={href.usecase(id)}>Remove the overlay</a></p>}
      </section>

      {choice && (
        <section aria-labelledby="choice-h">
          <h2 id="choice-h" className="label">What it takes to assemble</h2>
          <p className="lede small">
            {choice.requiredSlots} required decisions, {choice.options} projects to choose between. A complete set of choices
            depends on between {choice.fewest} and {choice.most} separately governed bodies, and nobody supports the whole.
          </p>
          <ul className="choices">
            {choice.slots.map((s) => (
              <li key={s.need.products.join()}>
                <span className={`choice-n ${s.need.role}`}>{s.options.length}</span>
                <span>
                  {s.options.map((o, i) => (
                    <React.Fragment key={o.id}>{i > 0 && ', '}<a href={href.product(o.id)}>{o.name}</a></React.Fragment>
                  ))}
                  <span className="sub"> ({s.need.role})</span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="bom">
            <li>{choice.stewards} different owners across the {choice.options} projects; {choice.companyControlled} are controlled by a single company.</li>
            <li>{choice.notOsi} {choice.notOsi === 1 ? 'is' : 'are'} not under an OSI-approved licence for all their code.</li>
            <li>{choice.flagged.length} are pre-1.0, in maintenance mode or archived: {choice.flagged.map((o) => `${o.name} (${o.maturity})`).join(', ')}.</li>
          </ul>
          {uc.support?.length > 0 && (
            <>
              <p className="sublabel">Who supports it</p>
              <ul className="bom">
                {uc.support.map((x) => <li key={x.text}>{x.text} <a className="srclink" href={x.url} target="_blank" rel="noreferrer">source</a></li>)}
              </ul>
            </>
          )}
        </section>
      )}

      {uc.sizing?.length > 0 && (
        <section aria-labelledby="size-h">
          <h2 id="size-h" className="label">Published sizes</h2>
          <ul className="bom">
            {uc.sizing.map((s) => <li key={s.text}>{s.text} <a className="srclink" href={s.url} target="_blank" rel="noreferrer">source</a></li>)}
          </ul>
        </section>
      )}

      <section aria-labelledby="req-h">
        <h2 id="req-h" className="label">Required</h2>
        <ul className="needs">{rows('required').map((r) => <NeedRow key={r.need.products.join()} {...r} />)}</ul>
      </section>
      <section aria-labelledby="rec-h">
        <h2 id="rec-h" className="label">Recommended</h2>
        <ul className="needs">{rows('recommended').map((r) => <NeedRow key={r.need.products.join()} {...r} />)}</ul>
      </section>
      {uc.offMap?.length > 0 && (
        <section aria-labelledby="off-h">
          <h2 id="off-h" className="label">Not on this map</h2>
          <p className="offmap">The designs this scenario rests on also use things the map does not cover:</p>
          <ul className="bom">
            {uc.offMap.map((o) => <li key={o.name}><b>{o.name}.</b> {o.note}</li>)}
          </ul>
        </section>
      )}

      {uc.questions?.length > 0 && (
        <section aria-labelledby="q-h">
          <h2 id="q-h" className="label">Ask the vendor</h2>
          <ul className="bom">
            {uc.questions.map((q) => <li key={q}>{q}</li>)}
          </ul>
        </section>
      )}
    </>
  );
}

export default function Panel({ model, route, onHover }) {
  return (
    <ModelContext.Provider value={model}>
    <aside className="panel" aria-label="Details">
      <LensSwitch />
      {route.kind === null && <Overview />}
      {route.kind === 'product' && <ProductPanel id={route.id} onHover={onHover} />}
      {route.kind === 'primitive' && <PrimitivePanel id={route.id} />}
      {route.kind === 'design' && <DesignPanel id={route.id} />}
      {route.kind === 'usecase' && <UseCasePanel id={route.id} designId={route.design} />}
      <Legend useCase={route.kind === 'usecase'} />
    </aside>
    </ModelContext.Provider>
  );
}
