import { useState } from 'react';

export default function App() {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <main style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '4rem' }}>
        <h1>Splendor</h1>
        <p>Game coming soon — engine is being rebuilt.</p>
        <button type="button" onClick={() => setStarted(false)}>
          Back
        </button>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '4rem' }}>
      <h1>Splendor</h1>
      <p>Marvel Edition — 2–4 players, race to 15 prestige points.</p>
      <button type="button" onClick={() => setStarted(true)}>
        New Game
      </button>
    </main>
  );
}
