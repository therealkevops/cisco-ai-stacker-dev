import test from 'node:test';
import assert from 'node:assert/strict';
import { MODELS, counterparts } from '../src/data/model.js';

const oss = MODELS.oss;
const products = oss.products;

// A project with no connection looks as if it has no integrations, which is a claim. Each exception
// says why the sources read document none, and a project that gains a link must come off the list.
const NO_DOCUMENTED_INTEGRATION = {
  sonic: 'A switch operating system; no listed project documents an integration with it.',
  nccl: 'Documented against NVIDIA hardware and frameworks, none of which is a listed project.',
  faiss: 'A library embedded in other tools; none of the projects on this map documents an integration with it.',
  presidio: 'Its sources read document no integration with a listed project.',
  'llm-guard': 'Archived; no listed project documents an integration with it.',
  rccl: 'Retired repository; ROCm composes it, which is the only link.',
  'uec-specs': 'A specification with no implementation among the listed projects.',
  minio: 'Archived; no listed project documents an integration with it.',
  lustre: 'A parallel file system; no listed project documents an integration with it.',
  falco: 'Its sources read name no listed project.',
  opa: 'Its sources read name no listed project.',
  spire: 'Its sources read name no listed project.',
  'sigstore-cosign': 'Its sources read name no listed project.',
  tetragon: 'Linked only through Cilium, its parent.',
};

test('the open-source focus has the expected structure', () => {
  assert.equal(oss.data.focus, 'oss');
  assert.ok(products.length >= 60, `${products.length} projects`);
  assert.equal(oss.designs.length, 4);
  for (const p of oss.data.primitives) assert.ok(products.some((n) => n.primitive === p.id), p.id);
});

test('every project is filled (foundation or community) or open (vendor-controlled), never anything else', () => {
  for (const n of products) assert.ok(['oss', 'partner'].includes(n.vendor), n.id);
});

test('every project states its licence and who controls it', () => {
  for (const n of products) {
    const facts = new Map(oss.detailsOf(n.id).facts);
    assert.ok(facts.get('Licence'), `${n.id}: licence`);
    assert.ok(facts.get('Governance') || facts.get('Repository'), `${n.id}: governance`);
  }
});

test('open-weight models are labelled as such, not as open source, and are dashed', () => {
  const m = oss.nodeById.get('open-weight-models');
  assert.equal(m.dashed, true);
  assert.match(m.blurb, /open-weight/);
  assert.match(oss.detailsOf('open-weight-models').caveat, /licence of each model/i);
  assert.match(oss.detailsOf('open-weight-models').facts.find(([k]) => k === 'Class')[1], /none meets the OSI/);
});

test('MinIO is shown as archived, as a caution', () => {
  assert.match(oss.detailsOf('minio').caveat, /NO LONGER MAINTAINED/);
  assert.match(oss.detailsOf('minio').facts.find(([k]) => k === 'Class')[1], /archived/);
});

test('Grafana and the NVIDIA-controlled projects are flagged as vendor-controlled', () => {
  for (const id of ['grafana', 'gpu-operator', 'nemo-guardrails', 'garak', 'dcgm-exporter', 'nccl', 'rccl', 'calico', 'slurm']) {
    assert.equal(oss.nodeById.get(id).vendor, 'partner', id);
  }
});

test('the Ultra Ethernet specification is dashed because its licence is not stated', () => {
  assert.equal(oss.nodeById.get('uec-specs').dashed, true);
  assert.match(oss.detailsOf('uec-specs').caveat, /not stated/);
});

test('each project connects to another, or is listed here with the reason it does not', () => {
  for (const p of products) {
    const count = oss.linksBetweenProducts(p.id).length;
    if (NO_DOCUMENTED_INTEGRATION[p.id]) assert.ok(count <= 1, `${p.id} has ${count} connections; remove it from the exceptions`);
    else assert.ok(count >= 1, `${p.id} has no connection and no documented reason`);
  }
  for (const [id, why] of Object.entries(NO_DOCUMENTED_INTEGRATION)) {
    assert.ok(oss.nodeById.has(id), id);
    assert.ok(why.length > 30, id);
  }
});

test('every cross-focus pointer names a real node in the other focus', () => {
  for (const n of oss.nodes) for (const a of n.alsoIn || []) {
    assert.ok(MODELS[a.lens], `${n.id}: ${a.lens}`);
    assert.ok(MODELS[a.lens].nodeById.has(a.id), `${n.id} -> ${a.lens}/${a.id}`);
    assert.ok(a.relation && a.note.length > 20, `${n.id} -> ${a.id}`);
  }
});

test('a vendor product shows its open-source counterpart', () => {
  assert.ok(counterparts('cisco', 'isovalent').some((c) => c.node.id === 'cilium'));
  assert.ok(counterparts('nvidia', 'run-ai').some((c) => c.node.id === 'kai-scheduler'));
});

