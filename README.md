# The Cisco AI Stack: primitives mapped to the portfolio

A honeycomb map of the Cisco AI stack, in the manner of an ecosystem map. At the centre is the AI workload. Around it are the six primitives it needs, and beside each primitive sit the products that provide it: Cisco first, then partners, each primitive in its own colour.

| Primitive | Examples |
|---|---|
| Platform and runtime | NVIDIA AI Enterprise, Red Hat OpenShift, Nutanix, Kubernetes |
| Operations and agents | Splunk Observability, AI Canvas, ThousandEyes, AGNTCY |
| Security | AI Defense, Hybrid Mesh Firewall, Isovalent Runtime Security, Splunk ES, XDR |
| Network fabric | Nexus 9364E-SG2, Nexus 9000, UCS Fabric Interconnects, Hyperfabric AI, Nexus Dashboard, Isovalent Networking |
| Compute and accelerators | UCS C885A M8, C845A M8, UCS X-Series, Intersight, NVIDIA GPUs, BlueField |
| Data and storage | NetApp, Everpure (Pure Storage), VAST Data, Hitachi Vantara |

## Using it

- **Pick a product** to read what it is for and its most useful features, each taken from the vendor's own documentation, with sources linked and a "Check" note where sources disagree or a feature is early access. It also lights up what the product connects to: the hexes it integrates with are outlined, and arrowed lines run the way each relationship does. A key on the map shows the line styles in view, the panel marks each connection with the same sample, and hovering a connection in the panel picks out its line. The panel lists the connections in words, and which validated designs include the product.
- **Pick a primitive** to read why it matters for AI and what to look for (background explanation, labelled as such), light up everything that provides it, and see which other primitives it integrates with most.
- **Pick a validated design** for the portfolio lens: the Secure AI Factory, the AI PODs and their 2-8-9-400 and 2-8-5-200 designs, and two Cisco Validated Designs for RAG pipelines (FlexPod with NetApp, FlashStack with Pure Storage). The products the design includes light up, each primitive shows how many of its products are covered ("2 of 6"), and the panel names the primitives the design leaves open. A CVD also shows its bill of materials as published, and lists what it uses that this map does not cover (for example the Webex chat bot or the Milvus vector database).

- **Pick a customer use case** (for example *Enterprise RAG assistant*) to outline the products the scenario needs: a solid outline for required, dashed for recommended. Then **check it against a design**. Every need the design meets gets a tick, every gap a plus, and the panel says in words how many required and recommended needs the design meets and what is still to find. Any design can be checked against any use case, so a design built for something else shows its gaps honestly (the AI POD hardware meets 1 of the 8 things the RAG use case requires).

Filled hexes are Cisco, open hexes are partners, and a dashed outline means the entry is not yet confirmed against a public page. Every selection has its own URL (`#/product/n9364e`, `#/primitive/security`, `#/design/ai-pod`, `#/usecase/enterprise-rag/flashstack-rag`), so the back button works and any view can be shared. Escape clears the selection, and every hex is reachable with the keyboard.

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
- [`src/data/details.js`](src/data/details.js) holds the fuller description, three to five named features, source links and any caveat for every product, and the background text for each primitive. Features are what the vendor states, not independent measurements. Anything unconfirmed, early access or in conflict between sources carries a `caveat`, and the tests fail if an unverified product has none.
- [`src/data/usecases.js`](src/data/usecases.js) holds the customer use cases. Each lists the needs (one product, or several that are alternatives to each other) with a role of `required` or `recommended` and a reason, and the designs that are validated ways to deliver it. A use case is `sourced` when its required needs come from published design guides, or `draft` when they are an editorial reading and need review. Recommended needs are always editorial. A product can appear in only one need per use case.
- To add a validated design, add a node with `kind: 'design'` and "contains" links to what it includes. A design that publishes a bill of materials can carry `bom` (the lines as published) and `offMap` (what it uses that is not a product on the map). Coverage follows `composes` links downward, so a design that contains another design includes everything inside it. A product family and its models use a separate `models` link, which does not count: a design that uses the Nexus 9000 family has not necessarily used every model.

Line styles live in [`src/map/linkstyle.js`](src/map/linkstyle.js): eight relationship types collapse into six visual styles (structure, runs on, carries traffic, manages, secures, data flow), and a test fails if any type has no style or two styles look alike. The tests also fail if a use case names a product that does not exist, a design a sourced use case lists fails to meet one of its required needs, a link points at a product that does not exist, a product has no source, an integration reads the same from both ends, a primitive's products do not form one connected clump on the map, or a label is too long for its hexagon.

### Accuracy

Cisco renames and repackages products often, and some details in the public sources disagree (for example which ASIC is in the Nexus 9364E-SG2). Anything not confirmed is marked `check` and shows as unverified. Re-check before using this in front of a customer. Which primitive a product belongs to, and the order of the hexes, are editorial choices, not Cisco's.

## How it is built

React and Vite, with no other runtime dependencies. The map is a single SVG. Its layout, in [`src/map/hexgrid.js`](src/map/hexgrid.js), is pure geometry on a hexagonal grid and is tested without a browser. It is static files, so it runs on any static host, including the free tiers.
