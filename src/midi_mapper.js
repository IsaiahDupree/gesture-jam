import { triggerNote, setFxParam, setMood } from './tone_setup';

let midiOut = null;
let lastGestureTime = {};

// Map finger count to MIDI note # (C major scale)
const notes = [60, 62, 64, 65, 67, 69]; // C, D, E, F, G, A

// Throttling to prevent too many rapid triggers
const GESTURE_THROTTLE_MS = 200;

export async function initMidi() {
  try {
    const access = await navigator.requestMIDIAccess();
    const outputs = [...access.outputs.values()];
    midiOut = outputs[0] || null;
    
    if (midiOut) {
      console.log('✓ MIDI output connected:', midiOut.name);
    } else {
      console.log('⚠ No MIDI outputs found - using internal audio only');
    }
  } catch (err) {
    console.warn('MIDI access failed:', err.message);
    console.log('✓ Using internal audio only');
  }
}

export function dispatchGesture({ hand, fingers, mood, confidence }) {
  const now = Date.now();
  const gestureKey = `${hand}-${fingers}`;
  
  // Throttle rapid gestures
  if (lastGestureTime[gestureKey] && (now - lastGestureTime[gestureKey]) < GESTURE_THROTTLE_MS) {
    return;
  }
  lastGestureTime[gestureKey] = now;
  
  if (typeof fingers === 'number' && hand) {
    if (hand === 'left' && fingers > 0 && fingers <= notes.length) {
      // Left hand triggers notes
      const note = notes[fingers - 1];
      triggerNote(note);
      console.log(`🎵 Left hand ${fingers} fingers -> Note ${note}`);
      
      // Send MIDI if available
      if (midiOut) {
        // Note On
        midiOut.send([0x90, note, 100]); // Channel 1, note, velocity
        // Note Off after 500ms
        setTimeout(() => midiOut.send([0x80, note, 0]), 500);
      }
      
    } else if (hand === 'right') {
      // Right hand controls effects
      const paramValue = Math.min(fingers / 5, 1); // Normalize to 0-1
      
      setFxParam('filterFreq', fingers);
      console.log(`🎛️ Right hand ${fingers} fingers -> Filter: ${paramValue}`);
      
      // Send MIDI CC if available
      if (midiOut) {
        const ccValue = Math.floor(paramValue * 127);
        midiOut.send([0xB0, 74, ccValue]); // CC 74 (filter cutoff)
      }
    }
  }
  
  if (mood) {
    setMood(mood);
    console.log(`😊 Mood detected: ${mood}`);
  }
}

// Utility function to send raw MIDI
export function sendMidiMessage(message) {
  if (midiOut) {
    midiOut.send(message);
  }
}
