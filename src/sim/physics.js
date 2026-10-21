// The orrery's physics. No DOM in here, so it runs under node --test.
//
// Every body feels three forces:
//   ring     a spring toward its layer's orbit (the "gravity well"), strength set by `gravity`
//   repel    a soft push away from nearby bodies, so labels stay readable
//   link     a weak spring along each integration, which sorts connected bodies into neighbours
// Selecting a body adds a fifth: its integration partners are released from their orbits a little
// and fall toward it, then settle back when it is deselected.

export const WORLD_R = 460;
export const DT = 1 / 60;

const K_RING = 14;
const K_REPEL = 52000;
const REPEL_RANGE = 150;
const K_OVERLAP = 30;
const K_LINK = 0.25;
const K_SAME_ORBIT = 20000; // long-range push between bodies on one orbit, so each orbit spreads around its circle
const SAME_ORBIT_RANGE = 700;
const LINK_REST = 80;
const LINK_MAX_STRETCH = 40; // beyond this a link stops pulling harder, so orbits always win
const K_FOCUS = 1.5;
const FOCUS_RELAX = 0.3;
const DAMPING = 0.92;
const REST_SPEED = 0.01; // below this a body stops dead, so a settled chart is exactly still

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function bodyRadius(mass) {
  return 4 + mass * 2.5;
}

export function createWorld(layers, nodes, links, seed = 11) {
  const rand = mulberry32(seed);
  const layerIndex = new Map(layers.map((l, i) => [l.id, i]));
  const perLayer = new Map();
  nodes.forEach((n) => perLayer.set(n.layer, (perLayer.get(n.layer) || 0) + 1));
  const placed = new Map();

  const bodies = nodes.map((n) => {
    const li = layerIndex.get(n.layer);
    const layer = layers[li];
    const slot = placed.get(n.layer) || 0;
    placed.set(n.layer, slot + 1);
    const ring = layer.r * WORLD_R;
    const angle = li * 0.9 + (slot / perLayer.get(n.layer)) * Math.PI * 2 + (rand() - 0.5) * 0.25;
    return {
      id: n.id,
      layer: n.layer,
      mass: n.mass,
      radius: bodyRadius(n.mass),
      ring,
      x: Math.cos(angle) * ring,
      y: Math.sin(angle) * ring,
      vx: 0,
      vy: 0,
      pinned: false,
    };
  });

  const index = new Map(bodies.map((b, i) => [b.id, i]));
  const pairs = links.map((l) => [index.get(l.a), index.get(l.b)]);
  const neighbours = bodies.map(() => new Set());
  pairs.forEach(([a, b]) => {
    neighbours[a].add(b);
    neighbours[b].add(a);
  });

  // A hub with a dozen integrations would otherwise be dragged off its orbit by their sum, so each
  // spring is weakened by the busier of its two ends.
  const strength = pairs.map(([a, b]) => K_LINK / Math.sqrt(Math.max(neighbours[a].size, neighbours[b].size)));

  return {
    bodies,
    index,
    pairs,
    strength,
    neighbours,
    fx: new Float64Array(bodies.length),
    fy: new Float64Array(bodies.length),
  };
}

// Advance the world one fixed step. `gravity` scales the orbit springs and `focus` is the index of
// the selected body or -1. At rest the chart is still; bodies only move when dragged or selected.
export function step(world, { gravity = 1, focus = -1 } = {}) {
  const { bodies, pairs, strength, neighbours, fx, fy } = world;
  const n = bodies.length;
  fx.fill(0);
  fy.fill(0);
  const pulled = focus >= 0 ? neighbours[focus] : null;
  const anchor = focus >= 0 ? bodies[focus] : null;

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    const r = Math.hypot(b.x, b.y) || 1e-3;
    const ux = b.x / r;
    const uy = b.y / r;
    const released = pulled && pulled.has(i);
    const pull = -K_RING * gravity * (released ? FOCUS_RELAX : 1) * (r - b.ring);
    fx[i] += pull * ux;
    fy[i] += pull * uy;
    if (released) {
      fx[i] += K_FOCUS * (anchor.x - b.x);
      fy[i] += K_FOCUS * (anchor.y - b.y);
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      const same = a.layer === b.layer;
      const range = same ? SAME_ORBIT_RANGE : REPEL_RANGE;
      if (d2 > range * range) continue;
      const d = Math.sqrt(Math.max(d2, 1));
      const minD = a.radius + b.radius + 26;
      // Each push is shifted down by its value at the range limit, so it fades to zero there. A hard
      // cutoff leaves a bump in the force that bodies hovering at that distance keep bouncing off.
      const pair = K_REPEL * Math.sqrt(a.mass * b.mass);
      let mag = pair / (d * d) - pair / (REPEL_RANGE * REPEL_RANGE);
      if (mag < 0) mag = 0;
      if (same) mag += K_SAME_ORBIT / d - K_SAME_ORBIT / SAME_ORBIT_RANGE;
      if (d < minD) mag += K_OVERLAP * (minD - d);
      const ux = dx / d;
      const uy = dy / d;
      fx[i] += ux * mag;
      fy[i] += uy * mag;
      fx[j] -= ux * mag;
      fy[j] -= uy * mag;
    }
  }

  for (let k = 0; k < pairs.length; k++) {
    const [i, j] = pairs[k];
    const dx = bodies[j].x - bodies[i].x;
    const dy = bodies[j].y - bodies[i].y;
    const d = Math.hypot(dx, dy) || 1e-3;
    const mag = strength[k] * Math.min(d - LINK_REST, LINK_MAX_STRETCH);
    const ux = dx / d;
    const uy = dy / d;
    fx[i] += ux * mag;
    fy[i] += uy * mag;
    fx[j] -= ux * mag;
    fy[j] -= uy * mag;
  }

  for (let i = 0; i < n; i++) {
    const b = bodies[i];
    if (b.pinned) {
      b.vx = 0;
      b.vy = 0;
      continue;
    }
    const inv = 1 / (0.6 + 0.4 * b.mass);
    b.vx = (b.vx + fx[i] * inv * DT) * DAMPING;
    b.vy = (b.vy + fy[i] * inv * DT) * DAMPING;
    if (Math.hypot(b.vx, b.vy) < REST_SPEED) {
      b.vx = 0;
      b.vy = 0;
      continue;
    }
    b.x += b.vx * DT * 60;
    b.y += b.vy * DT * 60;
  }
}

// Run the simulation without drawing, so the first frame is already a settled chart.
export function settle(world, steps = 4000) {
  for (let i = 0; i < steps; i++) step(world);
}
