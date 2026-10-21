import test from 'node:test';
import assert from 'node:assert/strict';
import { LINKS, PRIMITIVES } from '../src/data/stack.js';
import {
  parseRoute, linksOf, membersOf, coverage, designs, products, productsIn, productLinks, primitiveLinks,
  designsIncluding, nodeById, layoutOrder,
} from '../src/data/model.js';

test('routes parse from the hash, and unknown or mismatched ones fall back to nothing selected', () => {
  assert.deepEqual(parseRoute(''), { lens: 'cisco', kind: null });
  assert.deepEqual(parseRoute('#/'), { lens: 'cisco', kind: null });
  assert.deepEqual(parseRoute('#/product/ai-defense'), { lens: 'cisco', kind: 'product', id: 'ai-defense' });
  assert.deepEqual(parseRoute('#/design/ai-pod'), { lens: 'cisco', kind: 'design', id: 'ai-pod' });
  assert.deepEqual(parseRoute('#/primitive/network'), { lens: 'cisco', kind: 'primitive', id: 'network' });
  assert.deepEqual(parseRoute('#/product/ai-pod'), { lens: 'cisco', kind: null }, 'a design is not a product');
  assert.deepEqual(parseRoute('#/design/ai-defense'), { lens: 'cisco', kind: null }, 'a product is not a design');
  assert.deepEqual(parseRoute('#/product/nope'), { lens: 'cisco', kind: null });
  assert.deepEqual(parseRoute('#/primitive/nope'), { lens: 'cisco', kind: null });
  assert.deepEqual(parseRoute('#/garbage'), { lens: 'cisco', kind: null });
  assert.deepEqual(parseRoute('#/nvidia/'), { lens: 'nvidia', kind: null });
  assert.deepEqual(parseRoute('#/nvidia/product/nope'), { lens: 'nvidia', kind: null });
  assert.equal(parseRoute('#/nvidia/product/ai-defense').kind, null, 'a Cisco product is not in the NVIDIA lens');
});

test('linksOf returns each integration from both ends, reading differently from each', () => {
  for (const l of LINKS) {
    const fromA = linksOf(l.a).find((x) => x.other.id === l.b && x.type === l.type);
    const fromB = linksOf(l.b).find((x) => x.other.id === l.a && x.type === l.type);
    assert.ok(fromA && fromB, `${l.a} / ${l.b}`);
    assert.notEqual(fromA.phrase, fromB.phrase, `${l.a} / ${l.b}: both ends read the same`);
  }
});

test('a design brings in what it contains, all the way down', () => {
  const factory = membersOf('secure-ai-factory');
  assert.ok(factory.has('ai-pod') && factory.has('pod-2-8-9-400') && factory.has('c885a') && factory.has('nvidia-gpu'));
  assert.ok(factory.has('ai-defense') && factory.has('secure-firewall'), 'a firewall inside the hybrid mesh');
  assert.ok(!factory.has('secure-ai-factory'), 'not itself');
});

test('containment only goes downward: a part does not pull in what contains it', () => {
  const pod = membersOf('pod-2-8-9-400');
  assert.ok(pod.has('n9364e'));
  assert.ok(!pod.has('spectrum-x'), 'the platform that a switch takes part in is not pulled in by the switch');
  assert.ok(!pod.has('ai-pod'));
});

test('a design built on a model also uses its family, but a family alone never brings in a model', () => {
  assert.ok(membersOf('pod-2-8-9-400').has('nexus-9000'), 'a 9364E-SG2 design is a Nexus 9000 design');
  assert.ok(membersOf('flexpod-rag').has('nexus-9000'));
  assert.ok(!membersOf('flexpod-rag').has('n9364e'), 'the RAG designs use the family, not that model');
  assert.ok(!membersOf('flexpod-rag').has('silicon-one'));
});

test('coverage counts every primitive, and never exceeds what the primitive offers', () => {
  for (const d of designs) {
    const rows = coverage(d.id);
    assert.equal(rows.length, PRIMITIVES.length);
    for (const row of rows) {
      assert.equal(row.total, productsIn(row.primitive.id).length);
      assert.ok(row.have >= 0 && row.have <= row.total);
    }
  }
});

test('a single AI POD design leaves gaps, which is the point of the lens', () => {
  const rows = new Map(coverage('pod-2-8-9-400').map((r) => [r.primitive.id, r]));
  assert.ok(rows.get('compute').have > 0 && rows.get('network').have > 0);
  assert.equal(rows.get('security').have, 0);
  assert.equal(rows.get('ops').have, 0);
  const factory = new Map(coverage('secure-ai-factory').map((r) => [r.primitive.id, r]));
  assert.ok(factory.get('security').have > 0, 'the factory adds security');
});

test('the two RAG CVDs cover compute, platform, network and data, and leave security and operations open', () => {
  for (const id of ['flexpod-rag', 'flashstack-rag']) {
    const rows = new Map(coverage(id).map((r) => [r.primitive.id, r]));
    for (const p of ['compute', 'platform', 'network', 'data']) assert.ok(rows.get(p).have > 0, `${id}: ${p}`);
    assert.equal(rows.get('security').have, 0, `${id}: the guide names no security product`);
    assert.equal(rows.get('ops').have, 0, `${id}: the guide names no observability product`);
    const members = membersOf(id);
    assert.ok(members.has('ucs-x') && members.has('ucs-fi') && members.has('nvidia-gpu') && members.has('openshift'));
    assert.ok(!members.has('n9364e') && !members.has('silicon-one') && !members.has('c885a'), 'the AI POD hardware is not part of these designs');
  }
  assert.ok(membersOf('flexpod-rag').has('netapp') && !membersOf('flexpod-rag').has('pure'));
  assert.ok(membersOf('flashstack-rag').has('pure') && !membersOf('flashstack-rag').has('netapp'));
});

test('designsIncluding finds the designs that contain a product', () => {
  const names = designsIncluding('c885a').map((d) => d.id);
  assert.ok(names.includes('pod-2-8-9-400') && names.includes('ai-pod') && names.includes('secure-ai-factory'));
  assert.ok(!names.includes('pod-2-8-5-200'));
});

test('product links exclude designs, and primitive links count the other primitives it touches', () => {
  for (const l of productLinks) assert.ok(!nodeById.get(l.a).kind && !nodeById.get(l.b).kind);
  for (const p of PRIMITIVES) {
    const rows = primitiveLinks(p.id);
    assert.ok(rows.every((r) => r.primitive.id !== p.id && r.count > 0));
    for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].count >= rows[i].count, 'sorted by count');
  }
});

test('layout order lists each primitive\'s products once, busiest first', () => {
  const order = layoutOrder();
  const all = [...order.values()].flat();
  assert.equal(all.length, products.length);
  assert.equal(new Set(all).size, all.length);
  const degree = (id) => LINKS.filter((l) => l.a === id || l.b === id).length;
  for (const ids of order.values()) for (let i = 1; i < ids.length; i++) assert.ok(degree(ids[i - 1]) >= degree(ids[i]));
});
