// Lookups over the stack data, shared by the views and the tests.
import { LAYERS, NODES, LINKS, LINK_TYPES } from './stack.js';
import { JOURNEYS } from './journeys.js';

export const nodeById = new Map(NODES.map((n) => [n.id, n]));
export const layerById = new Map(LAYERS.map((l) => [l.id, l]));
export const typeById = new Map(LINK_TYPES.map((t) => [t.id, t]));
export const journeyById = new Map(JOURNEYS.map((j) => [j.id, j]));

export const frameLayer = LAYERS.find((l) => l.group === 'frame');
export const stackLayers = LAYERS.filter((l) => l.group === 'stack');
export const crossLayers = LAYERS.filter((l) => l.group === 'cross');

export const nodesIn = (layerId) => NODES.filter((n) => n.layer === layerId);

// How a link reads from one end: "Contains" from the container, "Is part of" from the part.
export const phrase = (link, subjectId) => {
  const t = typeById.get(link.type);
  return link.a === subjectId ? t.from : t.to;
};

// Every integration touching a node, with the node at the other end and how it reads from here.
export function linksOf(nodeId) {
  return LINKS.filter((l) => l.a === nodeId || l.b === nodeId).map((l) => ({
    ...l,
    other: nodeById.get(l.a === nodeId ? l.b : l.a),
    phrase: phrase(l, nodeId),
  }));
}

// Integrations that leave a layer, grouped by the layer they reach. Each entry keeps the end that
// is inside this layer (`from`) and the end that is outside it (`to`).
export function layerConnections(layerId) {
  const groups = new Map();
  for (const l of LINKS) {
    const a = nodeById.get(l.a);
    const b = nodeById.get(l.b);
    if ((a.layer === layerId) === (b.layer === layerId)) continue;
    const [from, to] = a.layer === layerId ? [a, b] : [b, a];
    if (!groups.has(to.layer)) groups.set(to.layer, []);
    groups.get(to.layer).push({ from, to, type: l.type, phrase: phrase(l, from.id), label: l.label, status: l.status });
  }
  return LAYERS.filter((x) => groups.has(x.id)).map((x) => ({ layer: x, items: groups.get(x.id) }));
}

// Links to draw when one product is picked: everything that touches it.
export const edgesOf = (nodeId) => LINKS.filter((l) => l.a === nodeId || l.b === nodeId);

// Links to draw for a journey step: those joining two of the step's products.
export const edgesAmong = (ids) => {
  const set = new Set(ids);
  return LINKS.filter((l) => set.has(l.a) && set.has(l.b));
};

// The address bar drives navigation. On the stack page: '#/' is the plain stack, '#/pick/<product>'
// lights up one product's connections, '#/journey/<id>/<step>' is a guided step (steps count from 1).
// '#/layer/<id>' and '#/node/<id>' are the detail pages.
export function parseRoute(hash) {
  const [, kind, id, step] = hash.replace(/^#/, '').split('/');
  if (kind === 'layer' && layerById.has(id)) return { view: 'layer', id };
  if (kind === 'node' && nodeById.has(id)) return { view: 'node', id };
  if (kind === 'pick' && nodeById.has(id)) return { view: 'stack', pick: id };
  if (kind === 'journey' && journeyById.has(id)) {
    const last = journeyById.get(id).steps.length;
    const n = Math.min(last, Math.max(1, parseInt(step, 10) || 1));
    return { view: 'stack', journey: { id, step: n } };
  }
  return { view: 'stack' };
}

export const hrefLayer = (id) => `#/layer/${id}`;
export const hrefNode = (id) => `#/node/${id}`;
export const hrefPick = (id) => `#/pick/${id}`;
export const hrefJourney = (id, step = 1) => `#/journey/${id}/${step}`;
