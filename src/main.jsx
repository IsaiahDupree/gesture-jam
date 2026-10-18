import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { initHands } from './vision';
import { initMidi }  from './midi_mapper';
import { initTone }  from './tone_setup';
import './index.css';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initialize() {
      try {
        console.log('Initializing Gesture Jam...');
        
        await initTone();            // load synth + loop bus
        console.log('✓ Tone.js initialized');
        
        await initMidi();            // request MIDI output
        console.log('✓ MIDI initialized');
        
        await initHands();           // start CV pipeline
        console.log('✓ Computer vision initialized');
        
        setIsInitialized(true);
        console.log('🎵 Gesture Jam ready!');
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      }
    }
    
    initialize();
  }, []);

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">
        <h2>Error initializing Gesture Jam</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="text-center p-4">
      <h1 className="text-2xl font-bold mb-4">🎵 Gesture Jam</h1>
      {!isInitialized && (
        <p className="text-yellow-400">Initializing... Please allow camera access when prompted.</p>
      )}
      {isInitialized && (
        <p className="text-green-400">✓ Ready to jam! Wave your hands to make music.</p>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
