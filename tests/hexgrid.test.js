import test from 'node:test';
import assert from 'node:assert/strict';
import { DIRS, sectorCells, allCells, hexDistance, layoutMap, hexPoints, linkPath, wrapLabel, toPixel, cellKey } from '../src/map/hexgrid.js';
import { PRIMITIVES } from '../src/data/stack.js';
import { products, layoutOrder, productLinks } from '../src/data/model.js';

const ordered = layoutOrder();

test('the six sectors of a ring tile it exactly, with no gaps or overlaps', () => {
  for (let ring = 1; ring <= 5; ring++) {
    const keys = [0, 1, 2, 3, 4, 5].flatMap((k) => sectorCells(k, ring).map(([q, r]) => cellKey(q, r)));
    assert.equal(keys.length, 6 * ring);
    assert.equal(new Set(keys).size, 6 * ring, `ring ${ring} has overlapping cells`);
    for (const key of keys) {
      const [q, r] = key.split(',').map(Number);
      assert.equal(hexDistance([0, 0], [q, r]), ring, `${key} is not on ring ${ring}`);
    }
  }
});

test('the first cell of every sector is the corner in that direction', () => {
  for (let k = 0; k < 6; k++) assert.deepEqual(sectorCells(k, 3)[0], [DIRS[k][0] * 3, DIRS[k][1] * 3]);
});

test('allCells covers the centre and every ring once', () => {
  const cells = allCells(4);
  assert.equal(cells.length, 1 + 6 + 12 + 18 + 24);
  assert.equal(new Set(cells.map(([q, r]) => cellKey(q, r))).size, cells.length);
});

test('the six primitives take the six cells around the centre', () => {
  assert.equal(new Set(PRIMITIVES.map((p) => p.sector)).size, 6);
  const map = layoutMap(PRIMITIVES, ordered, 50);
  for (const p of PRIMITIVES) assert.equal(hexDistance([0, 0], [map.get(p.id).q, map.get(p.id).r]), 1);
});

test('every product gets its own cell, and none lands on the centre or a primitive', () => {
  const map = layoutMap(PRIMITIVES, ordered, 50);
  const seen = new Set();
  for (const [id, cell] of map) {
    const key = cellKey(cell.q, cell.r);
    assert.ok(!seen.has(key), `${id} shares a cell`);
    seen.add(key);
  }
  for (const n of products) {
    assert.ok(map.has(n.id), `${n.id} was not placed`);
    assert.equal(map.get(n.id).role, 'product');
  }
});

test('products sit close to their primitive: never further than three cells away', () => {
  const map = layoutMap(PRIMITIVES, ordered, 50);
  for (const n of products) {
    const p = map.get(n.primitive);
    const c = map.get(n.id);
    assert.ok(hexDistance([p.q, p.r], [c.q, c.r]) <= 3, `${n.id} is too far from ${n.primitive}`);
  }
});

test('each primitive and its products form one connected clump', () => {
  const map = layoutMap(PRIMITIVES, ordered, 50);
  for (const p of PRIMITIVES) {
    const cells = [p.id, ...ordered.get(p.id)].map((id) => [map.get(id).q, map.get(id).r]);
    const reached = new Set([cellKey(...cells[0])]);
    const queue = [cells[0]];
    while (queue.length) {
      const c = queue.shift();
      for (const d of cells) if (hexDistance(c, d) === 1 && !reached.has(cellKey(...d))) (reached.add(cellKey(...d)), queue.push(d));
    }
    assert.equal(reached.size, cells.length, `${p.id} has products cut off from it`);
  }
});

test('every label fits its hexagon: no line is longer than the widest that fits', () => {
  for (const n of products) for (const line of wrapLabel(n.short || n.name, 11)) assert.ok(line.length <= 13, `${n.id}: "${line}"`);
});

