import type { GameState } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import { GEM_COLORS } from './GemToken';
import CardDisplay from './CardDisplay';

interface PlayerPanelProps {
  game: GameState;
  playerIndex: number;
  name: string;
  isCurrentPlayer: boolean;
  onSelectReservedCard?: (card: import('../game/types').Card) => void;
}

function effectivePoints(game: GameState, playerIndex: number): number {
  return game.players[playerIndex].points + (game.avengersAssembleTile === playerIndex ? 3 : 0);
}

export default function PlayerPanel({
  game,
  playerIndex,
  name,
  isCurrentPlayer,
  onSelectReservedCard,
}: PlayerPanelProps) {
  const player = game.players[playerIndex];
  const ep = effectivePoints(game, playerIndex);

  return (
    <div className={`player-panel ${isCurrentPlayer ? 'player-panel--active' : ''}`}>
      <div className="player-panel__header">
        <span className="player-panel__name">{name}</span>
        <span className="player-panel__points">{ep} pts</span>
        {game.avengersAssembleTile === playerIndex && (
          <span className="player-panel__badge" title="Avengers Assemble">
            A
          </span>
        )}
        {player.hasGreenToken && (
          <span className="player-panel__badge player-panel__badge--green" title="Time Stone">
            T
          </span>
        )}
      </div>

      {/* Gems in hand */}
      <div className="player-panel__gems">
        {REGULAR_GEMS.map((gem) => (
          <div key={gem} className="player-panel__gem" title={gem}>
            <span className="player-panel__gem-dot" style={{ backgroundColor: GEM_COLORS[gem] }} />
            <span className="player-panel__gem-count">
              {player.gems[gem]}
              {player.bonuses[gem] > 0 && (
                <span className="player-panel__bonus">+{player.bonuses[gem]}</span>
              )}
            </span>
          </div>
        ))}
        {player.gems.gray > 0 && (
          <div className="player-panel__gem" title="S.H.I.E.L.D.">
            <span className="player-panel__gem-dot" style={{ backgroundColor: GEM_COLORS.gray }} />
            <span className="player-panel__gem-count">{player.gems.gray}</span>
          </div>
        )}
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

      {/* Recruited summary */}
      <div className="player-panel__recruited">
        <span className="player-panel__label">
          {player.recruited.length} card{player.recruited.length !== 1 ? 's' : ''} recruited
        </span>
        {player.locations.length > 0 && (
          <span className="player-panel__label">
            {' '}
            · {player.locations.length} location{player.locations.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
