import test from 'node:test';
import assert from 'node:assert/strict';
import { LINK_STYLES, styleOf, stylesPresent } from '../src/map/linkstyle.js';
import { LINK_TYPES, LINKS } from '../src/data/stack.js';

test('every relationship type has exactly one line style, so no line is ever drawn unexplained', () => {
  for (const t of LINK_TYPES) {
    const owners = LINK_STYLES.filter((s) => s.types.includes(t.id));
    assert.equal(owners.length, 1, `${t.id} is in ${owners.length} styles`);
  }
  for (const s of LINK_STYLES) for (const t of s.types) assert.ok(LINK_TYPES.some((x) => x.id === t), `style ${s.id} names unknown type ${t}`);
});

test('styles are visibly distinct: no two share a pattern, weight and end marker', () => {
  const sig = LINK_STYLES.map((s) => [s.dash, s.width, s.ring].join('|'));
  assert.equal(new Set(sig).size, LINK_STYLES.length);
  assert.ok(LINK_STYLES.length <= 6, 'more than six patterns is more than a reader can tell apart');
});

test('every style has words for the key', () => {
  for (const s of LINK_STYLES) assert.ok(s.label.length > 3 && s.detail.length > 10, s.id);
});

test('only structure has a ring and no arrowhead', () => {
  assert.deepEqual(LINK_STYLES.filter((s) => s.ring).map((s) => s.id), ['structure']);
});

test('styleOf finds the style for any link on the map', () => {
  for (const l of LINKS) assert.ok(styleOf(l.type), `${l.a} - ${l.b} (${l.type})`);
});

test('stylesPresent lists only the styles in view, in the key\'s fixed order', () => {
  const fake = [{ type: 'secures' }, { type: 'composes' }, { type: 'feeds' }, { type: 'observes' }];
  assert.deepEqual(stylesPresent(fake).map((s) => s.id), ['structure', 'protection', 'data']);
  assert.deepEqual(stylesPresent([]), []);
});
