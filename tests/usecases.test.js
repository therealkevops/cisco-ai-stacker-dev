import test from 'node:test';
import assert from 'node:assert/strict';
import { USE_CASES } from '../src/data/usecases.js';
import { SOURCES } from '../src/data/stack.js';
import {
  nodeById, assess, summarise, caseProducts, casesNeeding, casesDelivered, parseRoute, href,
} from '../src/data/model.js';

test('use cases have unique ids, a status, a source and a summary', () => {
  assert.equal(new Set(USE_CASES.map((u) => u.id)).size, USE_CASES.length);
  const urls = new Set(Object.values(SOURCES));
  for (const u of USE_CASES) {
    assert.ok(['sourced', 'draft'].includes(u.status), u.id);
    assert.ok(urls.has(u.url), `${u.id}: url not in SOURCES`);
    assert.ok(u.summary.length > 60, u.id);
  }
});

test('every need names real products, a valid role and a reason', () => {
  for (const u of USE_CASES) {
    assert.ok(u.needs.some((n) => n.role === 'required'), `${u.id}: nothing required`);
    for (const n of u.needs) {
      assert.ok(['required', 'recommended'].includes(n.role), `${u.id}: role`);
      assert.ok(n.why.length > 20, `${u.id}/${n.products}: why`);
      assert.ok(n.products.length >= 1 && new Set(n.products).size === n.products.length, `${u.id}: products`);
      for (const p of n.products) {
        assert.ok(nodeById.has(p), `${u.id}: unknown product ${p}`);
        assert.ok(!nodeById.get(p).kind, `${u.id}: ${p} is a design, not a product`);
      }
    }
  }
});

test('no product is named by two needs in one use case', () => {
  for (const u of USE_CASES) {
    const all = u.needs.flatMap((n) => n.products);
    // Alternatives may recur across needs only where a product genuinely serves two roles; none do yet.
    const dupes = all.filter((p, i) => all.indexOf(p) !== i);
    assert.deepEqual(dupes, [], `${u.id}: ${dupes}`);
  }
});

test('the designs a use case lists exist and are designs', () => {
  for (const u of USE_CASES) {
    assert.ok(u.designs.length >= 1, u.id);
    for (const d of u.designs) assert.equal(nodeById.get(d)?.kind, 'design', `${u.id}: ${d}`);
  }
});

test('a design a use case lists as validated meets every one of its required needs', () => {
  for (const uc of USE_CASES)
    for (const d of uc.designs) {
      const s = summarise(assess(uc.id, d));
      assert.equal(s.required.met, s.required.total, `${uc.id} against ${d}: a validated design should meet every required need`);
    }
});

test('the RAG use case: the two CVDs meet it, and leave every recommendation open', () => {
  for (const d of ['flexpod-rag', 'flashstack-rag']) {
    const s = summarise(assess('enterprise-rag', d));
    assert.deepEqual(s.required, { met: 8, total: 8 });
    assert.deepEqual(s.recommended, { met: 0, total: 3 }, 'the guides name no security or observability product');
  }
});

test('an alternatives need is met by whichever one the design includes, and says which', () => {
  const storage = (d) => assess('enterprise-rag', d).find((a) => a.need.products.includes('netapp'));
  assert.deepEqual(storage('flexpod-rag').metBy, ['netapp']);
  assert.deepEqual(storage('flashstack-rag').metBy, ['pure']);
});

test('checking a use case against a design built for something else shows real gaps', () => {
  const s = summarise(assess('enterprise-rag', 'pod-2-8-9-400'));
  assert.ok(s.required.met < s.required.total, 'the AI POD hardware is not the RAG CVD hardware');
  assert.ok(assess('enterprise-rag', 'pod-2-8-9-400').find((a) => a.need.products.includes('ucs-x')).met === false);
  assert.ok(assess('enterprise-rag', 'pod-2-8-9-400').find((a) => a.need.products.includes('nvidia-gpu')).met, 'but the GPUs are shared');
});

test('a wider design meets more of the cluster use case than a narrower one', () => {
  const met = (d) => summarise(assess('enterprise-ai-cluster', d));
  assert.ok(met('secure-ai-factory').recommended.met > met('pod-2-8-9-400').recommended.met);
  assert.ok(met('secure-ai-factory').required.met >= met('pod-2-8-9-400').required.met);
  assert.ok(met('pod-2-8-9-400').required.met >= 4);
});

test('lookups across use cases and designs', () => {
  assert.ok(caseProducts('enterprise-rag').includes('netapp') && caseProducts('enterprise-rag').includes('pure'));
  assert.deepEqual(casesNeeding('ai-defense').map((x) => `${x.useCase.id}:${x.role}`), ['enterprise-rag:recommended', 'enterprise-ai-cluster:recommended', 'agentic-ai:required', 'secure-private-ai:required', 'ai-security-operations:recommended', 'llm-fine-tuning:recommended', 'multi-tenant-ai-cloud:recommended']);
  assert.ok(casesNeeding('ucs-fi').some((x) => x.useCase.id === 'enterprise-rag' && x.role === 'required'));
  assert.deepEqual(casesNeeding('thousandeyes').map((x) => `${x.useCase.id}:${x.role}`), ['ai-factory-operations:recommended']);
  assert.deepEqual(casesNeeding('agntcy').map((x) => x.useCase.id), ['agentic-ai']);
  assert.deepEqual(casesDelivered('flashstack-rag').map((u) => u.id), ['enterprise-rag']);
  assert.deepEqual(casesDelivered('ai-defense'), []);
});

test('use case routes parse, with an optional design, and reject bad ones', () => {
  assert.deepEqual(parseRoute('#/usecase/enterprise-rag'), { lens: 'cisco', kind: 'usecase', id: 'enterprise-rag', design: null });
  assert.deepEqual(parseRoute('#/usecase/enterprise-rag/flashstack-rag'), { lens: 'cisco', kind: 'usecase', id: 'enterprise-rag', design: 'flashstack-rag' });
  assert.deepEqual(parseRoute('#/usecase/enterprise-rag/ai-defense'), { lens: 'cisco', kind: 'usecase', id: 'enterprise-rag', design: null }, 'a product is not a design');
  assert.deepEqual(parseRoute('#/usecase/enterprise-rag/nope'), { lens: 'cisco', kind: 'usecase', id: 'enterprise-rag', design: null });
  assert.deepEqual(parseRoute('#/usecase/nope'), { lens: 'cisco', kind: null });
  assert.equal(href.usecase('a'), '#/usecase/a');
  assert.equal(href.usecase('a', 'b'), '#/usecase/a/b');
});
