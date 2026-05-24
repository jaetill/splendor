import type { GameState, RegularGem } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import type { ActionState } from '../hooks/useGame';
import GemToken from './GemToken';

interface GemBankProps {
  game: GameState;
  action: ActionState;
  onSelectGem: (gem: RegularGem) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GemBank({ game, action, onSelectGem, onConfirm, onCancel }: GemBankProps) {
  const selected = action.type === 'selectingGems' ? action.selected : [];

  // Check if a take3 or take2 move is valid with current selection
  const canConfirm = selected.length >= 1;

  return (
    <div className="gem-bank">
      <h3 className="gem-bank__title">Gem Supply</h3>
      <div className="gem-bank__tokens">
        {REGULAR_GEMS.map((gem) => (
          <GemToken
            key={gem}
            gem={gem}
            count={game.gems[gem]}
            onClick={() => onSelectGem(gem)}
            selected={selected.includes(gem)}
            disabled={game.gems[gem] === 0}
          />
        ))}
        <GemToken gem="gray" count={game.gems.gray} size="md" />
        <GemToken gem="green" count={game.gems.green} size="md" />
      </div>
      {action.type === 'selectingGems' && (
        <div className="gem-bank__actions">
          <span className="gem-bank__hint">
            {selected.length === 2 && selected[0] === selected[1]
              ? `Take 2 ${selected[0]}`
              : `Take ${selected.length} gem${selected.length !== 1 ? 's' : ''}`}
          </span>
          <button className="btn btn--primary" onClick={onConfirm} disabled={!canConfirm}>
            Confirm
          </button>
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
