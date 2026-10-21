import React, { useEffect, useRef } from 'react';
import { LAYERS, NODES, LINKS } from '../data/stack.js';
import { createWorld, settle, step, DT, WORLD_R } from '../sim/physics.js';
import { drawScene, hitTest, readTheme, screenToWorld, fitScale, FIT_X } from '../render/draw.js';

const CLICK_SLOP = 4;
const PANEL_W = 340;

// The canvas, the physics loop and the pointer handling. Everything that changes every frame lives
// in refs; React state only carries the things the rest of the page reads.
export default function Chart({ selectedId, onSelect, hiddenTypes, matchIds, gravity, resetKey }) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const viewRef = useRef({ x: 0, y: 0, k: 1 });
  const propsRef = useRef({});
  const hoverRef = useRef(null);
  const panelRef = useRef({ t: 0, shift: 0, f: 1 });

  // The animation loop reads the latest props from this ref instead of restarting on every change.
  useEffect(() => {
    propsRef.current = { selectedId, hiddenTypes, matchIds, gravity, onSelect };
  });

  useEffect(() => {
    const world = createWorld(LAYERS, NODES, LINKS);
    settle(world);
    worldRef.current = world;
    viewRef.current = { x: 0, y: 0, k: 1 };
  }, [resetKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let theme = readTheme();
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let drag = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => (theme = readTheme());
    scheme.addEventListener('change', onScheme);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const world = worldRef.current;
      if (!world || !width) return;
      const p = propsRef.current;
      acc += Math.min(now - last, 100) / 1000;
      last = now;
      const focusId = p.selectedId || null;
      const focus = focusId ? world.index.get(focusId) : -1;
      while (acc >= DT) {
        step(world, { gravity: p.gravity, focus });
        acc -= DT;
      }
      // While the detail panel is open, ease the chart into the space left of it: slide it over and
      // shrink it just enough to fit, so the selected body is never hidden behind the panel.
      const panel = panelRef.current;
      const open = focusId && window.innerWidth > 900 ? 1 : 0;
      panel.t += (open - panel.t) * 0.12;
      const fit = Math.min(1, (width - PANEL_W - 40) / (2 * WORLD_R * FIT_X * fitScale(width, height)));
      const f = 1 - (1 - fit) * panel.t;
      const shift = (-(PANEL_W + 20) / 2) * panel.t;
      const v = viewRef.current;
      v.k *= f / panel.f;
      v.x += shift - panel.shift;
      panel.f = f;
      panel.shift = shift;
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScene(ctx, {
        world,
        layers: LAYERS,
        nodes: NODES,
        links: LINKS,
        view: viewRef.current,
        width,
        height,
        theme,
        state: {
          focusId: focusId || hoverRef.current,
          hoverId: hoverRef.current,
          matchIds: p.matchIds,
          hiddenTypes: p.hiddenTypes,
          freeRight: open ? width - PANEL_W - 30 : width - 8,
        },
      });
    };
    raf = requestAnimationFrame(frame);

    const local = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e) => {
      const { x, y } = local(e);
      const hit = hitTest(worldRef.current, viewRef.current, width, height, x, y);
      drag = { id: e.pointerId, body: hit, sx: x, sy: y, moved: 0, vx: viewRef.current.x, vy: viewRef.current.y };
      if (hit) hit.pinned = true;
      canvas.setPointerCapture(e.pointerId);
    };

    const move = (e) => {
      const { x, y } = local(e);
      if (!drag) {
        const hit = hitTest(worldRef.current, viewRef.current, width, height, x, y);
        hoverRef.current = hit ? hit.id : null;
        canvas.style.cursor = hit ? 'grab' : 'default';
        return;
      }
      drag.moved = Math.max(drag.moved, Math.hypot(x - drag.sx, y - drag.sy));
      if (drag.body) {
        const w = screenToWorld(viewRef.current, width, height, x, y);
        drag.body.x = w.x;
        drag.body.y = w.y;
        canvas.style.cursor = 'grabbing';
      } else {
        viewRef.current.x = drag.vx + (x - drag.sx);
        viewRef.current.y = drag.vy + (y - drag.sy);
      }
    };

    const up = (e) => {
      if (!drag) return;
      if (drag.body) drag.body.pinned = false;
      if (drag.moved < CLICK_SLOP) propsRef.current.onSelect(drag.body ? drag.body.id : null);
      drag = null;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    const leave = () => {
      if (!drag) hoverRef.current = null;
    };

    const wheel = (e) => {
      e.preventDefault();
      const { x, y } = local(e);
      const v = viewRef.current;
      const k = Math.min(3, Math.max(0.6, v.k * Math.exp(-e.deltaY * 0.0015)));
      // Zoom about the cursor: keep the world point under it fixed.
      const before = screenToWorld(v, width, height, x, y);
      v.k = k;
      const s = fitScale(width, height) * k;
      v.x = x - width / 2 - before.x * s;
      v.y = y - height / 2 - before.y * s;
    };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('wheel', wheel, { passive: false });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scheme.removeEventListener('change', onScheme);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('wheel', wheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="chart"
      role="img"
      aria-label="Orbital chart of the Cisco AI stack. Use the list on the left to browse the same bodies with a keyboard."
    />
  );
}
