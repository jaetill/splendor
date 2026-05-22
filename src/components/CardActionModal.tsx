import type { Card } from '../game/types';
import CardDisplay from './CardDisplay';

interface CardActionModalProps {
  card: Card;
  canRecruit: boolean;
  canReserve: boolean;
  onRecruit: () => void;
  onReserve: () => void;
  onCancel: () => void;
}

export default function CardActionModal({
  card,
  canRecruit,
  canReserve,
  onRecruit,
  onReserve,
  onCancel,
}: CardActionModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <CardDisplay card={card} />
        <div className="modal__actions">
          {canRecruit && (
            <button className="btn btn--primary" onClick={onRecruit}>
              Recruit
            </button>
          )}
          {canReserve && (
            <button className="btn btn--secondary" onClick={onReserve}>
              Reserve
            </button>
          )}
          <button className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
