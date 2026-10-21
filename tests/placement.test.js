import test from 'node:test';
import assert from 'node:assert/strict';
import { nodeById, productsIn, membersOf, coverage } from '../src/data/model.js';
import { PRIMITIVES, LINKS } from '../src/data/stack.js';

// Where each product sits is the claim readers remember most, so it is checked against how Cisco
// itself groups the stack. These headings and members are from the Secure AI Factory with NVIDIA
// page (cisco.com/site/us/en/solutions/artificial-intelligence/secure-ai-factory), as read in 2026.
// If Cisco regroups something, this test should fail and the placement be reconsidered, not edited
// quietly to match.
const CISCO_GROUPING = {
  Compute: { primitive: 'compute', members: ['intersight'] },
  Networking: { primitive: 'network', members: ['silicon-one', 'spectrum-x'] },
  Security: { primitive: 'security', members: ['ai-defense', 'hybrid-mesh-fw', 'splunk-es'] },
  Observability: { primitive: 'ops', members: ['splunk-obs'] },
  'AI software': { primitive: 'platform', members: ['nvidia-ai-enterprise'] },
  'Kubernetes Platform': { primitive: 'platform', members: ['openshift', 'nutanix', 'kubernetes'] },
  Storage: { primitive: 'data', members: ['hitachi', 'netapp', 'pure', 'vast'] },
};

for (const [heading, { primitive, members }] of Object.entries(CISCO_GROUPING)) {
  test(`products Cisco lists under "${heading}" sit in the ${primitive} primitive`, () => {
    for (const id of members) assert.equal(nodeById.get(id).primitive, primitive, `${id} should be in ${primitive}`);
  });
}

test('Nutanix sits with the Kubernetes platforms, where Cisco lists it first, not with storage', () => {
  assert.equal(nodeById.get('nutanix').primitive, 'platform');
  assert.ok(!productsIn('data').some((n) => n.id === 'nutanix'));
});

test('Isovalent is split across the two places Cisco puts it: networking, and runtime security', () => {
  assert.equal(nodeById.get('isovalent').primitive, 'network');
  assert.equal(nodeById.get('isovalent-runtime').primitive, 'security');
  assert.match(nodeById.get('isovalent').name, /Networking/, 'named for the networking half, so it is not confused with Runtime Security');
});

test('the primitives\' own descriptions mention what was moved into them', () => {
  const summary = (id) => PRIMITIVES.find((p) => p.id === id).summary;
  assert.match(summary('network'), /Kubernetes/i, 'the network primitive now includes networking inside Kubernetes');
  assert.doesNotMatch(summary('platform'), /cluster networking/i, 'the platform primitive no longer claims cluster networking');
});

test('Pure Storage is shown under its 2026 name, Everpure, and says so', () => {
  const n = nodeById.get('pure');
  assert.match(n.name, /Everpure/);
  assert.match(n.name, /Pure Storage/, 'the old name stays visible so it can still be found');
});

test('the Secure AI Factory link to Isovalent Runtime Security is marked unconfirmed, since the current page dropped it', () => {
  const l = LINKS.find((x) => x.a === 'secure-ai-factory' && x.b === 'isovalent-runtime');
  assert.equal(l.status, 'check');
});

// ---- Relationship accuracy: findings from checking every link against the primary sources ----

test('the 2-8-9-400 design includes what its own guide lists: management, platform and storage, not just hardware', () => {
  const m = membersOf('pod-2-8-9-400');
  for (const id of ['c885a', 'n9364e', 'nvidia-gpu', 'bluefield', 'intersight', 'nexus-dashboard', 'openshift', 'nvidia-ai-enterprise', 'netapp', 'pure', 'vast']) {
    assert.ok(m.has(id), `the 2-8-9-400 guide lists ${id}`);
  }
  const covered = coverage('pod-2-8-9-400').filter((r) => r.have > 0).map((r) => r.primitive.id).sort();
  assert.deepEqual(covered, ['compute', 'data', 'network', 'platform'], 'covers four primitives and leaves security and operations open');
});

test('the 2-8-5-200 design is documented, and no longer marked unverified', () => {
  assert.equal(nodeById.get('pod-2-8-5-200').status, 'sourced');
  assert.match(nodeById.get('pod-2-8-5-200').url, /ai-pod-nvidia-2-8-5-200-era/);
  const m = membersOf('pod-2-8-5-200');
  for (const id of ['c845a', 'n9364e', 'bluefield', 'nexus-9000', 'intersight', 'nexus-dashboard', 'openshift', 'nvidia-ai-enterprise', 'netapp', 'pure', 'vast']) {
    assert.ok(m.has(id), `the 2-8-5-200 guide lists ${id}`);
  }
  const covered = coverage('pod-2-8-5-200').filter((r) => r.have > 0).map((r) => r.primitive.id).sort();
  assert.deepEqual(covered, ['compute', 'data', 'network', 'platform']);
});

test('Spectrum-X on the 9364E-SG2 is confirmed, with its licence condition stated', () => {
  const l = LINKS.find((x) => x.a === 'spectrum-x' && x.b === 'n9364e');
  assert.equal(l.status, 'sourced');
  assert.match(l.label, /licence/);
});

test('no source connects Splunk Observability to AGNTCY, so there is no such link', () => {
  assert.equal(LINKS.filter((l) => [l.a, l.b].includes('splunk-obs') && [l.a, l.b].includes('agntcy')).length, 0);
});

test('AGNTCY\'s only connection is the single-report AI Canvas one, and it says so', () => {
  const ls = LINKS.filter((l) => l.a === 'agntcy' || l.b === 'agntcy');
  assert.equal(ls.length, 1);
  assert.equal(ls[0].status, 'check');
});

test('storage reaches the front-end Nexus fabric, as the 2-8-5-200 guide states for NetApp, Everpure and VAST', () => {
  for (const b of ['netapp', 'pure', 'vast']) {
    const l = LINKS.find((x) => x.a === 'nexus-9000' && x.b === b);
    assert.ok(l, `Nexus 9000 to ${b}`);
    assert.equal(l.status, 'sourced');
  }
});

test('Intersight\'s link to storage and switches is only what the CVD says: that Assist connects them', () => {
  for (const b of ['pure', 'nexus-9000']) {
    const l = LINKS.find((x) => x.a === 'intersight' && x.b === b);
    assert.equal(l.type, 'observes', `${b}: the guide says "connects", not "manages"`);
    assert.match(l.label, /does not say/);
  }
});

test('integrations the documentation confirms are no longer marked unverified', () => {
  const status = (a, b) => LINKS.find((x) => x.a === a && x.b === b)?.status;
  assert.equal(status('xdr', 'splunk-es'), 'sourced', 'a documented two-way link');
  assert.equal(status('ai-defense', 'splunk-es'), 'sourced', 'AI Defense forwards events to Splunk');
  assert.equal(status('thousandeyes', 'ai-canvas'), 'sourced', 'Cisco names ThousandEyes as an AI Canvas telemetry source');
  assert.equal(status('isovalent-runtime', 'kubernetes'), 'sourced');
  assert.equal(status('spectrum-x', 'bluefield'), 'sourced');
});

test('what AI Canvas can do in the data center is only unconfirmed, since Cisco says its lists are illustrative', () => {
  for (const b of ['nexus-dashboard', 'hyperfabric', 'intersight']) {
    assert.equal(LINKS.find((x) => x.a === 'ai-canvas' && x.b === b).status, 'check', b);
  }
});
