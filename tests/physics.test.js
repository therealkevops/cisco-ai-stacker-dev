import test from 'node:test';
import assert from 'node:assert/strict';
import { LAYERS, NODES, LINKS } from '../src/data/stack.js';
import { createWorld, step, settle, WORLD_R } from '../src/sim/physics.js';

const build = () => createWorld(LAYERS, NODES, LINKS);

test('the same seed gives the same layout', () => {
  const a = build();
  const b = build();
  settle(a);
  settle(b);
  assert.deepEqual(a.bodies.map((x) => [x.x, x.y]), b.bodies.map((x) => [x.x, x.y]));
});

test('settled bodies sit close to their orbit', () => {
  const w = build();
  settle(w);
  for (const b of w.bodies) {
    const off = Math.abs(Math.hypot(b.x, b.y) - b.ring);
    assert.ok(off < 45, `${b.id} is ${off.toFixed(1)}px off its orbit`);
  }
});

test('settled bodies do not sit on top of each other', () => {
  const w = build();
  settle(w);
  let closest = Infinity;
  for (let i = 0; i < w.bodies.length; i++)
    for (let j = i + 1; j < w.bodies.length; j++) {
      const a = w.bodies[i];
      const b = w.bodies[j];
      closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y) - a.radius - b.radius);
    }
  assert.ok(closest > 12, `closest gap is ${closest.toFixed(1)}px`);
});

test('the simulation stays bounded and comes to rest', () => {
  const w = build();
  settle(w);
  for (let i = 0; i < 60 * 60 * 10; i++) step(w);
  for (const b of w.bodies) {
    assert.ok(Number.isFinite(b.x) && Number.isFinite(b.y), `${b.id} left the numbers`);
    assert.ok(Math.hypot(b.x, b.y) < WORLD_R * 1.2, `${b.id} escaped`);
  }
});

test('selecting a body pulls its partners closer, and they fall back when released', () => {
  const w = build();
  settle(w);
  const focus = w.index.get('ai-canvas');
  const partners = [...w.neighbours[focus]];
  const meanGap = () =>
    partners.reduce((s, i) => s + Math.hypot(w.bodies[i].x - w.bodies[focus].x, w.bodies[i].y - w.bodies[focus].y), 0) /
    partners.length;
  const before = meanGap();
  for (let i = 0; i < 400; i++) step(w, { focus });
  assert.ok(meanGap() < before * 0.85, 'partners did not close in');
  for (let i = 0; i < 800; i++) step(w);
  assert.ok(Math.abs(meanGap() - before) < before * 0.2, 'partners did not return');
});

test('zero gravity lets bodies drift off their orbits', () => {
  const w = build();
  settle(w);
  for (let i = 0; i < 300; i++) step(w, { gravity: 0 });
  const off = w.bodies.reduce((s, b) => s + Math.abs(Math.hypot(b.x, b.y) - b.ring), 0) / w.bodies.length;
  assert.ok(off > 5);
});

test('a settled chart is stationary', () => {
  const w = build();
  settle(w);
  const before = w.bodies.map((b) => [b.x, b.y]);
  for (let i = 0; i < 60 * 30; i++) step(w);
  const moved = Math.max(...w.bodies.map((b, i) => Math.hypot(b.x - before[i][0], b.y - before[i][1])));
  assert.equal(moved, 0, `a body moved ${moved.toFixed(4)}px on its own`);
});
