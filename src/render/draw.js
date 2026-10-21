// Canvas drawing for the orrery, in the manner of an engraved plate: hairline orbits, a
// protractor scale on the outer one, one accent colour, and integration types told apart by
// dash pattern rather than hue.

import { WORLD_R } from '../sim/physics.js';

const MONO = '"IBM Plex Mono", ui-monospace, monospace';
const SERIF = '"Newsreader", Georgia, serif';

// Dash patterns per integration type, in screen pixels.
export const LINK_STYLE = {
  composes: { dash: [], width: 1.5 },
  network: { dash: [9, 4], width: 1.25 },
  manages: { dash: [4, 3], width: 1.25 },
  secures: { dash: [12, 3, 2, 3], width: 1.25 },
  observes: { dash: [0.1, 6], width: 2, cap: 'round' },
};

export function readTheme() {
  const css = getComputedStyle(document.documentElement);
  const get = (name) => css.getPropertyValue(name).trim();
  return { paper: get('--paper'), ink: get('--ink'), muted: get('--ink-2'), accent: get('--accent') };
}

// Room around the last orbit for labels: more across than up and down, since labels run sideways.
export const FIT_X = 1.5;
export const FIT_Y = 1.22;

export function fitScale(width, height) {
  return Math.min(width / (2 * WORLD_R * FIT_X), height / (2 * WORLD_R * FIT_Y));
}

export function screenToWorld(view, width, height, sx, sy) {
  const s = fitScale(width, height) * view.k;
  return { x: (sx - width / 2 - view.x) / s, y: (sy - height / 2 - view.y) / s };
}

export function hitTest(world, view, width, height, sx, sy) {
  const s = fitScale(width, height) * view.k;
  const p = screenToWorld(view, width, height, sx, sy);
  let best = null;
  let bestD = Infinity;
  for (const b of world.bodies) {
    const d = Math.hypot(b.x - p.x, b.y - p.y);
    const reach = b.radius + 7 / s;
    if (d < reach && d < bestD) {
      best = b;
      bestD = d;
    }
  }
  return best;
}

function withAlpha(ctx, a, fn) {
  const prev = ctx.globalAlpha;
  ctx.globalAlpha = prev * a;
  fn();
  ctx.globalAlpha = prev;
}

