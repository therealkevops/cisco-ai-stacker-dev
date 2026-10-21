# The Cisco AI Stack: primitives mapped to the portfolio

A honeycomb map of the Cisco AI stack, in the manner of an ecosystem map. At the centre is the AI workload. Around it are the six primitives it needs, and beside each primitive sit the products that provide it: Cisco first, then partners, each primitive in its own colour.

| Primitive | Examples |
|---|---|
| Platform and runtime | NVIDIA AI Enterprise, OpenShift, Kubernetes, Isovalent |
| Operations and agents | Splunk Observability, AI Canvas, ThousandEyes, AGNTCY |
| Security | AI Defense, Hybrid Mesh Firewall, Isovalent Runtime Security, Splunk ES, XDR |
| Network fabric | Nexus 9364E-SG2, Nexus 9000, Hyperfabric AI, Nexus Dashboard |
| Compute and accelerators | UCS C885A M8, C845A M8, Intersight, NVIDIA HGX GPUs, BlueField |
| Data and storage | NetApp, Pure Storage, VAST Data, Hitachi Vantara, Nutanix |

## Using it

- **Pick a product** to light up what it connects to: the hexes it integrates with are outlined, and arrowed lines run the way each relationship does. The panel lists the connections in words, and which validated designs include the product.
- **Pick a primitive** to light up everything that provides it, and see which other primitives it integrates with most.
- **Pick a validated design** (Secure AI Factory, AI PODs, the 2-8-9-400 and 2-8-5-200 designs) for the portfolio lens. The products the design includes light up, each primitive shows how many of its products are covered ("2 of 6"), and the panel names the primitives the design leaves open.

Filled hexes are Cisco, open hexes are partners, and a dashed outline means the entry is not yet confirmed against a public page. Every selection has its own URL (`#/product/n9364e`, `#/primitive/security`, `#/design/ai-pod`), so the back button works and any view can be shared. Escape clears the selection, and every hex is reachable with the keyboard.

## Running it

```
npm install
npm run dev      # http://localhost:8999
npm test         # data integrity, honeycomb layout and portfolio coverage
npm run lint
npm run build    # static files in dist/, ready for Vercel or any static host
```

## Where the content lives

[`src/data/stack.js`](src/data/stack.js) holds everything: the six primitives, the products and designs, and the integrations between them, each with a `status` of `sourced` or `check` and a source URL. Integrations are directional (a to b), so "Nexus 9000 contains Nexus 9364E-SG2" reads correctly from both ends.

- To add a product, add an entry to `NODES` with its `primitive`, and at least one `L(...)` line to `LINKS`. A primitive's wedge holds up to nine products.
- To add a validated design, add a node with `kind: 'design'` and "contains" links to what it includes. Coverage follows the containment links downward, so a design that contains another design includes everything inside it.

The tests fail if a link points at a product that does not exist, a product has no source, an integration reads the same from both ends, a primitive's products do not form one connected clump on the map, or a label is too long for its hexagon.

### Accuracy

Cisco renames and repackages products often, and some details in the public sources disagree (for example which ASIC is in the Nexus 9364E-SG2). Anything not confirmed is marked `check` and shows as unverified. Re-check before using this in front of a customer. Which primitive a product belongs to, and the order of the hexes, are editorial choices, not Cisco's.

## How it is built

React and Vite, with no other runtime dependencies. The map is a single SVG. Its layout, in [`src/map/hexgrid.js`](src/map/hexgrid.js), is pure geometry on a hexagonal grid and is tested without a browser. It is static files, so it runs on any static host, including the free tiers.
