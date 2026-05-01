import type { JSX } from 'react';

export default function SinceBadge(props: { version?: string; useSup?: boolean }): JSX.Element | null {
  if (!props.version) {
    return null;
  }

  const useSup = props.useSup ?? true;
  const badge = (
    <span
      className="since-badge"
      style={{
        display: 'inline-block',
        borderRadius: '999px',
        fontSize: '10px',
        fontWeight: 700,
        lineHeight: 1,
        padding: '0.15rem 0.4rem',
        whiteSpace: 'nowrap',
      }}
    >
      <code>v{props.version}</code>
    </span>
  );

  if (useSup) {
    return <sup style={{ marginLeft: '0.1rem' }}>{badge}</sup>;
  } else {
    return badge;
  }
}
