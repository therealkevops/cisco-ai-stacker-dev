# The Cisco AI Stack

A clickable diagram of the Cisco AI stack: what each layer is, which products and partners sit in it, and how they integrate.

## Using it

**The stack** is the home page. Validated designs frame the whole picture, five layers run top to bottom (platform, data, network, compute, silicon), and security and operations run alongside all of them.

- **Pick a product** and everything unrelated fades. Curved lines with arrowheads run from it to everything it connects to, wherever that sits in the stack. Line style tells the relationship apart (solid-ringed for "contains", dashed for "carries traffic", dash-dot for "secures", and so on). A tray at the foot of the screen lists the connections in words; hover one to see the line and what the integration is, click it to move across.
- **Follow a journey** for a guided path through the stack, one step at a time: *Build an AI cluster*, *Secure it* and *Operate it*. Each step lights up its products and the lines between them, with a short explanation. Use Back and Next, the arrow keys or the numbered buttons; Escape leaves.
- **Open a layer** (click its name) for its products and everything that leaves the layer, grouped by the layer it reaches.
- **Open a product page** for its integrations written from its own point of view ("Contains", "Is part of", "Manages", "Is managed by"…), with a link to its source.

Filled dots are Cisco, open dots are partners, and a dashed outline means the entry is not yet confirmed against a public page. Every view has its own URL (`#/pick/n9364e`, `#/journey/secure/2`, `#/layer/network`, `#/node/ai-defense`), so the back button works and any view can be shared.

On a phone the lines are hidden, because they would be too cramped; the same connections are listed in the tray.

## Running it

```
npm install
npm run dev      # http://localhost:8999
npm test         # data integrity, navigation, line routing and journeys
npm run lint
npm run build    # static files in dist/, ready for Vercel or any static host
```

## Where the content lives

- [`src/data/stack.js`](src/data/stack.js): the layers, the products and the integrations, each with a `status` of `sourced` or `check` and a source URL. Integrations are directional (a to b), so "Nexus 9000 contains Nexus 9364E-SG2" reads correctly from both ends. To add a product, add an entry to `NODES` and at least one `L(...)` line to `LINKS`.
- [`src/data/journeys.js`](src/data/journeys.js): the guided journeys. Each step names the products it lights up and the sentences shown with it.

The tests fail if a link points at a product that does not exist, a product has no source, an integration reads the same from both ends, a journey step names a missing product or lights up something with no connection, or a step involves an unverified entry without saying so.

### Accuracy

Cisco renames and repackages products often, and some details in the public sources disagree (for example which ASIC is in the Nexus 9364E-SG2). Anything not confirmed is marked `check` and shows as unverified, and journey steps say so in their text. Re-check before using this in front of a customer.

## How it is built

React and Vite, no other runtime dependencies. Routing is the URL hash. The lines are SVG paths computed by [`src/views/geometry.js`](src/views/geometry.js), a pure module that picks the sides of each chip to leave and arrive by and spreads lines that share a side so they do not stack. The whole site is static files, so it runs on any static host, including the free tiers.
