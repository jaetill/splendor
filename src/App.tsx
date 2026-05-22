import { useGame } from './hooks/useGame';
import GemBank from './components/GemBank';
import CardGrid from './components/CardGrid';
import CardActionModal from './components/CardActionModal';
import LocationRow from './components/LocationRow';
import PlayerPanel from './components/PlayerPanel';
import { logout } from './auth/auth';
import './App.css';

function SetupScreen({ onStart }: { onStart: (n: number) => void }) {
  return (
    <div className="setup">
      <a className="apps-link" href="https://jaetill.com/">
        ← Apps
      </a>
      <h1 className="setup__title">Splendor</h1>
      <p className="setup__subtitle">Marvel Edition</p>
      <div className="setup__options">
        {[2, 3, 4].map((n) => (
          <button key={n} className="btn btn--primary btn--large" onClick={() => onStart(n)}>
            {n} Players
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const { game, action, actions } = useGame();

  if (!game) {
    return <SetupScreen onStart={actions.startGame} />;
  }

  return (
    <div className="game">
      {/* Status bar */}
      <header className="game__header">
        <a className="apps-link" href="https://jaetill.com/">
          ← Apps
        </a>
        <h1 className="game__title">Splendor</h1>
        {game.phase === 'ended' ? (
          <span className="game__status game__status--ended">Player {game.winner! + 1} wins!</span>
        ) : (
          <span className="game__status">
            Player {game.currentPlayer + 1}'s turn
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
              isCurrentPlayer={i === game.currentPlayer && game.phase !== 'ended'}
              onSelectReservedCard={actions.selectCard}
            />
          ))}
        </aside>

        {/* Center: board */}
        <main className="game__board">
          <LocationRow locations={game.locations} />
          <CardGrid
            game={game}
            action={action}
            onSelectCard={actions.selectCard}
            onReserveFromDeck={actions.reserveFromDeck}
          />
          <GemBank
            game={game}
            action={action}
            onSelectGem={actions.selectGem}
            onConfirm={actions.confirmTakeGems}
            onCancel={actions.cancelAction}
          />
          {game.phase !== 'ended' && action.type === 'idle' && (
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
