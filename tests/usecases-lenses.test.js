import test from 'node:test';
import assert from 'node:assert/strict';
import { MODELS } from '../src/data/model.js';
import { SOURCES } from '../src/data/stack.js';
import { NV } from '../src/data/nvidia-urls.js';

const sourceUrls = { cisco: new Set(Object.values(SOURCES)), nvidia: new Set(Object.values(NV)) };

test('every use case exists in both focuses, so each scenario can be read from either vendor\'s side', () => {
  const ids = (m) => m.cases.map((u) => u.id).sort();
  assert.deepEqual(ids(MODELS.cisco), ids(MODELS.nvidia));
  assert.ok(ids(MODELS.cisco).length >= 8);
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
      assert.ok(u.needs.filter((n) => n.role === 'required').length >= 3, `${u.id}: too few required needs`);
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
      // Only a draft may say that no published design validates the scenario end to end.
      assert.ok(u.designs.length >= 1 || u.status === 'draft', u.id);
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
  assert.match(MODELS.cisco.caseById.get('agentic-ai').caveat, /does not mention agentic AI/);
  assert.match(MODELS.cisco.caseById.get('secure-private-ai').caveat, /not certified|not a fully hardened/i);
  assert.equal(MODELS.nvidia.caseById.get('secure-private-ai').status, 'draft');
  assert.match(MODELS.nvidia.caseById.get('secure-private-ai').caveat, /not certification/i);
  assert.match(MODELS.nvidia.caseById.get('enterprise-ai-cluster').caveat, /no dedicated security chapter/i);
});

test('the conflict between the two vendors\' BlueField security claims is flagged on both sides', () => {
  assert.match(MODELS.cisco.caseById.get('agentic-ai').caveat, /BlueField/);
  assert.match(MODELS.cisco.caseById.get('secure-private-ai').needs.find((n) => n.products.includes('hybrid-mesh-fw')).why, /in development/i);
  assert.match(MODELS.nvidia.caseById.get('agentic-ai').needs.find((n) => n.products.includes('sentry')).why, /announced/i);
  assert.ok(MODELS.nvidia.caseById.get('agentic-ai').needs.find((n) => n.products.includes('nvidia-ai-enterprise')).role === 'required', 'the validated AI-Q deployment lists an AI Enterprise subscription as a prerequisite');
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

test('where the evidence supports fewer than five required needs, the use case is a draft and says why', () => {
  for (const m of Object.values(MODELS))
    for (const u of m.cases) {
      const required = u.needs.filter((n) => n.role === 'required').length;
      if (required < 5) {
        assert.equal(u.status, 'draft', `${m.data.id}/${u.id}: only ${required} required needs, so it cannot be sourced`);
        assert.match(u.caveat, /only three|no .*design|weakest|AI SOC/i, `${m.data.id}/${u.id}: the caveat should say the evidence is thin`);
      }
    }
});

test('a scenario with no validated design lists none, and every design can still be checked against it', () => {
  const nv = MODELS.nvidia;
  const tuning = nv.caseById.get('llm-fine-tuning');
  assert.deepEqual(tuning.designs, []);
  for (const d of nv.designs) {
    const s = nv.summarise(nv.assess('llm-fine-tuning', d.id));
    assert.ok(s.required.met < s.required.total, `${d.id} should not meet a scenario no NVIDIA document validates`);
  }
  assert.ok(nv.membersOf('nv-data-flywheel').has('nemo') && !nv.membersOf('nv-data-flywheel').has('nemo-guardrails'), 'the flywheel uses Customizer and Evaluator, not all of NeMo');
});

test('the new Cisco designs are published documents with sources, and the heavy ones carry a bill of materials', () => {
  const c = MODELS.cisco;
  for (const id of ['ai-pod-training', 'flexpod-aipod-train', 'aipod-everpure-train', 'hf-cloud-ra-h200', 'saf-rackscale', 'cisco-live-soc']) {
    assert.equal(c.nodeById.get(id).kind, 'design');
    assert.match(c.nodeById.get(id).url, /^https:\/\//);
  }
  assert.ok(c.nodeById.get('hf-cloud-ra-h200').bom.length >= 5);
  // The rack-scale overview is a different design from the Cloud RA: its Supermicro-built racks and missing AI Enterprise show as gaps.
  const s = c.summarise(c.assess('multi-tenant-ai-cloud', 'saf-rackscale'));
  assert.ok(s.required.met > 0 && s.required.met < s.required.total);
});

for (const [lens, m] of Object.entries(MODELS)) {
  test(`${lens}: each use case says where to read next, what the map leaves out and what to ask the vendor`, () => {
    for (const u of m.cases) {
      assert.ok(u.refs?.length >= 2, `${u.id}: reading links`);
      assert.equal(new Set(u.refs.map(([, url]) => url)).size, u.refs.length, `${u.id}: a link is repeated`);
      for (const [label, url] of u.refs) {
        assert.ok(label.length > 4, `${u.id}: link label`);
        assert.match(url, /^https:\/\/[^\s]+$/, `${u.id}: ${url}`);
      }
      assert.ok(u.offMap?.length >= 1, `${u.id}: what the map leaves out`);
      for (const o of u.offMap) assert.ok(o.name.length > 3 && o.note.length > 20, `${u.id}/${o.name}`);
      assert.ok(u.questions?.length >= 2, `${u.id}: questions for the vendor`);
      for (const q of u.questions) assert.ok(q.endsWith('?') && q.length > 30, `${u.id}: ${q}`);
      for (const s of u.sizing || []) {
        assert.ok(s.text.length > 30, `${u.id}: sizing`);
        assert.match(s.url, /^https:\/\//, `${u.id}: sizing source`);
      }
    }
  });
}

test('wording that earlier checks found wrong stays corrected', () => {
  const c = MODELS.cisco;
  const n = MODELS.nvidia;
  // Cisco's case study does not contain the quotation an earlier draft attributed to it.
  assert.doesNotMatch(c.caseById.get('agentic-ai').caveat, /"No agent workload was tested"/);
  // Hybrid Mesh Firewall on BlueField was announced, not shipped.
  assert.doesNotMatch(c.caseById.get('agentic-ai').caveat + c.caseById.get('secure-private-ai').caveat, /says it is available/);
  // Cisco's own Cloud RAs agree on which switch is NCP compliant.
  assert.doesNotMatch(c.caseById.get('multi-tenant-ai-cloud').caveat, /disagree/);
  assert.match(c.caseById.get('multi-tenant-ai-cloud').caveat, /N9164E-NS4-O/);
  // Nexus Dashboard's Slurm integration is published by Cisco.
  assert.doesNotMatch(c.caseById.get('ai-factory-operations').caveat, /only in third-party/);
  // The Data Flywheel blueprint is no longer maintained, and the NVL72 reference architecture names Mission Control.
  assert.match(n.nodeById.get('nv-data-flywheel').blurb, /no longer actively maintained/);
  assert.ok(n.membersOf('era-nvl72').has('mission-control'));
  assert.ok(!n.links.some((l) => l.a === 'era-nvl72' && l.b === 'base-command-manager'), 'the NVL72 page names Mission Control, which brings Base Command Manager with it, not Base Command Manager itself');
  // AI Enterprise is a stated prerequisite of the validated AI-Q deployment.
  assert.equal(n.caseById.get('agentic-ai').needs.find((x) => x.products.includes('nvidia-ai-enterprise')).role, 'required');
});
