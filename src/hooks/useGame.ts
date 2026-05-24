import { useCallback, useState } from 'react';
import type { Card, GameState, Move, RegularGem } from '../game/types';
import { applyMove, createGame, isLegalMove } from '../game/engine';
import { getLegalMoves } from '../game/moves';

// ── Interaction state ───────────────────────────────────────────────────────

export type ActionState =
  | { type: 'idle' }
  | { type: 'selectingGems'; selected: RegularGem[] }
  | { type: 'cardAction'; card: Card; canRecruit: boolean; canReserve: boolean };

export interface GameActions {
  startGame: (numPlayers: number) => void;
  // Gem selection
  selectGem: (gem: RegularGem) => void;
  confirmTakeGems: () => void;
  // Card actions
  selectCard: (card: Card) => void;
  recruitCard: () => void;
  reserveCard: () => void;
  reserveFromDeck: (tier: 1 | 2 | 3) => void;
  // General
  cancelAction: () => void;
  pass: () => void;
  resetToSetup: () => void;
}

export interface UseGameReturn {
  game: GameState | null;
  action: ActionState;
  legalMoves: Move[];
  actions: GameActions;
  moveLog: Move[];
}

export function useGame(): UseGameReturn {
  const [game, setGame] = useState<GameState | null>(null);
  const [action, setAction] = useState<ActionState>({ type: 'idle' });
  const [moveLog, setMoveLog] = useState<Move[]>([]);

  const legalMoves = game && game.phase !== 'ended' ? getLegalMoves(game) : [];

  const doMove = useCallback((state: GameState, move: Move): GameState => {
    const next = applyMove(state, move);
    setMoveLog((log) => [...log, move]);
    setAction({ type: 'idle' });
    setGame(next);
    return next;
  }, []);

  const startGame = useCallback((numPlayers: number) => {
    setGame(createGame(numPlayers));
    setAction({ type: 'idle' });
    setMoveLog([]);
  }, []);

  const selectGem = useCallback((gem: RegularGem) => {
    setAction((prev) => {
      const selected = prev.type === 'selectingGems' ? [...prev.selected] : [];

      // Toggle: if already selected, remove it
      const idx = selected.indexOf(gem);
      if (idx >= 0) {
        selected.splice(idx, 1);
        return selected.length === 0 ? { type: 'idle' } : { type: 'selectingGems', selected };
      }

      // Add gem — max 3 distinct or 2 of same
      selected.push(gem);

      // If player selected 2 of the same gem, that's a take2 — lock it
      if (selected.length === 2 && selected[0] === selected[1]) {
        return { type: 'selectingGems', selected };
      }

      // Cap at 3 distinct
      if (selected.length > 3) return prev;

      // Ensure all distinct for take3
      if (new Set(selected).size !== selected.length) return prev;

      return { type: 'selectingGems', selected };
    });
  }, []);

  const confirmTakeGems = useCallback(() => {
    if (!game || action.type !== 'selectingGems') return;
    const { selected } = action;

    // Determine move type
    if (selected.length === 2 && selected[0] === selected[1]) {
      const move: Move = { type: 'take2', gem: selected[0] };
      if (isLegalMove(game, move)) doMove(game, move);
    } else {
      const move: Move = { type: 'take3', gems: selected };
      if (isLegalMove(game, move)) doMove(game, move);
    }
  }, [game, action, doMove]);

  const selectCard = useCallback(
    (card: Card) => {
      if (!game) return;
      const player = game.players[game.currentPlayer];
      const canRecruit = isLegalMove(game, { type: 'recruit', card });
      const canReserve =
        player.reserved.length < 3 &&
        (isLegalMove(game, { type: 'reserveBoard', card }) ||
          player.reserved.some((c) => c.id === card.id)); // already reserved — can't re-reserve
      setAction({
        type: 'cardAction',
        card,
        canRecruit,
        canReserve: canReserve && !player.reserved.some((c) => c.id === card.id),
      });
    },
    [game],
  );

  const recruitCard = useCallback(() => {
    if (!game || action.type !== 'cardAction') return;
    const move: Move = { type: 'recruit', card: action.card };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, action, doMove]);

  const reserveCard = useCallback(() => {
    if (!game || action.type !== 'cardAction') return;
    const move: Move = { type: 'reserveBoard', card: action.card };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, action, doMove]);

  const reserveFromDeck = useCallback(
    (tier: 1 | 2 | 3) => {
      if (!game) return;
      const move: Move = { type: 'reserveDeck', tier };
      if (isLegalMove(game, move)) doMove(game, move);
    },
    [game, doMove],
  );

  const cancelAction = useCallback(() => {
    setAction({ type: 'idle' });
  }, []);

  const pass = useCallback(() => {
    if (!game) return;
    const move: Move = { type: 'pass' };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, doMove]);

  const resetToSetup = useCallback(() => {
    setGame(null);
    setAction({ type: 'idle' });
    setMoveLog([]);
  }, []);

  return {
    game,
    action,
    legalMoves,
    actions: {
      startGame,
      selectGem,
      confirmTakeGems,
      selectCard,
      recruitCard,
      reserveCard,
      reserveFromDeck,
      cancelAction,
      pass,
      resetToSetup,
    },
    moveLog,
  };
}
