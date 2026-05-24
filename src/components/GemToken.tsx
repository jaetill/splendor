import type { GemColor } from '../game/types';

const GEM_COLORS: Record<GemColor, string> = {
  orange: '#FF8C00',
  purple: '#9B59B6',
  red: '#E74C3C',
  blue: '#3498DB',
  yellow: '#F1C40F',
  gray: '#95A5A6',
  green: '#2ECC71',
};

const GEM_LABELS: Record<GemColor, string> = {
  orange: 'Soul',
  purple: 'Power',
  red: 'Reality',
  blue: 'Space',
  yellow: 'Mind',
  gray: 'S.H.I.E.L.D.',
  green: 'Time',
};

interface GemTokenProps {
  gem: GemColor;
  count: number;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function GemToken({
  gem,
  count,
  onClick,
  selected,
  disabled,
  size = 'md',
}: GemTokenProps) {
  return (
    <button
      className={`gem-token gem-token--${size} ${selected ? 'gem-token--selected' : ''}`}
      style={
        {
          '--gem-color': GEM_COLORS[gem],
          opacity: disabled ? 0.4 : 1,
        } as React.CSSProperties
      }
      onClick={onClick}
      disabled={disabled || !onClick}
      title={`${GEM_LABELS[gem]} (${count})`}
    >
      <span className="gem-token__count">{count}</span>
    </button>
  );
}

export { GEM_COLORS, GEM_LABELS };
