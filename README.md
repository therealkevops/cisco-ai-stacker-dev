# The Cisco AI Stack

A clickable diagram of the Cisco AI stack: what each layer is, which products and partners sit in it, and how they integrate.

Three levels, each a plain link, so the back button works and any page can be shared by its URL:

1. **The stack** (`#/`): validated designs frame the whole picture, five layers run top to bottom (platform, data, network, compute, silicon), and security and operations run alongside all of them.
2. **A layer** (`#/layer/network`): its products, and every integration that leaves the layer, grouped by the layer it reaches.
3. **A product** (`#/node/n9364e`): what it is, a link to its source, and its integrations written out from its point of view ("Contains", "Is part of", "Manages", "Is managed by"…).

Filled dots are Cisco, open dots are partners, and a dashed outline means the entry is not yet confirmed against a public page.

## Running it

```
npm install
npm run dev      # http://localhost:8999
npm test         # data integrity and navigation
npm run lint
npm run build    # static files in dist/, ready for Vercel or any static host
```

## Where the content lives

Everything is in [`src/data/stack.js`](src/data/stack.js): the layers, the products and the integrations, each with a `status` of `sourced` or `check` and a source URL. Integrations are directional (a to b), so "Nexus 9000 contains Nexus 9364E-SG2" reads correctly from both ends. The tests fail if a link points at a product that does not exist, a product has no source, the graph falls into separate pieces, or an integration reads the same from both ends.

To add a product, add an entry to `NODES` and at least one `L(...)` line to `LINKS`.

### Accuracy

Cisco renames and repackages products often, and some details in the public sources disagree (for example which ASIC is in the Nexus 9364E-SG2). Anything not confirmed is marked `check` and shows as unverified. Re-check before using this in front of a customer.

## How it is built

React and Vite, no other runtime dependencies. Routing is the URL hash, and every view is static HTML, so it loads instantly and runs on any static host.
