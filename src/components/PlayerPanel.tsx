import type { Card, GameState, GemColor } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import { GEM_COLORS, GEM_LABELS } from './GemToken';
import CardDisplay from './CardDisplay';

interface PlayerPanelProps {
  game: GameState;
  playerIndex: number;
  name: string;
  isCurrentPlayer: boolean;
  affordableCardIds?: ReadonlySet<string>;
  onSelectReservedCard?: (card: Card) => void;
}

// Tokens display order: the five regular stones, then S.H.I.E.L.D. (gray) and Time (green).
const TOKEN_COLORS: GemColor[] = [...REGULAR_GEMS, 'gray', 'green'];

function effectivePoints(game: GameState, playerIndex: number): number {
  return game.players[playerIndex].points + (game.avengersAssembleTile === playerIndex ? 3 : 0);
}

function Chip({ gem, count, dim }: { gem: GemColor; count: number; dim?: boolean }) {
  return (
    <span className={`chip ${dim ? 'chip--dim' : ''}`} title={`${GEM_LABELS[gem]}: ${count}`}>
      <span className="chip__dot" style={{ backgroundColor: GEM_COLORS[gem] }} />
      <span className="chip__count">{count}</span>
    </span>
  );
}

export default function PlayerPanel({
  game,
  playerIndex,
  name,
  isCurrentPlayer,
  affordableCardIds,
  onSelectReservedCard,
}: PlayerPanelProps) {
  const player = game.players[playerIndex];
  const ep = effectivePoints(game, playerIndex);
  const totalTokens = TOKEN_COLORS.reduce((sum, g) => sum + player.gems[g], 0);
  const holdsTile = game.avengersAssembleTile === playerIndex;

  return (
    <div className={`player-panel ${isCurrentPlayer ? 'player-panel--active' : ''}`}>
      <div className="player-panel__header">
        <span className="player-panel__name">{name}</span>
        <span className="player-panel__points">{ep} pts</span>
        <span
          className={`player-panel__avengers ${holdsTile ? 'player-panel__avengers--holder' : ''}`}
          title={
            holdsTile
              ? `Holds the Avengers Assemble tile (+3 pts) — ${player.avengersTagCount} tags`
              : `Avengers tags: ${player.avengersTagCount}`
          }
        >
          A {player.avengersTagCount}
        </span>
        {player.hasGreenToken && (
          <span className="player-panel__badge player-panel__badge--green" title="Time Stone">
            T
          </span>
        )}
      </div>

      {/* Tokens in hand (spendable) */}
      <div className="player-panel__section">
        <span className="player-panel__label">Tokens ({totalTokens})</span>
        <div className="player-panel__chips">
          {TOKEN_COLORS.map((gem) => (
            <Chip key={gem} gem={gem} count={player.gems[gem]} dim={player.gems[gem] === 0} />
          ))}
        </div>
      </div>

      {/* Permanent discounts from recruited cards */}
      <div className="player-panel__section">
        <span className="player-panel__label">
          Bonuses · {player.recruited.length} card{player.recruited.length !== 1 ? 's' : ''}
          {player.locations.length > 0 &&
            ` · ${player.locations.length} location${player.locations.length !== 1 ? 's' : ''}`}
        </span>
        <div className="player-panel__chips">
          {REGULAR_GEMS.map((gem) => (
            <Chip key={gem} gem={gem} count={player.bonuses[gem]} dim={player.bonuses[gem] === 0} />
          ))}
        </div>
      </div>

      {/* Reserved cards */}
      {player.reserved.length > 0 && (
        <div className="player-panel__reserved">
          <span className="player-panel__label">Reserved ({player.reserved.length}/3)</span>
          <div className="player-panel__reserved-cards">
            {player.reserved.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                compact
                affordable={affordableCardIds?.has(card.id)}
                onClick={
                  isCurrentPlayer && onSelectReservedCard
                    ? () => onSelectReservedCard(card)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
