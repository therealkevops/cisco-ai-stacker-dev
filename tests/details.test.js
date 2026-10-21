import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCT_DETAILS, PRIMITIVE_DETAILS } from '../src/data/details.js';
import { PRIMITIVES, NODES } from '../src/data/stack.js';
import { products, detailsOf, primitiveDetailsOf } from '../src/data/model.js';

test('every product has a fuller description, and nothing else does', () => {
  assert.deepEqual(products.filter((n) => !PRODUCT_DETAILS[n.id]).map((n) => n.id), [], 'products with no details');
  const ids = new Set(NODES.filter((n) => !n.kind).map((n) => n.id));
  assert.deepEqual(Object.keys(PRODUCT_DETAILS).filter((id) => !ids.has(id)), [], 'details for something that is not a product');
});

test('each description says more than the short blurb, in a sensible length', () => {
  for (const n of products) {
    const d = detailsOf(n.id);
    assert.ok(d.about.length >= 120 && d.about.length <= 420, `${n.id}: about is ${d.about.length} characters`);
    assert.ok(d.about.length > n.blurb.length * 0.9, `${n.id}: the long description should not be shorter than the blurb`);
  }
});

test('each product lists three to five named features, none empty or repeated', () => {
  for (const n of products) {
    const { features } = detailsOf(n.id);
    assert.ok(features.length >= 3 && features.length <= 5, `${n.id}: ${features.length} features`);
    assert.equal(new Set(features.map((f) => f.name)).size, features.length, `${n.id}: repeated feature name`);
    for (const f of features) {
      assert.ok(f.name.length >= 4 && f.name.length <= 60, `${n.id}: feature name "${f.name}"`);
      assert.ok(f.text.length >= 25 && f.text.length <= 260, `${n.id}/${f.name}: text is ${f.text.length} characters`);
    }
  }
});

test('every product names its sources, as unique https links with labels', () => {
  for (const n of products) {
    const { refs } = detailsOf(n.id);
    assert.ok(refs.length >= 1, `${n.id}: no sources`);
    assert.equal(new Set(refs.map(([, url]) => url)).size, refs.length, `${n.id}: duplicate source`);
    for (const [label, url] of refs) {
      assert.ok(label.length > 3, `${n.id}: source label`);
      assert.match(url, /^https:\/\/[^\s]+$/, `${n.id}: ${url}`);
    }
  }
});

test('anything not confirmed carries a "check" note saying why', () => {
  for (const n of products.filter((x) => x.status === 'check')) {
    assert.ok(detailsOf(n.id).caveat, `${n.id} is unverified but its description has no caveat`);
  }
  for (const n of products) {
    const c = detailsOf(n.id).caveat;
    if (c) assert.ok(c.length >= 40, `${n.id}: caveat too thin to be useful`);
  }
});

test('roadmap and early-access items are flagged as such, not stated as available', () => {
  assert.match(detailsOf('nutanix').caveat, /early access|roadmap/i);
  assert.match(detailsOf('splunk-obs').caveat, /alpha|availability/i);
  assert.match(detailsOf('hybrid-mesh-fw').caveat, /early access/i);
  assert.match(detailsOf('ai-canvas').caveat, /availability|confirm/i);
});

test('where sources disagree, the description says so rather than picking one', () => {
  assert.match(detailsOf('c885a').caveat, /different dates|differ/i);
  assert.match(detailsOf('c845a').caveat, /differ/i);
  assert.match(detailsOf('silicon-one').caveat, /unconfirmed|G200/);
  assert.match(detailsOf('n9364e').caveat, /G200|Silicon One/);
});

test('a figure quoted from a vendor is attributed to the vendor', () => {
  for (const id of ['spectrum-x', 'nvidia-gpu']) assert.match(detailsOf(id).caveat, /vendor|NVIDIA (states|claims)|per NVIDIA/i, id);
});

test('every primitive has background, and says what to look for', () => {
  assert.deepEqual(PRIMITIVES.filter((p) => !PRIMITIVE_DETAILS[p.id]).map((p) => p.id), []);
  for (const p of PRIMITIVES) {
    const d = primitiveDetailsOf(p.id);
    assert.ok(d.why.length >= 150 && d.why.length <= 600, `${p.id}: why is ${d.why.length} characters`);
    assert.equal(d.lookFor.length, 4, p.id);
    assert.equal(new Set(d.lookFor.map((f) => f.name)).size, 4, p.id);
    for (const f of d.lookFor) assert.ok(f.text.length >= 25 && f.text.length <= 220, `${p.id}/${f.name}`);
  }
});

test('the C845A, now with a public data sheet, is no longer marked unverified', () => {
  const n = NODES.find((x) => x.id === 'c845a');
  assert.equal(n.status, 'sourced');
  assert.match(n.url, /ucs-c845a-m8-rack-server-ds/);
});
