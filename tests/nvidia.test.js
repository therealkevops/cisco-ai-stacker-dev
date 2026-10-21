import test from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, parseRoute } from '../src/data/model.js';

const nv = MODELS.nvidia;
const cisco = MODELS.cisco;

test('the NVIDIA lens has the same six primitives, each with its own summary and background', () => {
  assert.deepEqual(nv.primitives.map((p) => p.id), cisco.primitives.map((p) => p.id));
  for (const p of nv.primitives) {
    assert.ok(p.summary.length > 60, p.id);
    assert.ok(nv.primitiveDetailsOf(p.id), `${p.id} has no background`);
  }
  for (const p of nv.primitives) {
    assert.doesNotMatch(nv.primitiveDetailsOf(p.id).why, /cisco/i, `${p.id}: the NVIDIA background should not be written from Cisco's view`);
  }
});

test('ids are unique, every node sits in a real primitive, and a wedge holds at most nine hexagons', () => {
  const ids = nv.nodes.map((n) => n.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const n of nv.products) assert.ok(nv.primitiveById.has(n.primitive), n.id);
  for (const p of nv.primitives) assert.ok(nv.productsIn(p.id).length <= 9, `${p.id} has too many products`);
});

test('every link joins two real nodes with a known type, and none repeats', () => {
  const seen = new Set();
  for (const l of nv.links) {
    assert.ok(nv.nodeById.has(l.a) && nv.nodeById.has(l.b), `${l.a} / ${l.b}`);
    assert.ok(nv.typeById.has(l.type), `${l.a}: type ${l.type}`);
    assert.notEqual(l.a, l.b);
    const key = `${l.a}>${l.b}>${l.type}`;
    assert.ok(!seen.has(key), `duplicate ${key}`);
    seen.add(key);
    assert.ok(l.label.length > 8, `${l.a} / ${l.b}: label`);
    assert.ok(['sourced', 'check'].includes(l.status));
  }
});

