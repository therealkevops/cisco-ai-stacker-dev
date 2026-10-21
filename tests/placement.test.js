import test from 'node:test';
import assert from 'node:assert/strict';
import { nodeById, productsIn } from '../src/data/model.js';
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
