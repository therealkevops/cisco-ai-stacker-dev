// Routing for the lines drawn over the stack. No DOM in here, so it can be tested under Node.
//
// Input is the on-screen rectangle of each chip ({ x, y, w, h }, relative to the frame) and the
// links to draw. Each link leaves its `a` chip and arrives at its `b` chip, so an arrowhead at the
// end of the path always points the way the relationship runs. Chips in different rows connect
// bottom-to-top; chips in the same row connect side-to-side. Where several lines meet one side of
// a chip they are spread along it, ordered by where they are going so they do not cross there.

const SAME_ROW = 20; // vertical distance under which two chips count as being in one row

const center = (r) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

function sidesFor(ra, rb) {
  const ca = center(ra);
  const cb = center(rb);
  if (Math.abs(cb.y - ca.y) > SAME_ROW) {
    return cb.y > ca.y ? ['bottom', 'top'] : ['top', 'bottom'];
  }
  return cb.x > ca.x ? ['right', 'left'] : ['left', 'right'];
}

export function anchorOn(r, side, index, count) {
  const t = (index + 1) / (count + 1);
  if (side === 'top') return { x: r.x + r.w * t, y: r.y };
  if (side === 'bottom') return { x: r.x + r.w * t, y: r.y + r.h };
  if (side === 'left') return { x: r.x, y: r.y + r.h * t };
  return { x: r.x + r.w, y: r.y + r.h * t };
}

const lead = (side, from, to) => {
  const vertical = side === 'top' || side === 'bottom';
  const gap = vertical ? Math.abs(to.y - from.y) : Math.abs(to.x - from.x);
  const k = Math.max(26, gap * 0.45);
  if (side === 'bottom') return { x: from.x, y: from.y + k };
  if (side === 'top') return { x: from.x, y: from.y - k };
  if (side === 'right') return { x: from.x + k, y: from.y };
  return { x: from.x - k, y: from.y };
};

const f = (n) => Math.round(n * 10) / 10;

export function routeEdges(links, rects) {
  const drawable = links.filter((l) => rects.get(l.a) && rects.get(l.b));
  const plans = drawable.map((link) => {
    const [sa, sb] = sidesFor(rects.get(link.a), rects.get(link.b));
    return { link, sa, sb };
  });

  // Collect the lines that share a side of a chip, ordered by where the other end is.
  const slots = new Map();
  const add = (chip, side, other, plan, end) => {
    const key = chip + '|' + side;
    if (!slots.has(key)) slots.set(key, []);
    slots.get(key).push({ plan, end, other });
  };
  for (const p of plans) {
    add(p.link.a, p.sa, center(rects.get(p.link.b)), p, 'a');
    add(p.link.b, p.sb, center(rects.get(p.link.a)), p, 'b');
  }
  for (const [key, list] of slots) {
    const side = key.split('|')[1];
    const vertical = side === 'top' || side === 'bottom';
    list.sort((u, v) => (vertical ? u.other.x - v.other.x : u.other.y - v.other.y));
    list.forEach((entry, i) => {
      entry.plan[entry.end] = anchorOn(rects.get(entry.plan.link[entry.end]), entry.plan['s' + entry.end], i, list.length);
    });
  }

  return plans.map((p) => {
    const c1 = lead(p.sa, p.a, p.b);
    const c2 = lead(p.sb, p.b, p.a);
    const d = `M${f(p.a.x)},${f(p.a.y)} C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p.b.x)},${f(p.b.y)}`;
    return { link: p.link, d, from: p.a, to: p.b };
  });
}
