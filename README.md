# The Cisco AI Stack, in orbit

An interactive chart of the Cisco AI stack and the integrations between its parts, drawn as an orrery. Each layer is an orbit, each product or partner is a body on it, and each integration is a line between two bodies.

Heavy hardware sits on the inner orbits and software and agents on the outer ones. Every body is held to its orbit by a spring ("gravity"), pushed apart from its neighbours, and tugged by its integrations. The orbits turn slowly, in opposite directions on neighbouring rings.

## Using it

- **Drag** a body and let go: it falls back into orbit. **Drag the background** to pan, **scroll** to zoom.
- **Select** a body (click it, or pick it from the list) and its integration partners are released from their orbits and fall in toward it. Everything else dims.
- **Gravity** slider: at zero the bodies drift free of their orbits, at two the chart goes rigid.
- **Integrations** legend: click a type to hide it. Types are told apart by dash pattern, not colour.
- A selection is stored in the URL hash, so `#/ai-canvas` links straight to that body.

Filled circles are Cisco, open circles are partners, and a bar through a body means it is not yet confirmed against a public page.

## Running it

```
npm install
npm run dev      # http://localhost:8999
npm test         # data integrity and physics
npm run lint
npm run build
```

## Where the content lives

All of the content is in [`src/data/stack.js`](src/data/stack.js): the orbits, the bodies and the links, each with a `status` of `sourced` or `check` and a source URL. The tests fail if a link points at a body that does not exist, a body has no source, or the graph falls into separate pieces.

To add a body, add an entry to `NODES` and at least one `L(...)` line to `LINKS`.

### Accuracy

Cisco renames and repackages products often, and some details in the public sources disagree (for example which ASIC is in the Nexus 9364E-SG2). Anything not confirmed is marked `check` and shows as unverified in the chart. Re-check before using this in front of a customer.

## How it is built

React and Vite, with no chart or physics library. The physics is a small fixed-step simulation in [`src/sim/physics.js`](src/sim/physics.js), free of the DOM so it is tested under Node. The drawing is plain Canvas 2D in [`src/render/draw.js`](src/render/draw.js).
