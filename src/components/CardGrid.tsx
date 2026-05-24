import type { Card, GameState } from '../game/types';
import type { ActionState } from '../hooks/useGame';
import CardDisplay from './CardDisplay';

interface CardGridProps {
  game: GameState;
  action: ActionState;
  onSelectCard: (card: Card) => void;
  onReserveFromDeck: (tier: 1 | 2 | 3) => void;
}

const TIERS = [3, 2, 1] as const; // Display tier 3 at top

export default function CardGrid({ game, action, onSelectCard, onReserveFromDeck }: CardGridProps) {
  const selectedCardId = action.type === 'cardAction' ? action.card.id : null;

  return (
    <div className="card-grid">
      {TIERS.map((tier) => {
        const tierKey = `tier${tier}` as 'tier1' | 'tier2' | 'tier3';
        const cards = game.board[tierKey];
        const deckCount = game.decks[tierKey].length;

        return (
          <div key={tier} className="card-grid__row">
            <button
              className="card-grid__deck"
              onClick={() => onReserveFromDeck(tier)}
              disabled={deckCount === 0}
              title={`Reserve from Tier ${tier} deck (${deckCount} left)`}
            >
              <span className="card-grid__deck-tier">T{tier}</span>
              <span className="card-grid__deck-count">{deckCount}</span>
            </button>
            {cards.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                onClick={() => onSelectCard(card)}
                highlight={card.id === selectedCardId}
              />
            ))}
            {/* Empty slots */}
            {Array.from({ length: 4 - cards.length }).map((_, i) => (
              <div key={`empty-${tier}-${i}`} className="card card--empty" />
            ))}
          </div>
        );
      })}
    </div>
  );
}
