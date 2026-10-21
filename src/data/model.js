// Lookups over the stack data, shared by the views and the tests.
import { LAYERS, NODES, LINKS, LINK_TYPES } from './stack.js';

export const nodeById = new Map(NODES.map((n) => [n.id, n]));
export const layerById = new Map(LAYERS.map((l) => [l.id, l]));
export const typeById = new Map(LINK_TYPES.map((t) => [t.id, t]));

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

// The address bar drives navigation: '#/layer/network', '#/node/ai-defense', or empty for the stack.
export function parseRoute(hash) {
  const [, kind, id] = hash.replace(/^#/, '').split('/');
  if (kind === 'layer' && layerById.has(id)) return { view: 'layer', id };
  if (kind === 'node' && nodeById.has(id)) return { view: 'node', id };
  return { view: 'stack' };
}

export const hrefLayer = (id) => `#/layer/${id}`;
export const hrefNode = (id) => `#/node/${id}`;