test('designs are published documents, not products, and each says what it does not cover', () => {
  for (const d of oss.designs) {
    assert.match(d.url, /^https:\/\//);
    assert.ok(d.bom.length >= 4, d.id);
    assert.ok(d.offMap.length >= 1, d.id);
  }
  assert.match(oss.nodeById.get('oss-k8s-ai-conformance').blurb, /not a design/);
});

test('use cases that no document validates are drafts with no design', () => {
  for (const id of ['enterprise-ai-cluster', 'agentic-ai', 'ai-factory-operations', 'llm-fine-tuning', 'multi-tenant-ai-cloud']) {
    assert.deepEqual(oss.caseById.get(id).designs, [], id);
    assert.equal(oss.caseById.get(id).status, 'draft', id);
  }
  assert.deepEqual(oss.caseById.get('secure-private-ai').designs, ['oss-nvidia-coco']);
  assert.ok(!oss.caseById.has('ai-security-operations'));
});

test('the thin spots the checks found are stated', () => {
  assert.match(oss.caseById.get('llm-fine-tuning').caveat, /TorchTune is unmaintained/);
  assert.match(oss.caseById.get('enterprise-rag').caveat, /Intel/);
  assert.match(oss.detailsOf('sonic').caveat, /RoCE/);
  assert.match(oss.detailsOf('mcp').caveat, /mid-transition/);
});

test('every project names its steward and what kind of body it is', () => {
  for (const n of products) {
    assert.ok(n.steward?.name && ['foundation', 'company', 'community', 'archived'].includes(n.steward.kind), n.id);
  }
});

test('the RAG scenario shows how many choices and owners it spans, and says nobody supports the whole', () => {
  const b = oss.burden('enterprise-rag');
  assert.ok(b.requiredSlots >= 6 && b.options >= 25, `${b.requiredSlots} slots, ${b.options} options`);
  assert.ok(b.fewest >= 4 && b.most > b.fewest, `${b.fewest} to ${b.most} bodies`);
  assert.ok(b.stewards >= 15);
  const uc = oss.caseById.get('enterprise-rag');
  assert.match(uc.caveat, /no single supported/i);
  assert.ok(uc.support.length >= 3);
  for (const s of uc.support) assert.match(s.url, /^https:\/\//);
  assert.equal(MODELS.cisco.burden('enterprise-rag'), null, 'only a focus that names stewards has a choice count');
});

test('the licence and maintenance problems found in the RAG choices are on the map', () => {
  assert.equal(oss.nodeById.get('tgi').maturity, 'maintenance');
  assert.equal(oss.nodeById.get('llm-guard').maturity, 'archived');
  for (const id of ['weaviate', 'open-webui', 'phoenix']) assert.equal(oss.nodeById.get(id).dashed, true, id);
  assert.match(oss.detailsOf('weaviate').facts.find(([k]) => k === 'Licence')[1], /proprietary/);
  assert.match(oss.detailsOf('redis').facts.find(([k]) => k === 'Class')[1], /Only the AGPL/);
  assert.match(oss.detailsOf('phoenix').caveat, /Elastic-2.0/);
  assert.match(oss.detailsOf('tgi').caveat, /maintenance mode/);
});

test('ChatQnA meets every required need of the RAG scenario', () => {
  const s = oss.summarise(oss.assess('enterprise-rag', 'oss-opea-chatqna'));
  assert.equal(s.required.met, s.required.total);
  assert.ok(s.recommended.met < s.recommended.total, 'the design leaves recommended needs open');
});

test('a documented cross-focus link carries the vendor page and the date it was read; a counterpart does not claim either', () => {
  let documented = 0;
  for (const n of oss.nodes) for (const a of n.alsoIn || []) {
    assert.ok(['documented', 'counterpart'].includes(a.basis), `${n.id} -> ${a.id}`);
    if (a.basis === 'documented') {
      documented += 1;
      assert.match(a.url, /^https:\/\//, `${n.id} -> ${a.id}`);
      assert.ok(a.read, `${n.id} -> ${a.id}: no read date`);
    } else {
      assert.ok(!a.url && !a.read, `${n.id} -> ${a.id}: a counterpart is our reading and has no vendor source`);
    }
  }
  assert.ok(documented >= 60, `${documented} documented links`);
});

test('both vendors have documented open-source links, and each is reachable from the vendor side', () => {
  for (const lens of ['cisco', 'nvidia']) {
    const found = Object.values(MODELS.oss.nodes).flatMap((n) => (n.alsoIn || []).filter((a) => a.lens === lens && a.basis === 'documented'));
    assert.ok(found.length >= 20, `${lens}: ${found.length}`);
    for (const a of found) assert.ok(counterparts(lens, a.id).some((c) => c.basis === 'documented'), `${lens}/${a.id}`);
  }
});

test('what the vendors\' pages say and what the maps hold stay consistent for the cases the checks found', () => {
  const rel = (lens, id, oss) => counterparts(lens, id).find((c) => c.node.id === oss);
  assert.equal(rel('cisco', 'ai-pod-training', 'slurm').basis, 'documented');
  assert.equal(rel('nvidia', 'dynamo', 'vllm').basis, 'documented');
  assert.equal(rel('nvidia', 'nim', 'kserve').basis, 'counterpart', 'KServe is our reading of an alternative to NIM; NVIDIA names it nowhere');
  assert.equal(rel('cisco', 'isovalent', 'cilium').basis, 'counterpart');
  assert.match(rel('cisco', 'foundation-ai', 'open-weight-models').note, /without naming it/);
});
