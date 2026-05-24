import type { Card } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import { GEM_COLORS } from './GemToken';

interface CardDisplayProps {
  card: Card;
  onClick?: () => void;
  highlight?: boolean;
  compact?: boolean;
}

function formatName(id: string): string {
  return id
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export default function CardDisplay({ card, onClick, highlight, compact }: CardDisplayProps) {
  const costEntries = REGULAR_GEMS.filter((g) => (card.cost[g] ?? 0) > 0);

  return (
    <button
      className={`card card--tier${card.tier} ${highlight ? 'card--highlight' : ''} ${compact ? 'card--compact' : ''}`}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="card__header">
        {card.points > 0 && <span className="card__points">{card.points}</span>}
        <span className="card__bonus" style={{ backgroundColor: GEM_COLORS[card.bonus] }} />
        {card.avengersTagCount > 0 && (
          <span className="card__avengers" title="Avengers tag">
            {'A'.repeat(card.avengersTagCount)}
          </span>
        )}
        {card.tier === 3 && (
          <span className="card__timestone" title="Time Stone">
            T
          </span>
        )}
      </div>
      {!compact && <div className="card__name">{formatName(card.id)}</div>}
      <div className="card__cost">
        {costEntries.map((gem) => (
          <span key={gem} className="card__cost-gem" style={{ backgroundColor: GEM_COLORS[gem] }}>
            {card.cost[gem]}
          </span>
        ))}
      </div>
    </button>
  );
}
