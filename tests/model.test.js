import test from 'node:test';
import assert from 'node:assert/strict';
import { NODES, LINKS, LINK_TYPES } from '../src/data/stack.js';
import { parseRoute, linksOf, layerConnections, nodesIn, stackLayers, crossLayers, frameLayer } from '../src/data/model.js';

test('routes parse from the hash, and unknown ones fall back to the stack', () => {
  assert.deepEqual(parseRoute(''), { view: 'stack' });
  assert.deepEqual(parseRoute('#/'), { view: 'stack' });
  assert.deepEqual(parseRoute('#/layer/network'), { view: 'layer', id: 'network' });
  assert.deepEqual(parseRoute('#/node/ai-defense'), { view: 'node', id: 'ai-defense' });
  assert.deepEqual(parseRoute('#/node/nope'), { view: 'stack' });
  assert.deepEqual(parseRoute('#/layer/nope'), { view: 'stack' });
  assert.deepEqual(parseRoute('#/garbage'), { view: 'stack' });
});

test('the three groups cover every layer and every node is reachable from the stack page', () => {
  const shown = new Set([frameLayer, ...stackLayers, ...crossLayers].map((l) => l.id));
  for (const n of NODES) assert.ok(shown.has(n.layer), `${n.id} sits in a layer the stack page does not show`);
});

test('linksOf returns each integration from both ends', () => {
  for (const l of LINKS) {
    assert.ok(linksOf(l.a).some((x) => x.other.id === l.b), `${l.a} does not list ${l.b}`);
    assert.ok(linksOf(l.b).some((x) => x.other.id === l.a), `${l.b} does not list ${l.a}`);
  }
});

test('layer connections only list integrations that leave the layer', () => {
  for (const layer of [frameLayer, ...stackLayers, ...crossLayers]) {
    for (const { layer: other, items } of layerConnections(layer.id)) {
      assert.notEqual(other.id, layer.id);
      for (const it of items) {
        assert.equal(it.from.layer, layer.id);
        assert.equal(it.to.layer, other.id);
      }
    }
  }
});

test('every layer has at least one product to open', () => {
  for (const l of [frameLayer, ...stackLayers, ...crossLayers]) assert.ok(nodesIn(l.id).length > 0);
});

test('every integration reads sensibly from both ends', () => {
  for (const l of LINKS) {
    const fromA = linksOf(l.a).find((x) => x.other.id === l.b && x.type === l.type);
    const fromB = linksOf(l.b).find((x) => x.other.id === l.a && x.type === l.type);
    assert.notEqual(fromA.phrase, fromB.phrase, `${l.a} / ${l.b}: both ends read the same`);
  }
});

test('every link type has wording for both ends', () => {
  for (const t of LINK_TYPES) assert.ok(t.name && t.from && t.to && t.from !== t.to, t.id);
});
