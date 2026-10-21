import test from 'node:test';
import assert from 'node:assert/strict';
import { MODELS } from '../src/data/model.js';
import { SOURCES } from '../src/data/stack.js';
import { NV } from '../src/data/nvidia-urls.js';

const sourceUrls = { cisco: new Set(Object.values(SOURCES)), nvidia: new Set(Object.values(NV)) };

test('every use case exists in both focuses, so each scenario can be read from either vendor\'s side', () => {
  const ids = (m) => m.cases.map((u) => u.id).sort();
  assert.deepEqual(ids(MODELS.cisco), ids(MODELS.nvidia));
  assert.ok(ids(MODELS.cisco).length >= 4);
  for (const id of ids(MODELS.cisco)) {
    const [a, b] = [MODELS.cisco.caseById.get(id), MODELS.nvidia.caseById.get(id)];
    assert.equal(a.name, b.name, `${id}: the scenario keeps one name`);
  }
});

for (const [lens, m] of Object.entries(MODELS)) {
  test(`${lens}: each use case has a source, a status, a summary and a caveat saying what to check`, () => {
    assert.equal(new Set(m.cases.map((u) => u.id)).size, m.cases.length);
    for (const u of m.cases) {
      assert.ok(['sourced', 'draft'].includes(u.status), u.id);
      assert.ok(sourceUrls[lens].has(u.url), `${u.id}: url is not one of this focus's sources`);
      assert.ok(u.summary.length > 100, u.id);
      assert.ok(u.caveat && u.caveat.length >= 100, `${u.id}: a caveat is expected for every use case`);
    }
  });

  test(`${lens}: needs name real products, with a role and a reason, none twice`, () => {
    for (const u of m.cases) {
      const all = u.needs.flatMap((n) => n.products);
      assert.equal(new Set(all).size, all.length, `${u.id}: a product is in two needs`);
      assert.ok(u.needs.filter((n) => n.role === 'required').length >= 5, `${u.id}: too few required needs`);
      assert.ok(u.needs.some((n) => n.role === 'recommended'), `${u.id}: no recommended needs`);
      for (const n of u.needs) {
        assert.ok(['required', 'recommended'].includes(n.role));
        assert.ok(n.why.length > 30, `${u.id}/${n.products}: why`);
        for (const p of n.products) assert.ok(m.nodeById.has(p) && !m.nodeById.get(p).kind, `${u.id}: ${p}`);
      }
    }
  });

  test(`${lens}: every design a use case lists exists and meets every required need`, () => {
    for (const u of m.cases) {
      assert.ok(u.designs.length >= 1, u.id);
      for (const d of u.designs) {
        assert.equal(m.nodeById.get(d)?.kind, 'design', `${u.id}: ${d}`);
        const s = m.summarise(m.assess(u.id, d));
        assert.equal(s.required.met, s.required.total, `${u.id} against ${d}`);
      }
    }
  });
}

test('a use case with no published test of its scenario is a draft, and says so', () => {
  assert.equal(MODELS.cisco.caseById.get('agentic-ai').status, 'draft');
  assert.match(MODELS.cisco.caseById.get('agentic-ai').caveat, /No agent workload was tested/);
  assert.match(MODELS.cisco.caseById.get('secure-private-ai').caveat, /not certified|not a fully hardened/i);
  assert.match(MODELS.nvidia.caseById.get('secure-private-ai').caveat, /not certification/i);
  assert.match(MODELS.nvidia.caseById.get('enterprise-ai-cluster').caveat, /tables of contents/i);
});

test('the conflict between the two vendors\' BlueField security claims is flagged on both sides', () => {
  assert.match(MODELS.cisco.caseById.get('agentic-ai').caveat, /BlueField/);
  assert.match(MODELS.cisco.nodeById.get('hybrid-mesh-fw') && MODELS.cisco.caseById.get('secure-private-ai').needs.find((n) => n.products.includes('hybrid-mesh-fw')).why, /conflict|in development/i);
  assert.match(MODELS.nvidia.caseById.get('agentic-ai').needs.find((n) => n.products.includes('sentry')).why, /announced/i);
});

test('NVIDIA\'s use cases rest on NVIDIA documents, each of which is a design on the map', () => {
  const nv = MODELS.nvidia;
  for (const id of ['era-rag', 'era-ai-q', 'era-secure']) {
    assert.equal(nv.nodeById.get(id).kind, 'design');
    assert.ok(nv.membersOf(id).has('era-rtx-pro'), `${id} builds on the RTX PRO reference architecture`);
  }
  // A design that includes a blueprint has the blueprint, not everything the blueprint bundles.
  assert.ok(!nv.membersOf('era-rag').has('omniverse-dsx') && !nv.membersOf('era-rag').has('ai-q'));
  assert.ok(nv.membersOf('era-ai-q').has('ai-q') && !nv.membersOf('era-ai-q').has('cuvs'));
});

test('a use case checked against a design built for something else shows real gaps', () => {
  const nv = MODELS.nvidia;
  const s = nv.summarise(nv.assess('enterprise-rag', 'era-ai-q'));
  assert.ok(s.required.met > 0 && s.required.met < s.required.total, 'the agent design shares the hardware but not the RAG blueprint');
  const c = MODELS.cisco;
  const t = c.summarise(c.assess('secure-private-ai', 'pod-2-8-9-400'));
  assert.ok(t.required.met < t.required.total);
});
