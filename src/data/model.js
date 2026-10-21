// Lookups and derived facts over the stack data, shared by the map, the panel and the tests.
import { PRIMITIVES, NODES, LINKS, LINK_TYPES } from './stack.js';
import { USE_CASES } from './usecases.js';

export const nodeById = new Map(NODES.map((n) => [n.id, n]));
export const primitiveById = new Map(PRIMITIVES.map((p) => [p.id, p]));
export const typeById = new Map(LINK_TYPES.map((t) => [t.id, t]));
export const caseById = new Map(USE_CASES.map((u) => [u.id, u]));

export const products = NODES.filter((n) => n.kind !== 'design');
export const designs = NODES.filter((n) => n.kind === 'design');
export const productsIn = (primitiveId) => products.filter((n) => n.primitive === primitiveId);

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

// Integrations between two products, which are the ones the map can draw (designs have no hex).
export const productLinks = LINKS.filter((l) => !nodeById.get(l.a).kind && !nodeById.get(l.b).kind);
export const linksBetweenProducts = (nodeId) => productLinks.filter((l) => l.a === nodeId || l.b === nodeId);

// Everything a validated design includes: follow "contains" links downward from it, so the Secure AI
// Factory brings in the AI PODs and, through them, the servers, switches and GPUs.
export function membersOf(designId) {
  const found = new Set();
  const queue = [designId];
  while (queue.length) {
    const id = queue.shift();
    for (const l of LINKS) {
      if (l.type === 'composes' && l.a === id && !found.has(l.b)) {
        found.add(l.b);
        queue.push(l.b);
      }
    }
  }
  return found;
}

// For a design: how many of each primitive's products it includes. This is the portfolio-against-
// primitives view, and the gaps are the primitives where `have` is 0.
export function coverage(designId) {
  const members = membersOf(designId);
  return PRIMITIVES.map((p) => {
    const all = productsIn(p.id);
    return { primitive: p, have: all.filter((n) => members.has(n.id)).length, total: all.length };
  });
}

// Which designs include a product.
export const designsIncluding = (productId) => designs.filter((d) => membersOf(d.id).has(productId));

// How many integrations join each pair of primitives, from one primitive's point of view.
export function primitiveLinks(primitiveId) {
  const counts = new Map();
  for (const l of productLinks) {
    const a = nodeById.get(l.a).primitive;
    const b = nodeById.get(l.b).primitive;
    if (a === b || (a !== primitiveId && b !== primitiveId)) continue;
    const other = a === primitiveId ? b : a;
    counts.set(other, (counts.get(other) || 0) + 1);
  }
  return PRIMITIVES.filter((p) => counts.has(p.id))
    .map((p) => ({ primitive: p, count: counts.get(p.id) }))
    .sort((x, y) => y.count - x.count);
}

// Check a use case against a design. Each need is met if the design includes any one of its products.
export function assess(useCaseId, designId) {
  const members = membersOf(designId);
  return caseById.get(useCaseId).needs.map((need) => {
    const metBy = need.products.filter((p) => members.has(p));
    return { need, metBy, met: metBy.length > 0 };
  });
}

// How many required and recommended needs an assessment meets.
export function summarise(assessed) {
  const count = (role) => {
    const rows = assessed.filter((a) => a.need.role === role);
    return { met: rows.filter((r) => r.met).length, total: rows.length };
  };
  return { required: count('required'), recommended: count('recommended') };
}

// Every product a use case names, whichever role.
export const caseProducts = (useCaseId) => [...new Set(caseById.get(useCaseId).needs.flatMap((n) => n.products))];

// The use cases that name a product, with the role it plays in each.
export function casesNeeding(productId) {
  return USE_CASES.flatMap((u) => {
    const need = u.needs.find((n) => n.products.includes(productId));
    return need ? [{ useCase: u, role: need.role }] : [];
  });
}

// The use cases a design is a validated way to deliver.
export const casesDelivered = (designId) => USE_CASES.filter((u) => u.designs.includes(designId));

// The address bar drives what is selected: '#/' nothing, '#/product/<id>', '#/design/<id>' (the
// portfolio lens), '#/primitive/<id>', or '#/usecase/<id>' with an optional design to check it
// against: '#/usecase/<id>/<design>'.
export function parseRoute(hash) {
  const [, kind, id, extra] = hash.replace(/^#/, '').split('/');
  if (kind === 'product' && nodeById.has(id) && !nodeById.get(id).kind) return { kind: 'product', id };
  if (kind === 'design' && nodeById.has(id) && nodeById.get(id).kind === 'design') return { kind: 'design', id };
  if (kind === 'primitive' && primitiveById.has(id)) return { kind: 'primitive', id };
  if (kind === 'usecase' && caseById.has(id)) {
    const design = extra && nodeById.get(extra)?.kind === 'design' ? extra : null;
    return { kind: 'usecase', id, design };
  }
  return { kind: null };
}

export const href = {
  product: (id) => `#/product/${id}`,
  design: (id) => `#/design/${id}`,
  primitive: (id) => `#/primitive/${id}`,
  usecase: (id, design) => (design ? `#/usecase/${id}/${design}` : `#/usecase/${id}`),
  home: '#/',
};

// Products in each primitive, most connected first (Cisco ahead of partners on a tie), which is the
// order they are placed on the map: the busiest sits right next to its primitive.
export function layoutOrder() {
  const degree = (id) => LINKS.filter((l) => l.a === id || l.b === id).length;
  return new Map(
    PRIMITIVES.map((p) => [
      p.id,
      productsIn(p.id)
        .sort((x, y) => degree(y.id) - degree(x.id) || (x.vendor === 'cisco' ? -1 : 1) - (y.vendor === 'cisco' ? -1 : 1))
        .map((n) => n.id),
    ]),
  );
}
