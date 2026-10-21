import test from 'node:test';
import assert from 'node:assert/strict';
import { PRIMITIVES, NODES, LINKS, LINK_TYPES, SOURCES } from '../src/data/stack.js';

const ids = new Set(NODES.map((n) => n.id));
const typeIds = new Set(LINK_TYPES.map((t) => t.id));
const primitiveIds = new Set(PRIMITIVES.map((p) => p.id));
const isDesign = (n) => n.kind === 'design';

test('node ids are unique', () => {
  assert.equal(ids.size, NODES.length);
});

test('every product sits in exactly one known primitive; designs sit in none', () => {
  for (const n of NODES) {
    if (isDesign(n)) assert.equal(n.primitive, undefined, `${n.id}: a design has no primitive`);
    else assert.ok(primitiveIds.has(n.primitive), `${n.id}: unknown primitive ${n.primitive}`);
    assert.ok(['cisco', 'partner'].includes(n.vendor), `${n.id}: vendor`);
    assert.ok(['sourced', 'check'].includes(n.status), `${n.id}: status`);
    assert.ok(n.blurb.length > 20, `${n.id}: blurb`);
    if (n.short) assert.ok(n.short.length < n.name.length, `${n.id}: short should be shorter`);
  }
});

test('every product cites a URL from the SOURCES list', () => {
  const urls = new Set(Object.values(SOURCES));
  for (const n of NODES) assert.ok(urls.has(n.url), `${n.id}: url not in SOURCES`);
});

test('there are six primitives, each in its own sector, each with products that fit its wedge', () => {
  assert.equal(PRIMITIVES.length, 6);
  assert.equal(new Set(PRIMITIVES.map((p) => p.sector)).size, 6);
  for (const p of PRIMITIVES) {
    assert.ok(p.summary.length > 20 && p.label.length < p.name.length + 1, p.id);
    const count = NODES.filter((n) => n.primitive === p.id).length;
    assert.ok(count >= 1 && count <= 9, `${p.id}: ${count} products do not fit the three outer rings of a wedge`);
  }
});

test('there is at least one validated design to use as a portfolio lens', () => {
  assert.ok(NODES.filter(isDesign).length >= 2);
});

test('links join known nodes with a known type, no self loops, no duplicates', () => {
  const seen = new Set();
  for (const l of LINKS) {
    assert.ok(ids.has(l.a) && ids.has(l.b), `${l.a} - ${l.b}: unknown endpoint`);
    assert.notEqual(l.a, l.b);
    assert.ok(typeIds.has(l.type), `${l.a} - ${l.b}: type ${l.type}`);
    assert.ok(['sourced', 'check'].includes(l.status));
    const key = [l.a, l.b].sort().join('|') + '|' + l.type;
    assert.ok(!seen.has(key), `duplicate link ${key}`);
    seen.add(key);
  }
});

test('every link type has wording for both ends', () => {
  for (const t of LINK_TYPES) assert.ok(t.name && t.from && t.to && t.from !== t.to, t.id);
});

test('no node is orphaned, and the graph is one connected piece', () => {
  const adj = new Map(NODES.map((n) => [n.id, []]));
  LINKS.forEach((l) => {
    adj.get(l.a).push(l.b);
    adj.get(l.b).push(l.a);
  });
  const reached = new Set([NODES[0].id]);
  const queue = [NODES[0].id];
  while (queue.length) for (const m of adj.get(queue.shift())) if (!reached.has(m)) (reached.add(m), queue.push(m));
  assert.deepEqual(NODES.filter((n) => !reached.has(n.id)).map((n) => n.id), []);
});