test('every product has a description, three to five features, sources and a caveat where it needs one', () => {
  for (const n of nv.products) {
    const d = nv.detailsOf(n.id);
    assert.ok(d, `${n.id} has no details`);
    assert.ok(d.about.length >= 120 && d.about.length <= 420, `${n.id}: about is ${d.about.length}`);
    assert.ok(d.features.length >= 3 && d.features.length <= 5, `${n.id}: ${d.features.length} features`);
    for (const f of d.features) assert.ok(f.text.length >= 25 && f.text.length <= 260, `${n.id}/${f.name}: ${f.text.length}`);
    assert.ok(d.refs.length >= 1);
    for (const [label, url] of d.refs) {
      assert.ok(label.length > 3);
      assert.match(url, /^https:\/\//);
    }
    if (d.caveat) assert.ok(d.caveat.length >= 40, `${n.id}: caveat too thin`);
    assert.equal(n.url.startsWith('https://'), true);
  }
  assert.deepEqual(Object.keys(nv.data.details).filter((id) => !nv.nodeById.has(id) || nv.nodeById.get(id).kind), []);
});

test('unconfirmed links and roadmap items are flagged, not stated as fact', () => {
  for (const id of ['spectrum-x-photonics', 'stx-cmx', 'sentry', 'cisco-silicon-one']) {
    assert.match(nv.detailsOf(id).caveat, /announced|not confirmed|first planned|no ship date/i, id);
  }
  assert.match(nv.detailsOf('quantum-x').caveat, /conflict/i, 'the Quantum-X Photonics dates disagree between NVIDIA pages');
  assert.match(nv.detailsOf('nemo').caveat, /sunset/i);
  assert.match(nv.detailsOf('safety-nims').caveat, /unverified/i);
  assert.match(nv.detailsOf('dynamo').caveat, /mixed|experimental/i);
  assert.match(nv.detailsOf('bluefield').caveat, /BlueField-4/);
  const unverified = nv.links.filter((l) => l.status === 'check');
  assert.ok(unverified.length > 0 && unverified.length <= 8, `${unverified.length} unverified links`);
  for (const l of unverified) assert.ok(l.label.length > 40, `${l.a} / ${l.b}: an unverified link must say why`);
});

// A product with no connections reads as having no integrations, which is a claim. NVLink is the one
// place: NVIDIA calls it the scale-up network, separate from the scale-out fabric, and the pages read
// state no link between the two.
const NETWORK_ONLY_TO_OTHERS = new Set(['nvlink']);

test('every product connects to another, and every network product connects within the network wedge', () => {
  for (const p of nv.products) {
    assert.ok(nv.linksBetweenProducts(p.id).length >= 1, `${p.id} has no connection to another product`);
  }
  for (const p of nv.productsIn('network').filter((x) => !NETWORK_ONLY_TO_OTHERS.has(x.id))) {
    const peers = nv.linksBetweenProducts(p.id).map((l) => nv.nodeById.get(l.a === p.id ? l.b : l.a));
    assert.ok(peers.some((q) => q.primitive === 'network'), `${p.id} connects to nothing else in the network wedge`);
  }
});

test('Cisco and partner entries are on the map only where an NVIDIA page names them', () => {
  const notNvidia = nv.products.filter((n) => n.vendor !== 'nvidia');
  assert.deepEqual(notNvidia.map((n) => n.id).sort(), [
    'cisco-ai-defense', 'cisco-n9100', 'cisco-silicon-one', 'cisco-ucs', 'k8s-platforms', 'security-partners', 'storage-partners',
  ]);
  for (const n of notNvidia) {
    assert.ok(nv.detailsOf(n.id).refs.every(([, url]) => /nvidia\.com|nvidianews/.test(url)), `${n.id} should cite NVIDIA's pages`);
  }
  for (const n of notNvidia.filter((x) => x.vendor === 'cisco')) {
    assert.match(nv.detailsOf(n.id).caveat, /not as an NVIDIA product|not an NVIDIA one|not an NVIDIA product|A Cisco product/i, n.id);
  }
});

test('the reference architectures include what NVIDIA publishes, and the Cisco designs map onto them', () => {
  assert.ok(nv.designs.length >= 8);
  const rtx = nv.membersOf('era-rtx-pro');
  assert.ok(rtx.has('rtx-pro-servers') && rtx.has('bluefield') && rtx.has('spectrum-x') && rtx.has('certified-storage'));
  assert.ok(nv.membersOf('era-hgx-b300').has('connectx') && nv.membersOf('era-nvl72').has('gb300-nvl72'));
  assert.ok(nv.membersOf('dgx-superpod').has('quantum-x') && nv.membersOf('dgx-superpod').has('mission-control'));
  // Mission Control brings its own parts with it.
  assert.ok(nv.membersOf('dgx-superpod').has('base-command-manager') && nv.membersOf('dgx-superpod').has('ufm') && nv.membersOf('dgx-superpod').has('netq'));
  for (const d of [...nv.designs, ...cisco.designs]) {
    for (const r of d.related || []) {
      assert.ok(MODELS[r.lens].nodeById.get(r.id)?.kind === 'design', `${d.id} -> ${r.lens}/${r.id}`);
      assert.ok(r.note.length > 40);
    }
  }
  assert.equal(cisco.nodeById.get('pod-2-8-9-400').related[0].id, 'era-hgx-h200');
  assert.equal(cisco.nodeById.get('pod-2-8-5-200').related[0].id, 'era-rtx-pro');
  assert.equal(nv.nodeById.get('era-hgx-h200').related[0].id, 'pod-2-8-9-400');
  assert.equal(nv.nodeById.get('era-rtx-pro').related[0].id, 'pod-2-8-5-200');
});

test('a design that includes AI Enterprise has the suite, not everything inside it', () => {
  const m = nv.membersOf('era-rtx-pro');
  assert.ok(m.has('nvidia-ai-enterprise'));
  for (const id of ['nemo-guardrails', 'omniverse-dsx', 'ai-q', 'cuvs', 'run-ai']) assert.ok(!m.has(id), `${id} should not count as part of the reference architecture`);
  assert.ok(nv.membersOf('dgx-superpod').has('run-ai'), 'but Mission Control, which the SuperPOD does include, brings Run:ai with it');
});

test('placement follows NVIDIA\'s own filing, and says so where this app moved something', () => {
  const where = (id) => nv.nodeById.get(id).primitive;
  assert.equal(where('bluefield'), 'network', 'NVIDIA files BlueField under Networking');
  assert.equal(where('nvlink'), 'network');
  assert.equal(where('nvidia-ai-enterprise'), 'platform');
  assert.equal(where('mission-control'), 'ops');
  assert.match(nv.detailsOf('nvlink').caveat, /Data Center/, 'NVIDIA files NVLink under Data Center');
  assert.match(nv.detailsOf('doca').caveat, /Platform/, 'DOCA is software and could sit under Platform');
  assert.match(nv.detailsOf('run-ai').caveat, /boundary/i);
});

test('the lens is part of the address: NVIDIA routes parse inside their own lens', () => {
  assert.deepEqual(parseRoute('#/nvidia/product/bluefield'), { lens: 'nvidia', kind: 'product', id: 'bluefield' });
  assert.deepEqual(parseRoute('#/nvidia/design/era-rtx-pro'), { lens: 'nvidia', kind: 'design', id: 'era-rtx-pro' });
  assert.deepEqual(parseRoute('#/nvidia/primitive/ops'), { lens: 'nvidia', kind: 'primitive', id: 'ops' });
  assert.equal(parseRoute('#/product/bluefield').kind, 'product', 'the same id exists in both lenses');
  assert.equal(parseRoute('#/nvidia/product/c885a').kind, null, 'a Cisco product is not in the NVIDIA lens');
  assert.equal(nv.href.product('x'), '#/nvidia/product/x');
  assert.equal(cisco.href.product('x'), '#/product/x');
});
