// Lookups and derived facts over the stack data, shared by the map, the panel and the tests.
//
// The data comes in lenses (Cisco, NVIDIA). Each lens is a self-contained dataset of the same shape,
// and buildModel turns one into the lookups and logic below. The names exported at the bottom are
// the Cisco lens, which is what the existing code and tests use; the others are reached by lens id.
import { PRIMITIVES as C_PRIMITIVES, NODES as C_NODES, LINKS as C_LINKS, LINK_TYPES as C_LINK_TYPES } from './stack.js';
import { USE_CASES as C_USE_CASES } from './usecases.js';
import { PRODUCT_DETAILS as C_DETAILS, PRIMITIVE_DETAILS as C_PRIM_DETAILS } from './details.js';
import { NVIDIA } from './nvidia.js';

const CISCO = {
  id: 'cisco', name: 'Cisco', focus: 'cisco', title: 'The Cisco AI Stack', primitives: C_PRIMITIVES, nodes: C_NODES, links: C_LINKS, linkTypes: C_LINK_TYPES, cases: C_USE_CASES,
  details: C_DETAILS, primitiveDetails: C_PRIM_DETAILS,
};

export function buildModel(data) {
  const { primitives: PRIMITIVES, nodes: NODES, links: LINKS, linkTypes: LINK_TYPES, cases: USE_CASES } = data;
  const PRODUCT_DETAILS = data.details;
  const PRIMITIVE_DETAILS = data.primitiveDetails;
  const prefix = data.id === 'cisco' ? '#' : `#/${data.id}`;

const nodeById = new Map(NODES.map((n) => [n.id, n]));
  const primitiveById = new Map(PRIMITIVES.map((p) => [p.id, p]));
  const typeById = new Map(LINK_TYPES.map((t) => [t.id, t]));
  const caseById = new Map(USE_CASES.map((u) => [u.id, u]));
  
  // Fuller descriptions and features, where written. Designs have none: their detail is the bill of materials.
  const detailsOf = (id) => PRODUCT_DETAILS[id] || null;
  const primitiveDetailsOf = (id) => PRIMITIVE_DETAILS[id] || null;
  
  const products = NODES.filter((n) => n.kind !== 'design');
  const designs = NODES.filter((n) => n.kind === 'design');
  const productsIn = (primitiveId) => products.filter((n) => n.primitive === primitiveId);
  
  // How a link reads from one end: "Contains" from the container, "Is part of" from the part.
  const phrase = (link, subjectId) => {
    const t = typeById.get(link.type);
    return link.a === subjectId ? t.from : t.to;
  };
  
  // Every integration touching a node, with the node at the other end and how it reads from here.
  function linksOf(nodeId) {
    return LINKS.filter((l) => l.a === nodeId || l.b === nodeId).map((l) => ({
      ...l,
      other: nodeById.get(l.a === nodeId ? l.b : l.a),
      phrase: phrase(l, nodeId),
    }));
  }
  
  // Integrations between two products, which are the ones the map can draw (designs have no hex).
  const productLinks = LINKS.filter((l) => !nodeById.get(l.a).kind && !nodeById.get(l.b).kind);
  const linksBetweenProducts = (nodeId) => productLinks.filter((l) => l.a === nodeId || l.b === nodeId);
  
  // Everything a validated design includes: follow "contains" links downward from it, so the Secure AI
  // Factory brings in the AI PODs and, through them, the servers, switches and GPUs.
  function membersOf(designId) {
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
    // Including a model means using its family: a design built on the 9364E-SG2 is a Nexus 9000 design.
    // The reverse does not hold, so the family alone never pulls in a particular model.
    for (const l of LINKS) if (l.type === 'models' && found.has(l.b)) found.add(l.a);
    return found;
  }
  
  // For a design: how many of each primitive's products it includes. This is the portfolio-against-
  // primitives view, and the gaps are the primitives where `have` is 0.
  function coverage(designId) {
    const members = membersOf(designId);
    return PRIMITIVES.map((p) => {
      const all = productsIn(p.id);
      return { primitive: p, have: all.filter((n) => members.has(n.id)).length, total: all.length };
    });
  }
  
  // Which designs include a product.
  const designsIncluding = (productId) => designs.filter((d) => membersOf(d.id).has(productId));
  
  // How many integrations join each pair of primitives, from one primitive's point of view.
  function primitiveLinks(primitiveId) {
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
  function assess(useCaseId, designId) {
    const members = membersOf(designId);
    return caseById.get(useCaseId).needs.map((need) => {
      const metBy = need.products.filter((p) => members.has(p));
      return { need, metBy, met: metBy.length > 0 };
    });
  }
  
  // How many required and recommended needs an assessment meets.
  function summarise(assessed) {
    const count = (role) => {
      const rows = assessed.filter((a) => a.need.role === role);
      return { met: rows.filter((r) => r.met).length, total: rows.length };
    };
    return { required: count('required'), recommended: count('recommended') };
  }
  
  // Every product a use case names, whichever role.
  const caseProducts = (useCaseId) => [...new Set(caseById.get(useCaseId).needs.flatMap((n) => n.products))];
  
  // The use cases that name a product, with the role it plays in each.
  function casesNeeding(productId) {
    return USE_CASES.flatMap((u) => {
      const need = u.needs.find((n) => n.products.includes(productId));
      return need ? [{ useCase: u, role: need.role }] : [];
    });
  }
  
  // The use cases a design is a validated way to deliver.
  const casesDelivered = (designId) => USE_CASES.filter((u) => u.designs.includes(designId));
  // Products in each primitive, most connected first (Cisco ahead of partners on a tie), which is the
  // order they are placed on the map: the busiest sits right next to its primitive.
  function layoutOrder() {
    const degree = (id) => LINKS.filter((l) => l.a === id || l.b === id).length;
    return new Map(
      PRIMITIVES.map((p) => [
        p.id,
        productsIn(p.id)
          .sort((x, y) => degree(y.id) - degree(x.id) || (x.vendor === data.focus ? -1 : 1) - (y.vendor === data.focus ? -1 : 1))
          .map((n) => n.id),
      ]),
    );
  }

  // The address of each kind of page, within this lens.
  const href = {
    product: (id) => `${prefix}/product/${id}`,
    design: (id) => `${prefix}/design/${id}`,
    primitive: (id) => `${prefix}/primitive/${id}`,
    usecase: (id, design) => (design ? `${prefix}/usecase/${id}/${design}` : `${prefix}/usecase/${id}`),
    home: data.id === 'cisco' ? '#/' : prefix + '/',
  };

  // Which page a route's pieces name, if this lens has it.
  function resolve(kind, id, extra) {
    if (kind === 'product' && nodeById.has(id) && !nodeById.get(id).kind) return { kind: 'product', id };
    if (kind === 'design' && nodeById.has(id) && nodeById.get(id).kind === 'design') return { kind: 'design', id };
    if (kind === 'primitive' && primitiveById.has(id)) return { kind: 'primitive', id };
    if (kind === 'usecase' && caseById.has(id)) {
      const design = extra && nodeById.get(extra)?.kind === 'design' ? extra : null;
      return { kind: 'usecase', id, design };
    }
    return { kind: null };
  }


  return { data, primitives: PRIMITIVES, nodes: NODES, links: LINKS, linkTypes: LINK_TYPES, cases: USE_CASES,
    nodeById, primitiveById, typeById, caseById, detailsOf, primitiveDetailsOf, products, designs, productsIn, phrase, linksOf, productLinks, linksBetweenProducts, membersOf, coverage, designsIncluding, primitiveLinks, assess, summarise, caseProducts, casesNeeding, casesDelivered, layoutOrder, href, resolve };
}

export const MODELS = { cisco: buildModel(CISCO), nvidia: buildModel(NVIDIA) };
export const LENS_IDS = Object.keys(MODELS);

// The Cisco lens, under the names the rest of the code uses.
export const {
  nodeById, primitiveById, typeById, caseById, detailsOf, primitiveDetailsOf, products, designs, productsIn, phrase, linksOf, productLinks, linksBetweenProducts, membersOf, coverage, designsIncluding, primitiveLinks, assess, summarise, caseProducts, casesNeeding, casesDelivered, layoutOrder, href,
} = MODELS.cisco;

// The address bar drives what is selected: '#/' nothing, '#/product/<id>', '#/design/<id>' (the
// portfolio lens), '#/primitive/<id>', or '#/usecase/<id>' with an optional design to check it
// against: '#/usecase/<id>/<design>'. A leading lens id ('#/nvidia/...') switches the focus.
export function parseRoute(hash) {
  const parts = hash.replace(/^#/, '').split('/').slice(1);
  const lens = LENS_IDS.includes(parts[0]) ? parts.shift() : 'cisco';
  const [kind, id, extra] = parts;
  return { lens, ...MODELS[lens].resolve(kind, id, extra) };
}
