import test from 'node:test';
import assert from 'node:assert/strict';
import { products, linksBetweenProducts, linksOf, nodeById } from '../src/data/model.js';

// A product with no connections on the map looks as if it has no integrations, which is a claim. It
// is only right where the sources document none. Each exception below says why, and a product that
// gains a connection must be taken off this list.
const NO_DOCUMENTED_INTEGRATION = {
  hitachi: 'Cisco lists Hitachi Vantara as a Secure AI Factory storage partner; no integration with a specific Cisco product was found in the sources read.',
};

test('every product connects to another product on the map, or is listed here with the reason it does not', () => {
  for (const p of products) {
    const count = linksBetweenProducts(p.id).length;
    if (NO_DOCUMENTED_INTEGRATION[p.id]) {
      assert.equal(count, 0, `${p.id} now has ${count} connection(s); remove it from the exceptions list`);
    } else {
      assert.ok(count >= 1, `${p.id} has no connection to another product, and no documented reason for that`);
    }
  }
});

test('the exceptions list names real products and gives a reason', () => {
  for (const [id, why] of Object.entries(NO_DOCUMENTED_INTEGRATION)) {
    assert.ok(nodeById.has(id), id);
    assert.ok(why.length > 40, `${id}: reason`);
  }
});

test('a network product is connected to the network, not only to the things it serves', () => {
  for (const p of products.filter((x) => x.primitive === 'network')) {
    const peers = linksBetweenProducts(p.id).map((l) => nodeById.get(l.a === p.id ? l.b : l.a));
    assert.ok(peers.some((q) => q.primitive === 'network'), `${p.id} connects to nothing else in the network wedge`);
  }
});

test('Hyperfabric AI is connected to the pieces its data sheet and reference architecture name', () => {
  const peers = new Set(linksBetweenProducts('hyperfabric').map((l) => (l.a === 'hyperfabric' ? l.b : l.a)));
  for (const id of ['c885a', 'silicon-one', 'spectrum-x', 'bluefield', 'vast', 'nvidia-ai-enterprise', 'nexus-9000']) {
    assert.ok(peers.has(id), `Hyperfabric should connect to ${id}`);
  }
  assert.ok(![...peers].some((id) => nodeById.get(id).status === 'check'), 'every Hyperfabric connection is documented');
  const net = [...peers].filter((id) => nodeById.get(id).primitive === 'network');
  assert.ok(net.length >= 3, 'at least three connections inside the network wedge');
});

test('Hyperfabric and Nexus Dashboard are alternatives, so they are not linked as if one managed the other', () => {
  const direct = linksOf('hyperfabric').filter((l) => l.other.id === 'nexus-dashboard');
  assert.deepEqual(direct, []);
});

test('storage products connect to the compute or platform they actually serve', () => {
  const servedBy = (id) => linksBetweenProducts(id).map((l) => nodeById.get(l.a === id ? l.b : l.a).primitive);
  assert.ok(servedBy('netapp').includes('platform'), 'NetApp Trident provisions storage for OpenShift');
  assert.ok(servedBy('pure').includes('platform') && servedBy('pure').includes('compute'), 'Pure: Portworx on OpenShift, and Intersight Assist');
  assert.ok(servedBy('vast').includes('compute') && servedBy('vast').includes('network'), 'VAST: UCS nodes and Nexus 9300');
});
