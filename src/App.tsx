import { useGame } from './hooks/useGame';
import GemBank from './components/GemBank';
import CardGrid from './components/CardGrid';
import CardActionModal from './components/CardActionModal';
import LocationRow from './components/LocationRow';
import PlayerPanel from './components/PlayerPanel';
import { logout } from './auth/auth';
import './App.css';

function SetupScreen({ onStart }: { onStart: (humans: number, bots: number) => void }) {
  return (
    <div className="setup">
      <a className="apps-link" href="https://jaetill.com/">
        ← Apps
      </a>
      <h1 className="setup__title">Splendor</h1>
      <p className="setup__subtitle">Marvel Edition</p>

      <div className="setup__group">
        <span className="setup__group-label">Play vs. bots</span>
        <div className="setup__options">
          {[1, 2, 3].map((bots) => (
            <button
              key={bots}
              className="btn btn--primary btn--large"
              onClick={() => onStart(1, bots)}
            >
              {bots} Bot{bots > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="setup__group">
        <span className="setup__group-label">Pass &amp; play (all human)</span>
        <div className="setup__options">
          {[2, 3, 4].map((n) => (
            <button key={n} className="btn btn--secondary btn--large" onClick={() => onStart(n, 0)}>
              {n} Players
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { game, action, aiPlayers, isHumanTurn, affordableCardIds, confirmError, actions } =
    useGame();

  if (!game) {
    return <SetupScreen onStart={actions.startGame} />;
  }

  const humanCount = game.players.length - aiPlayers.length;
  const playerName = (i: number): string => {
    const botIdx = aiPlayers.indexOf(i);
    if (botIdx >= 0) return `Bot ${botIdx + 1}`;
    return humanCount === 1 ? 'You' : `Player ${i + 1}`;
  };

  const waiting = game.phase !== 'ended' && !isHumanTurn;

  return (
    <div className="game">
      {/* Status bar */}
      <header className="game__header">
        <a className="apps-link" href="https://jaetill.com/">
          ← Apps
        </a>
        <h1 className="game__title">Splendor</h1>
        {game.phase === 'ended' ? (
          <span className="game__status game__status--ended">
            {playerName(game.winner!) === 'You' ? 'You win!' : `${playerName(game.winner!)} wins!`}
          </span>
        ) : (
          <span className="game__status">
            {(() => {
              const name = playerName(game.currentPlayer);
              if (!isHumanTurn) return `${name} is thinking…`;
              return name === 'You' ? 'Your turn' : `${name}'s turn`;
            })()}
            {game.phase === 'lastRound' && ' (last round)'}
          </span>
        )}
        <button className="btn btn--ghost" onClick={actions.resetToSetup}>
          New Game
        </button>
        <button className="btn btn--ghost" onClick={logout}>
          Sign out
        </button>
      </header>

      <div className="game__layout">
        {/* Left: player panels */}
        <aside className="game__players">
          {game.players.map((_, i) => (
            <PlayerPanel
              key={i}
              game={game}
              playerIndex={i}
              name={playerName(i)}
              isCurrentPlayer={i === game.currentPlayer && game.phase !== 'ended'}
              affordableCardIds={affordableCardIds}
              onSelectReservedCard={isHumanTurn ? actions.selectCard : undefined}
            />
          ))}
        </aside>

        {/* Center: board — locked while a bot is taking its turn */}
        <main className={`game__board ${waiting ? 'game__board--waiting' : ''}`}>
          <LocationRow locations={game.locations} />
          <CardGrid
            game={game}
            action={action}
            affordableCardIds={affordableCardIds}
            onSelectCard={actions.selectCard}
            onReserveFromDeck={actions.reserveFromDeck}
          />
          <GemBank
            game={game}
            action={action}
            confirmError={confirmError}
            onSelectGem={actions.selectGem}
            onConfirm={actions.confirmTakeGems}
            onCancel={actions.cancelAction}
          />
          {isHumanTurn && action.type === 'idle' && (
            <div className="game__pass">
              <button className="btn btn--ghost" onClick={actions.pass}>
                Pass
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Card action modal */}
      {action.type === 'cardAction' && (
        <CardActionModal
          card={action.card}
          canRecruit={action.canRecruit}
          canReserve={action.canReserve}
          onRecruit={actions.recruitCard}
          onReserve={actions.reserveCard}
          onCancel={actions.cancelAction}
        />
      )}
    </div>
  );
}