test('the first product listed takes the cell directly outward of its primitive', () => {
  const map = layoutMap(PRIMITIVES, ordered, 50);
  for (const p of PRIMITIVES) {
    const first = ordered.get(p.id)[0];
    const [q, r] = [DIRS[p.sector][0] * 2, DIRS[p.sector][1] * 2];
    assert.deepEqual([map.get(first).q, map.get(first).r], [q, r]);
  }
});

test('neighbouring cells are exactly one cell-spacing apart in pixels', () => {
  const size = 50;
  const d = Math.hypot(toPixel(1, 0, size).x - toPixel(0, 0, size).x, toPixel(1, 0, size).y - toPixel(0, 0, size).y);
  assert.ok(Math.abs(d - Math.sqrt(3) * size) < 1e-9);
  for (const [q, r] of DIRS) assert.ok(Math.abs(Math.hypot(toPixel(q, r, size).x, toPixel(q, r, size).y) - d) < 1e-9);
});

test('a hexagon has six corners at the stated size', () => {
  const pts = hexPoints(10, 20, 40);
  assert.equal(pts.length, 6);
  for (const [x, y] of pts) assert.ok(Math.abs(Math.hypot(x - 10, y - 20) - 40) < 1e-9);
});

test('a link path starts and ends inside the two hexagons, not at their centres', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 300, y: 0 };
  const { a: s, b: e } = linkPath(a, b, 50);
  assert.ok(s.x > 0 && s.x < 50 && e.x < 300 && e.x > 250);
});

const pathLength = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

test('every connection on the real map draws a line long enough to see, even between neighbours', () => {
  const size = 52;
  const map = layoutMap(PRIMITIVES, ordered, size);
  let neighbours = 0;
  for (const l of productLinks) {
    const from = map.get(l.a);
    const to = map.get(l.b);
    const { a, b } = linkPath(from, to, size);
    if (hexDistance([from.q, from.r], [to.q, to.r]) === 1) neighbours++;
    assert.ok(pathLength(a, b) >= 30, `${l.a} - ${l.b}: the line is only ${pathLength(a, b).toFixed(1)}px long`);
  }
  assert.ok(neighbours > 0, 'the test should exercise neighbouring hexes');
});

test('a line between neighbours is centred on their shared edge and runs straight from a to b', () => {
  const size = 52;
  const from = { x: 0, y: 0 };
  const to = { x: Math.sqrt(3) * size, y: 0 };
  const { a, b, d } = linkPath(from, to, size);
  assert.ok(Math.abs((a.x + b.x) / 2 - to.x / 2) < 1e-6 && Math.abs((a.y + b.y) / 2) < 1e-6, 'centred on the shared edge');
  assert.ok(a.x < b.x, 'runs from a towards b');
  assert.ok(!d.includes('Q'), 'a short connector is straight, not bowed');
});

test('a longer line is still trimmed back from both hexagons so it clears their labels', () => {
  const { a, b } = linkPath({ x: 0, y: 0 }, { x: 300, y: 0 }, 52);
  assert.ok(a.x > 30 && b.x < 270);
});

test('labels wrap on word boundaries and never split a word', () => {
  assert.deepEqual(wrapLabel('Isovalent Runtime Security', 14), ['Isovalent', 'Runtime', 'Security']);
  assert.deepEqual(wrapLabel('UCS C885A M8', 14), ['UCS C885A M8']);
  assert.deepEqual(wrapLabel('NVIDIA AI Enterprise', 14), ['NVIDIA AI', 'Enterprise']);
  assert.deepEqual(wrapLabel('Supercalifragilistic stuff', 10), ['Supercalifragilistic', 'stuff']);
  assert.deepEqual(wrapLabel('', 10), []);
  assert.deepEqual(wrapLabel('UCS C885A M8', 11), ['UCS', 'C885A M8'], 'no orphaned short word');
  assert.deepEqual(wrapLabel('Foundation AI', 11), ['Foundation', 'AI'], 'a single word before it cannot move');
});
