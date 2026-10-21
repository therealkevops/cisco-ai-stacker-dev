// Honeycomb geometry for the map. No DOM in here, so it runs under node --test.
//
// Cells use axial coordinates (q, r) with pointy-top hexagons. The centre cell is the AI workload;
// the six cells around it are the primitives; each primitive owns a wedge of the rings beyond it,
// and its products are placed in that wedge, nearest the primitive first.

const SQRT3 = Math.sqrt(3);

// Neighbour directions in clockwise order on screen: east, south-east, south-west, west, north-west,
// north-east.
export const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];

export const toPixel = (q, r, size) => ({ x: size * SQRT3 * (q + r / 2), y: size * 1.5 * r });

export const cellKey = (q, r) => `${q},${r}`;

// The cells in sector k of ring `ring`: they start at the ring's corner in direction k and walk along
// the edge towards the next corner, without reaching it (that one is the next sector's).
export function sectorCells(k, ring) {
  const d = DIRS[k];
  const step = DIRS[(k + 2) % 6];
  return Array.from({ length: ring }, (_, j) => [d[0] * ring + step[0] * j, d[1] * ring + step[1] * j]);
}

// Every cell within `rings` of the centre, for drawing the faint empty honeycomb behind the map.
export function allCells(rings) {
  const cells = [[0, 0]];
  for (let ring = 1; ring <= rings; ring++) for (let k = 0; k < 6; k++) cells.push(...sectorCells(k, ring));
  return cells;
}

export const hexDistance = (a, b) => {
  const dq = a[0] - b[0];
  const dr = a[1] - b[1];
  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr));
};

// Place the primitives and their products. `ordered` maps a primitive id to its products, best
// first. Each primitive owns the three outer rings of its wedge, and its products take those cells
// nearest the primitive first, so every cluster stays one connected clump beside its primitive.
export function layoutMap(primitives, ordered, size) {
  const cells = new Map();
  const put = (id, q, r, role) => cells.set(id, { id, q, r, role, ...toPixel(q, r, size) });
  put('__centre', 0, 0, 'centre');
  for (const p of primitives) {
    const [q, r] = sectorCells(p.sector, 1)[0];
    put(p.id, q, r, 'primitive');
    const wedge = [2, 3, 4]
      .flatMap((ring) => sectorCells(p.sector, ring).map((cell, j) => ({ cell, ring, j })))
      .sort((x, y) => hexDistance([q, r], x.cell) - hexDistance([q, r], y.cell) || x.ring - y.ring || x.j - y.j);
    (ordered.get(p.id) || []).forEach((item, i) => put(item, wedge[i].cell[0], wedge[i].cell[1], 'product'));
  }
  return cells;
}

// Six corners of a pointy-top hexagon centred on (x, y). `size` is the centre-to-corner distance.
export function hexPoints(x, y, size) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return [x + size * Math.cos(a), y + size * Math.sin(a)];
  });
}

// A curve between two cells for a link, starting and ending just inside the hexagon edges, bowed
// sideways so it does not run straight through the cells between. Returns the path and the end
// points (the arrowhead sits on the second).
export function linkPath(from, to, size, bow = 0.14) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const inset = size * 0.82;
  const a = { x: from.x + ux * inset, y: from.y + uy * inset };
  const b = { x: to.x - ux * inset, y: to.y - uy * inset };
  const mx = (a.x + b.x) / 2 - uy * len * bow;
  const my = (a.y + b.y) / 2 + ux * len * bow;
  const f = (n) => Math.round(n * 10) / 10;
  return { d: `M${f(a.x)},${f(a.y)} Q${f(mx)},${f(my)} ${f(b.x)},${f(b.y)}`, a, b };
}

// Break a label into lines no longer than `max` characters, on word boundaries. A single word longer
// than the limit gets a line to itself. A short word left alone on a second line ("UCS C885A / M8")
// is pulled down with the word before it ("UCS / C885A M8") so the label stays balanced.
export function wrapLabel(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  if (lines.length === 2 && lines[1].length <= 3 && lines[0].includes(' ')) {
    const words = lines[0].split(' ');
    const last = words.pop();
    return [words.join(' '), last + ' ' + lines[1]];
  }
  return lines;
}
