import test from 'node:test';
import assert from 'node:assert/strict';
import { JOURNEYS } from '../src/data/journeys.js';
import { nodeById, edgesAmong, parseRoute } from '../src/data/model.js';

test('journeys have unique ids and several steps each', () => {
  assert.equal(new Set(JOURNEYS.map((j) => j.id)).size, JOURNEYS.length);
  for (const j of JOURNEYS) {
    assert.ok(j.steps.length >= 3, j.id);
    assert.ok(j.title && j.blurb, j.id);
  }
});

test('every product a step names exists, once per step', () => {
  for (const j of JOURNEYS)
    for (const s of j.steps) {
      assert.ok(s.title && s.text.length > 40, `${j.id}: ${s.title}`);
      assert.equal(new Set(s.nodes).size, s.nodes.length, `${j.id}/${s.title}: duplicate`);
      for (const id of s.nodes) assert.ok(nodeById.has(id), `${j.id}/${s.title}: unknown product ${id}`);
    }
});

test('every step shows at least one connection, and all its products take part in one', () => {
  for (const j of JOURNEYS)
    for (const s of j.steps) {
      const edges = edgesAmong(s.nodes);
      assert.ok(edges.length > 0, `${j.id}/${s.title}: nothing to draw`);
      const touched = new Set(edges.flatMap((e) => [e.a, e.b]));
      for (const id of s.nodes) assert.ok(touched.has(id), `${j.id}/${s.title}: ${id} is lit but connected to nothing in the step`);
    }
});

test('a step that mentions an unverified link says so', () => {
  for (const j of JOURNEYS)
    for (const s of j.steps) {
      const unverified = edgesAmong(s.nodes).some((e) => e.status === 'check') || s.nodes.some((id) => nodeById.get(id).status === 'check');
      if (unverified) assert.match(s.text, /not yet confirmed|Sources disagree/, `${j.id}/${s.title}`);
    }
});

test('journey and pick routes parse, and step numbers are clamped', () => {
  assert.deepEqual(parseRoute('#/pick/ai-defense'), { view: 'stack', pick: 'ai-defense' });
  assert.deepEqual(parseRoute('#/pick/nope'), { view: 'stack' });
  assert.deepEqual(parseRoute('#/journey/secure/2'), { view: 'stack', journey: { id: 'secure', step: 2 } });
  assert.deepEqual(parseRoute('#/journey/secure'), { view: 'stack', journey: { id: 'secure', step: 1 } });
  assert.deepEqual(parseRoute('#/journey/secure/99'), { view: 'stack', journey: { id: 'secure', step: 4 } });
  assert.deepEqual(parseRoute('#/journey/secure/-3'), { view: 'stack', journey: { id: 'secure', step: 1 } });
  assert.deepEqual(parseRoute('#/journey/nope/1'), { view: 'stack' });
});
