import type { GameState, RegularGem } from '../game/types';
import { REGULAR_GEMS } from '../game/types';
import type { ActionState } from '../hooks/useGame';
import GemToken from './GemToken';

interface GemBankProps {
  game: GameState;
  action: ActionState;
  confirmError?: string | null;
  onSelectGem: (gem: RegularGem) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GemBank({
  game,
  action,
  confirmError,
  onSelectGem,
  onConfirm,
  onCancel,
}: GemBankProps) {
  const selected = action.type === 'selectingGems' ? action.selected : [];
  const isTake2 = selected.length === 2 && selected[0] === selected[1];
  const canConfirm = selected.length >= 1 && !confirmError;

  // How many of each color are currently staged (for the ×2 take-2 badge).
  const selectedCount = (gem: RegularGem) => selected.filter((g) => g === gem).length;

  // One color staged and the bank can support a take-2 → nudge toward it rather
  // than scolding "pick 3" (Confirm is still disabled until they complete a move).
  const lone = selected.length === 1 ? selected[0] : null;
  const canStartTake2 = lone !== null && game.gems[lone] >= 4;

  let hint: string;
  let warn = false;
  if (isTake2 && !confirmError) {
    hint = `Take 2 ${selected[0]}`;
  } else if (canStartTake2 && !isTake2) {
    hint = `Take ${lone} — or click it again to take 2`;
  } else if (confirmError) {
    hint = confirmError;
    warn = true;
  } else {
    hint = `Take ${selected.length} gem${selected.length !== 1 ? 's' : ''}`;
  }

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
            selectedCount={selectedCount(gem)}
            disabled={game.gems[gem] === 0}
          />
        ))}
        <GemToken gem="gray" count={game.gems.gray} size="md" />
        <GemToken gem="green" count={game.gems.green} size="md" />
      </div>

      <p className="gem-bank__instructions">
        Take 3 different gems — or click one color twice to take 2 of a kind (needs 4+ in the bank).
      </p>

      {action.type === 'selectingGems' && (
        <div className="gem-bank__actions">
          <span className={`gem-bank__hint ${warn ? 'gem-bank__hint--warn' : ''}`}>{hint}</span>
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
