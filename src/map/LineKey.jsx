import React from 'react';
import { styleOf } from './linkstyle.js';

// A drawn sample of a line style, the same pattern, weight and end marker the map uses.
export function LineSample({ style, width = 54 }) {
  const x1 = style.ring ? 11 : 2;
  const x2 = style.ring ? width - 2 : width - 9;
  return (
    <svg className="line-sample" width={width} height="16" viewBox={`0 0 ${width} 16`} aria-hidden="true">
      <line x1={x1} y1="8" x2={x2} y2="8" stroke="var(--accent)" strokeWidth={style.width} strokeDasharray={style.dash} strokeLinecap={style.cap} />
      {style.ring ? (
        <circle cx="6" cy="8" r="3.6" fill="var(--paper)" stroke="var(--accent)" strokeWidth="1.8" />
      ) : (
        <path d={`M${width - 12},3 L${width - 4},8 L${width - 12},13`} fill="none" stroke="var(--accent)" strokeWidth="1.9" strokeLinejoin="round" strokeLinecap="round" />
      )}
    </svg>
  );
}

export const LineSampleFor = ({ type }) => <LineSample style={styleOf(type)} />;

// The key shown on the map whenever lines are drawn: only the styles in view, each with its meaning.
export default function LineKey({ styles, corner }) {
  return (
    <aside className={'line-key' + (corner ? ' ' + corner : '') + (styles.length > 3 ? ' dense' : '')} aria-label="What the lines mean">
      <p className="lk-title">Lines</p>
      <ul>
        {styles.map((s) => (
          <li key={s.id}>
            <LineSample style={s} />
            <span><b>{s.label}</b><i>{s.detail}</i></span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