export function drawScene(ctx, scene) {
  const { world, layers, nodes, links, view, width, height, theme, state } = scene;
  const base = fitScale(width, height);
  const s = base * view.k;
  const { focusId, matchIds, hiddenTypes, hoverId } = state;
  const focusIdx = focusId ? world.index.get(focusId) : -1;
  const partners = focusIdx >= 0 ? world.neighbours[focusIdx] : null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(width / 2 + view.x, height / 2 + view.y);
  ctx.scale(s, s);

  const px = 1 / s; // one screen pixel in world units
  const isLit = (i) => {
    if (focusIdx >= 0) return i === focusIdx || partners.has(i);
    if (matchIds) return matchIds.has(world.bodies[i].id);
    return true;
  };

  // Axes: a faint crosshair through the centre, like a chart's reference lines.
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = px;
  withAlpha(ctx, 0.1, () => {
    ctx.beginPath();
    ctx.moveTo(-WORLD_R * 1.25, 0);
    ctx.lineTo(WORLD_R * 1.25, 0);
    ctx.moveTo(0, -WORLD_R * 1.25);
    ctx.lineTo(0, WORLD_R * 1.25);
    ctx.stroke();
  });

  // Protractor scale just outside the last orbit: a tick every 2 degrees, longer every 10.
  withAlpha(ctx, 0.35, () => {
    const r0 = WORLD_R * 1.1;
    ctx.beginPath();
    for (let deg = 0; deg < 360; deg += 2) {
      const a = (deg * Math.PI) / 180;
      const len = deg % 10 === 0 ? 9 : 4;
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a) * (r0 + len), Math.sin(a) * (r0 + len));
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r0, 0, Math.PI * 2);
    ctx.stroke();
  });
  if (s > 0.55) {
    ctx.fillStyle = theme.muted;
    ctx.font = `${9 * px}px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let deg = 0; deg < 360; deg += 30) {
      const a = (deg * Math.PI) / 180;
      const r = WORLD_R * 1.1 + 22;
      ctx.fillText(String(deg).padStart(3, '0'), Math.cos(a) * r, Math.sin(a) * r);
    }
  }

  // Orbits, with a numbered label set into each one at the top.
  layers.forEach((layer, i) => {
    const r = layer.r * WORLD_R;
    ctx.strokeStyle = theme.ink;
    ctx.lineWidth = px;
    withAlpha(ctx, 0.28, () => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    });
    if (s > 0.5) {
      const label = `${String(i + 1).padStart(2, '0')}  ${layer.name.toUpperCase()}`;
      const angle = -Math.PI / 2 + 0.06 + i * 0.03;
      ctx.save();
      ctx.translate(Math.cos(angle) * r, Math.sin(angle) * r);
      ctx.rotate(angle + Math.PI / 2);
      ctx.font = `${8.5 * px}px ${MONO}`;
      const w = ctx.measureText(label).width + 8 * px;
      ctx.fillStyle = theme.paper;
      ctx.fillRect(-2 * px, -6 * px, w, 12 * px);
      ctx.fillStyle = theme.muted;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 2 * px, 0);
      ctx.restore();
    }
  });

  // Centre mark.
  ctx.strokeStyle = theme.ink;
  ctx.lineWidth = px;
  ctx.beginPath();
  ctx.moveTo(-5 * px, 0);
  ctx.lineTo(5 * px, 0);
  ctx.moveTo(0, -5 * px);
  ctx.lineTo(0, 5 * px);
  ctx.stroke();

  // Links.
  links.forEach((l, k) => {
    if (hiddenTypes.has(l.type)) return;
    const [i, j] = world.pairs[k];
    const a = world.bodies[i];
    const b = world.bodies[j];
    const incident = focusIdx >= 0 && (i === focusIdx || j === focusIdx);
    const dimmed = focusIdx >= 0 ? !incident : matchIds ? !(matchIds.has(a.id) || matchIds.has(b.id)) : false;
    const style = LINK_STYLE[l.type];
    ctx.lineCap = style.cap || 'butt';
    ctx.lineWidth = (incident ? style.width + 0.6 : style.width) * px;
    ctx.setLineDash(style.dash.map((d) => d * px));
    ctx.strokeStyle = incident ? theme.accent : theme.ink;
    withAlpha(ctx, incident ? 1 : dimmed ? 0.07 : 0.42, () => {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
  });
  ctx.setLineDash([]);
  ctx.lineCap = 'butt';

  // Bodies.
  world.bodies.forEach((b, i) => {
    const node = nodes[i];
    const selected = b.id === focusId;
    const hovered = b.id === hoverId;
    const r = b.radius;

    withAlpha(ctx, isLit(i) ? 1 : 0.18, () => {
      if (selected || hovered) {
        ctx.strokeStyle = selected ? theme.accent : theme.ink;
        ctx.lineWidth = px * 1.2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r + 5 * px, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
      if (node.vendor === 'cisco') {
        ctx.fillStyle = selected ? theme.accent : theme.ink;
        ctx.fill();
      } else {
        ctx.fillStyle = theme.paper;
        ctx.fill();
        ctx.strokeStyle = selected ? theme.accent : theme.ink;
        ctx.lineWidth = 1.6 * px;
        ctx.stroke();
      }
      if (node.status === 'check') {
        // A small tick through unverified bodies, like a proof mark.
        ctx.strokeStyle = node.vendor === 'cisco' ? theme.paper : theme.ink;
        ctx.lineWidth = px * 1.2;
        ctx.beginPath();
        ctx.moveTo(b.x - r * 0.45, b.y);
        ctx.lineTo(b.x + r * 0.45, b.y);
        ctx.stroke();
      }
    });
  });

  // Labels, placed greedily by priority: the selection, then its partners, then heavier bodies. A
  // label that would land on one already placed is skipped, so the plate never turns to soup.
  const priority = (i) => {
    const id = world.bodies[i].id;
    if (id === focusId) return 4;
    if (id === hoverId) return 3.5;
    if (partners && partners.has(i)) return 3;
    return nodes[i].mass;
  };
  const order = world.bodies.map((_, i) => i).sort((x, y) => priority(y) - priority(x));
  const placed = [];
  for (const i of order) {
    const b = world.bodies[i];
    const node = nodes[i];
    const lit = isLit(i);
    const forced = priority(i) >= 3.5;
    if (!lit || !(forced || (partners && partners.has(i)) || s > 0.55)) continue;
    const selected = b.id === focusId;
    const dist = Math.hypot(b.x, b.y) || 1;
    const ox = b.x / dist;
    const oy = b.y / dist;
    ctx.font = `${(node.mass === 3 ? 11.5 : 10.5) * px}px ${MONO}`;
    const w = ctx.measureText(node.name).width;
    // Labels run outward from the centre, but flip to the other side of the body rather than run
    // under the detail panel or off the edge of the plate.
    const screenX = (x) => width / 2 + view.x + x * s;
    let right = ox >= -0.15;
    if (right && screenX(b.x + w + b.radius + 7 * px) > state.freeRight) right = false;
    else if (!right && screenX(b.x - w - b.radius - 7 * px) < 8) right = true;
    const lx = b.x + (right ? 1 : -1) * (b.radius + 7 * px);
    const h = 13 * px;
    // Try the natural spot, then nudge up and down in label-height steps until one is clear.
    let ly = b.y + oy * (b.radius + 7 * px);
    let box = null;
    for (const step of [0, 1, -1, 2, -2, 3, -3]) {
      const y = b.y + oy * (b.radius + 7 * px) + step * h;
      const cand = { x0: right ? lx : lx - w, x1: right ? lx + w : lx, y0: y - h / 2, y1: y + h / 2 };
      if (!placed.some((q) => cand.x0 < q.x1 && cand.x1 > q.x0 && cand.y0 < q.y1 && cand.y1 > q.y0)) {
        box = cand;
        ly = y;
        break;
      }
    }
    // Partners of the selection are always named; anything else yields.
    if (!box && !forced && !(partners && partners.has(i))) continue;
    if (!box) box = { x0: right ? lx : lx - w, x1: right ? lx + w : lx, y0: ly - h / 2, y1: ly + h / 2 };
    placed.push(box);
    ctx.textAlign = right ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4 * px;
    ctx.strokeStyle = theme.paper;
    withAlpha(ctx, 0.9, () => ctx.strokeText(node.name, lx, ly));
    ctx.fillStyle = selected ? theme.accent : theme.ink;
    ctx.fillText(node.name, lx, ly);
  }

  ctx.restore();

  // Title cartouche, bottom-left of the plate.
  ctx.fillStyle = theme.muted;
  ctx.font = `italic 13px ${SERIF}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${layers.length} orbits · ${nodes.length} bodies · ${links.length} integrations`, width - 18, height - 16);
}
