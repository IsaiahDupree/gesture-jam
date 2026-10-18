import * as Tone from 'tone';

// Audio components
let synth, filter, reverb, delay, compressor;
let isInitialized = false;

// Scale modes for different moods
const scales = {
  major: [60, 62, 64, 65, 67, 69, 71],      // C major
  minor: [60, 62, 63, 65, 67, 68, 70],      // C minor
  pentatonic: [60, 62, 65, 67, 69],         // C pentatonic
  smile: [60, 62, 64, 65, 67, 69, 71],      // Happy = major
  neutral: [60, 62, 65, 67, 69],            // Neutral = pentatonic
  frown: [60, 62, 63, 65, 67, 68, 70]       // Sad = minor
};

let currentScale = scales.major;

export async function initTone() {
  if (isInitialized) return;
  
  try {
    // Start Tone.js audio context
    await Tone.start();
    console.log('✓ Tone.js audio context started');
    
    // Create effects chain
    compressor = new Tone.Compressor(-30, 3);
    reverb = new Tone.Reverb(2);
    delay = new Tone.FeedbackDelay("8n", 0.3);
    filter = new Tone.Filter(800, 'lowpass');
    
    // Wait for reverb to load
    await reverb.generate();
    
    // Create synth with effects chain
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.3,
        release: 1
      }
    });
    
    // Connect effects chain: synth -> filter -> delay -> reverb -> compressor -> destination
    synth.connect(filter);
    filter.connect(delay);
    delay.connect(reverb);
    reverb.connect(compressor);
    compressor.toDestination();
    
    // Set initial values
    filter.frequency.value = 1000;
    delay.wet.value = 0.2;
    reverb.wet.value = 0.3;
    
    isInitialized = true;
    console.log('✓ Audio synthesis chain initialized');
    
  } catch (err) {
    console.error('Failed to initialize Tone.js:', err);
    throw err;
  }
}

export function triggerNote(midiNote) {
  if (!isInitialized) return;
  
  try {
    // Convert MIDI note to frequency
    const freq = Tone.Frequency(midiNote, 'midi');
    
    // Trigger note with some variation
    const velocity = 0.7 + Math.random() * 0.3; // 0.7 to 1.0
    const duration = '4n';
    
    synth.triggerAttackRelease(freq, duration, undefined, velocity);
    
    // Visual feedback
    document.body.style.backgroundColor = `hsl(${(midiNote - 60) * 30}, 70%, 10%)`;
    setTimeout(() => {
      document.body.style.backgroundColor = 'black';
    }, 200);
    
  } catch (err) {
    console.warn('Note trigger failed:', err);
  }
}

export function setFxParam(param, value) {
  if (!isInitialized) return;
  
  try {
    switch (param) {
      case 'filterFreq':
        // Map 0-5 finger count to filter frequency
        const freq = 200 + (value * 500); // 200Hz to 2700Hz
        filter.frequency.rampTo(freq, 0.1);
        break;
        
      case 'reverb':
        const reverbAmount = Math.min(value / 5, 1);
        reverb.wet.rampTo(reverbAmount, 0.1);
        break;
        
      case 'delay':
        const delayAmount = Math.min(value / 5, 0.8);
        delay.wet.rampTo(delayAmount, 0.1);
        break;
        
      default:
        console.warn('Unknown FX parameter:', param);
    }
  } catch (err) {
    console.warn('FX parameter update failed:', err);
  }
}

export function setMood(mood) {
  if (!isInitialized) return;
  
  try {
    const newScale = scales[mood] || scales.neutral;
    currentScale = newScale;
    
    // Update synth timbre based on mood
    switch (mood) {
      case 'smile':
        synth.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.8 }
        });
        break;
        
      case 'frown':
        synth.set({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 1.5 }
        });
        break;
        
      default: // neutral
        synth.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 1 }
        });
    }
    
    console.log(`🎵 Mood changed to ${mood}, scale updated`);
    
  } catch (err) {
    console.warn('Mood change failed:', err);
  }
}

// Export current scale for other modules
export function getCurrentScale() {
  return currentScale;
}

// Utility to get random note from current scale
export function getRandomScaleNote() {
  return currentScale[Math.floor(Math.random() * currentScale.length)];
}
