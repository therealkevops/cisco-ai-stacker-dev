import test from 'node:test';
import assert from 'node:assert/strict';
import { routeEdges, anchorOn } from '../src/views/geometry.js';

const rect = (x, y, w = 100, h = 30) => ({ x, y, w, h });
const L = (a, b) => ({ a, b, type: 'manages' });

const parse = (d) => {
  const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
  return { start: { x: n[0], y: n[1] }, end: { x: n[6], y: n[7] } };
};

test('chips in different rows connect bottom to top, from a to b', () => {
  const rects = new Map([['up', rect(100, 0)], ['down', rect(300, 200)]]);
  const [e] = routeEdges([L('up', 'down')], rects);
  const { start, end } = parse(e.d);
  assert.equal(start.y, 30, 'leaves the bottom edge of the upper chip');
  assert.equal(end.y, 200, 'arrives at the top edge of the lower chip');
});

test('the line always starts at a and ends at b, whichever chip is higher', () => {
  const rects = new Map([['up', rect(100, 0)], ['down', rect(300, 200)]]);
  const [e] = routeEdges([L('down', 'up')], rects);
  const { start, end } = parse(e.d);
  assert.equal(start.y, 200);
  assert.equal(end.y, 30);
});

test('chips in the same row connect side to side', () => {
  const rects = new Map([['l', rect(0, 0)], ['r', rect(300, 4)]]);
  const [e] = routeEdges([L('l', 'r')], rects);
  const { start, end } = parse(e.d);
  assert.equal(start.x, 100);
  assert.equal(end.x, 300);
});

test('lines meeting one side of a chip are spread along it, in order of where they go', () => {
  const rects = new Map([
    ['hub', rect(200, 0)],
    ['left', rect(0, 200)],
    ['mid', rect(200, 200)],
    ['right', rect(400, 200)],
  ]);
  const edges = routeEdges([L('hub', 'right'), L('hub', 'left'), L('hub', 'mid')], rects);
  const xs = Object.fromEntries(edges.map((e) => [e.link.b, parse(e.d).start.x]));
  assert.ok(xs.left < xs.mid && xs.mid < xs.right, JSON.stringify(xs));
  assert.equal(new Set(Object.values(xs)).size, 3, 'anchors must not coincide');
  for (const x of Object.values(xs)) assert.ok(x > 200 && x < 300, 'anchors stay on the chip');
});

test('links to chips that are not on screen are skipped', () => {
  const rects = new Map([['a', rect(0, 0)]]);
  assert.deepEqual(routeEdges([L('a', 'missing')], rects), []);
});

test('anchors fall on the named side', () => {
  const r = rect(10, 20, 100, 30);
  assert.equal(anchorOn(r, 'top', 0, 1).y, 20);
  assert.equal(anchorOn(r, 'bottom', 0, 1).y, 50);
  assert.equal(anchorOn(r, 'left', 0, 1).x, 10);
  assert.equal(anchorOn(r, 'right', 0, 1).x, 110);
  assert.equal(anchorOn(r, 'top', 0, 1).x, 60, 'a lone line meets the middle');
});
