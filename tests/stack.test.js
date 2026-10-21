import test from 'node:test';
import assert from 'node:assert/strict';
import { LAYERS, NODES, LINKS, LINK_TYPES, SOURCES } from '../src/data/stack.js';

const ids = new Set(NODES.map((n) => n.id));
const layerIds = new Set(LAYERS.map((l) => l.id));
const typeIds = new Set(LINK_TYPES.map((t) => t.id));

test('node ids are unique', () => {
  assert.equal(ids.size, NODES.length);
});

test('every node sits in a known layer, with a valid vendor, mass and status', () => {
  for (const n of NODES) {
    assert.ok(layerIds.has(n.layer), `${n.id}: unknown layer ${n.layer}`);
    assert.ok(['cisco', 'partner'].includes(n.vendor), `${n.id}: vendor`);
    assert.ok(['sourced', 'check'].includes(n.status), `${n.id}: status`);
    assert.ok(n.blurb.length > 20, `${n.id}: blurb`);
  }
});

test('every node cites a URL from the SOURCES list', () => {
  const urls = new Set(Object.values(SOURCES));
  for (const n of NODES) assert.ok(urls.has(n.url), `${n.id}: url not in SOURCES`);
});

test('every layer is populated, with one frame and a sensible layout', () => {
  for (const l of LAYERS) {
    assert.ok(NODES.some((n) => n.layer === l.id), `${l.id} is empty`);
    assert.ok(['frame', 'stack', 'cross'].includes(l.group), `${l.id}: group`);
    assert.ok(l.summary.length > 20, `${l.id}: summary`);
  }
  assert.equal(LAYERS.filter((l) => l.group === 'frame').length, 1);
  assert.ok(LAYERS.filter((l) => l.group === 'stack').length >= 3);
  assert.equal(new Set(LAYERS.map((l) => l.id)).size, LAYERS.length);
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
