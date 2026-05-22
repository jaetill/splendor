import { useCallback, useEffect, useState } from 'react';
import type { Card, GameState, Move, RegularGem } from '../game/types';
import { applyMove, createGame, isLegalMove } from '../game/engine';
import { getLegalMoves } from '../game/moves';
import { randomAI } from '../ai/random';

// ── Interaction state ───────────────────────────────────────────────────────

export type ActionState =
  | { type: 'idle' }
  | { type: 'selectingGems'; selected: RegularGem[] }
  | { type: 'cardAction'; card: Card; canRecruit: boolean; canReserve: boolean };

// Pause between bot moves so a human can follow what's happening (ms).
const AI_MOVE_DELAY = 700;

export interface GameActions {
  /** Start a game with `humans` human seats (first) followed by `bots` random-AI seats. */
  startGame: (humans: number, bots: number) => void;
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
  /** Seat indices controlled by the random AI. */
  aiPlayers: readonly number[];
  /** True when the current player is human and the game is still going. */
  isHumanTurn: boolean;
  actions: GameActions;
  moveLog: Move[];
}

export function useGame(): UseGameReturn {
  const [game, setGame] = useState<GameState | null>(null);
  const [aiPlayers, setAiPlayers] = useState<readonly number[]>([]);
  const [action, setAction] = useState<ActionState>({ type: 'idle' });
  const [moveLog, setMoveLog] = useState<Move[]>([]);

  const legalMoves = game && game.phase !== 'ended' ? getLegalMoves(game) : [];
  const isAITurn = !!game && game.phase !== 'ended' && aiPlayers.includes(game.currentPlayer);
  const isHumanTurn = !!game && game.phase !== 'ended' && !isAITurn;

  const doMove = useCallback((state: GameState, move: Move): GameState => {
    const next = applyMove(state, move);
    setMoveLog((log) => [...log, move]);
    setAction({ type: 'idle' });
    setGame(next);
    return next;
  }, []);

  // Auto-play bot turns. Re-runs on every game change, so consecutive bots chain
  // (each move advances currentPlayer, re-firing this effect) and it stops on a
  // human turn or game end. The timer is cleared if the game changes first.
  useEffect(() => {
    if (!game || game.phase === 'ended') return;
    if (!aiPlayers.includes(game.currentPlayer)) return;
    const id = setTimeout(() => {
      const move = randomAI.selectMove(game, game.currentPlayer);
      setMoveLog((log) => [...log, move]);
      setAction({ type: 'idle' });
      setGame(applyMove(game, move));
    }, AI_MOVE_DELAY);
    return () => clearTimeout(id);
  }, [game, aiPlayers]);

  const startGame = useCallback((humans: number, bots: number) => {
    const total = humans + bots;
    setGame(createGame(total));
    setAiPlayers(Array.from({ length: bots }, (_, i) => humans + i));
    setAction({ type: 'idle' });
    setMoveLog([]);
  }, []);

  const selectGem = useCallback(
    (gem: RegularGem) => {
      if (!isHumanTurn) return;
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
    },
    [isHumanTurn],
  );

  const confirmTakeGems = useCallback(() => {
    if (!game || !isHumanTurn || action.type !== 'selectingGems') return;
    const { selected } = action;

    // Determine move type
    if (selected.length === 2 && selected[0] === selected[1]) {
      const move: Move = { type: 'take2', gem: selected[0] };
      if (isLegalMove(game, move)) doMove(game, move);
    } else {
      const move: Move = { type: 'take3', gems: selected };
      if (isLegalMove(game, move)) doMove(game, move);
    }
  }, [game, isHumanTurn, action, doMove]);

  const selectCard = useCallback(
    (card: Card) => {
      if (!game || !isHumanTurn) return;
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
    [game, isHumanTurn],
  );

  const recruitCard = useCallback(() => {
    if (!game || !isHumanTurn || action.type !== 'cardAction') return;
    const move: Move = { type: 'recruit', card: action.card };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, isHumanTurn, action, doMove]);

  const reserveCard = useCallback(() => {
    if (!game || !isHumanTurn || action.type !== 'cardAction') return;
    const move: Move = { type: 'reserveBoard', card: action.card };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, isHumanTurn, action, doMove]);

  const reserveFromDeck = useCallback(
    (tier: 1 | 2 | 3) => {
      if (!game || !isHumanTurn) return;
      const move: Move = { type: 'reserveDeck', tier };
      if (isLegalMove(game, move)) doMove(game, move);
    },
    [game, isHumanTurn, doMove],
  );

  const cancelAction = useCallback(() => {
    setAction({ type: 'idle' });
  }, []);

  const pass = useCallback(() => {
    if (!game || !isHumanTurn) return;
    const move: Move = { type: 'pass' };
    if (isLegalMove(game, move)) doMove(game, move);
  }, [game, isHumanTurn, doMove]);

  const resetToSetup = useCallback(() => {
    setGame(null);
    setAiPlayers([]);
    setAction({ type: 'idle' });
    setMoveLog([]);
  }, []);

  return {
    game,
    action,
    legalMoves,
    aiPlayers,
    isHumanTurn,
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
