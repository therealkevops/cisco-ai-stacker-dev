import React from 'react';

// Filled dot for Cisco, open dot for a partner. Meaning is also in the text of every use, so the
// dot is a hint rather than the only signal.
export function VendorDot({ vendor }) {
  return <span className={'dot ' + (vendor === 'cisco' ? 'filled' : 'open')} aria-hidden="true" />;
}

export function Legend() {
  return (
    <p className="legend">
      <span><span className="dot filled" aria-hidden="true" /> Cisco</span>
      <span><span className="dot open" aria-hidden="true" /> Partner</span>
      <span><span className="swatch dashed" aria-hidden="true" /> Not yet confirmed against a public page</span>
    </p>
  );
}
