// How relationships are drawn. One place, so the lines on the map, the key on the map and the samples
// in the panel can never disagree.
//
// Eight relationship types collapse into six visual styles, because some pairs mean the same kind of
// thing to the eye: "contains" and "includes the model" are both structure, and "observes" and
// "feeds data to" are both a flow of data or telemetry. The wording from LINK_TYPES is still what the
// panel says in words; the style only says what family the line belongs to.
//
// Direction: every line starts at the first product of the link and ends at the second. The arrowhead
// is at the end, so it points at what is run on, carried for, managed, secured or fed. Structure has
// no arrowhead: a ring marks the container end instead.

export const LINK_STYLES = [
  { id: 'structure', types: ['composes', 'models'], label: 'Contains', detail: 'A ring marks the container', dash: undefined, width: 2.4, cap: 'butt', ring: true },
  { id: 'dependency', types: ['runs'], label: 'Runs on', detail: 'Arrow points at what it runs on', dash: '0.1 5', width: 3, cap: 'round', ring: false },
  { id: 'traffic', types: ['network'], label: 'Carries traffic for', detail: 'Arrow points at what it carries traffic for', dash: '13 5', width: 2.4, cap: 'butt', ring: false },
  { id: 'control', types: ['manages'], label: 'Manages', detail: 'Arrow points at what is managed', dash: '5 4', width: 2.4, cap: 'butt', ring: false },
  { id: 'protection', types: ['secures'], label: 'Secures', detail: 'Arrow points at what is secured', dash: '14 4 2 4', width: 2.4, cap: 'butt', ring: false },
  { id: 'data', types: ['observes', 'feeds'], label: 'Observes, or feeds data to', detail: 'Arrow points at what is observed, or at the receiver', dash: '0.1 10', width: 4.6, cap: 'round', ring: false },
];

const byType = new Map(LINK_STYLES.flatMap((s) => s.types.map((t) => [t, s])));

export const styleOf = (type) => byType.get(type);

// The styles present among some links, in the key's fixed order.
export function stylesPresent(links) {
  const present = new Set(links.map((l) => styleOf(l.type).id));
  return LINK_STYLES.filter((s) => present.has(s.id));
}
