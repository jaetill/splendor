import { useCallback, useEffect, useMemo, useState } from 'react';
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
  /** Ids of board/reserved cards the current human player can recruit right now. */
  affordableCardIds: ReadonlySet<string>;
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

  // Cards the current (human) player could recruit this turn — used to highlight
  // affordable cards on the board and in hand.
  const affordableCardIds = useMemo<ReadonlySet<string>>(() => {
    const ids = new Set<string>();
    if (!game || !isHumanTurn) return ids;
    const me = game.players[game.currentPlayer];
    const candidates = [
      ...game.board.tier1,
      ...game.board.tier2,
      ...game.board.tier3,
      ...me.reserved,
    ];
    for (const card of candidates) {
      if (isLegalMove(game, { type: 'recruit', card })) ids.add(card.id);
    }
    return ids;
  }, [game, isHumanTurn]);

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

  // Gem clicks build either a take-3 (up to 3 distinct colors) or a take-2 (the
  // same color twice). Clicking a single-selected color a second time promotes
  // it to a take-2 (if the bank has 4+); clicking it again clears it.
  const selectGem = useCallback(
    (gem: RegularGem) => {
      if (!game || !isHumanTurn) return;
      const bank = game.gems;
      setAction((prev) => {
        const selected = prev.type === 'selectingGems' ? [...prev.selected] : [];
        const isTake2 = selected.length === 2 && selected[0] === selected[1];

        // A take-2 is staged: clicking the same color clears it, another color resets.
        if (isTake2) {
          if (selected[0] === gem) return { type: 'idle' };
          return bank[gem] >= 1 ? { type: 'selectingGems', selected: [gem] } : prev;
        }

        const alreadyPicked = selected.includes(gem);

        // Single color picked, clicked again → promote to take-2 if the bank allows it.
        if (alreadyPicked && selected.length === 1) {
          return bank[gem] >= 4
            ? { type: 'selectingGems', selected: [gem, gem] }
            : { type: 'idle' };
        }

        // Picked among several → clicking removes it.
        if (alreadyPicked) {
          const next = selected.filter((g) => g !== gem);
          return next.length === 0 ? { type: 'idle' } : { type: 'selectingGems', selected: next };
        }

        // New color → add it to a take-3 (max 3 distinct), only if it's in the bank.
        if (selected.length >= 3 || bank[gem] < 1) return prev;
        return { type: 'selectingGems', selected: [...selected, gem] };
      });
    },
    [game, isHumanTurn],
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
    affordableCardIds,
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
