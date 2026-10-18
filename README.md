# 🎵 Gesture Jam

A gesture-controlled music prototype using Electron + React + TensorFlow.js + Tone.js.

## Features

- **Hand Gesture Control**: Use finger counting to trigger notes and control effects
- **Real-time Computer Vision**: MediaPipe-powered hand detection
- **Audio Synthesis**: Built-in synthesizers and effects with Tone.js
- **MIDI Support**: Optional MIDI output to external DAWs
- **Desktop prototype**: Electron source intended for Windows, macOS and Linux; platform and hardware behavior still need validation.

## How to Use

### Hand Controls
- **Left Hand**: Number of extended fingers (1-5) triggers musical notes in C major scale
- **Right Hand**: Number of extended fingers (0-5) controls filter cutoff frequency

### Current scope

Hand landmarks drive the musical controls. Facial-expression classification is not implemented; the earlier random mood output has been removed. Camera, audio and MIDI hardware behavior were not tested during this source publication.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start Electron**:
   ```bash
   npm run electron
   ```

   Or use the combined command:
   ```bash
   npm start
   ```

4. **Allow camera access** when prompted

5. **Start jamming!** Wave your hands in front of the camera

## Architecture

```
┌────────────┐
│ Electron UI│  ← React canvas shows webcam & visualizers
└─────┬──────┘
      │ dom events / state
┌─────▼────────┐
│ TensorFlow.js│  ← MediaPipe Hands in browser
└─────┬────────┘
      │ dispatches JSON like
      │ {gesture:'five', hand:'left'}
┌─────▼────────┐
│  Gesture→MIDI│ midi_mapper.js (WebMIDI) maps to CC / note
└─────┬────────┘
      │
┌─────▼────────┐
│   Tone.js    │ synths, FX busses, loop buffers
└──────────────┘
```

## Next Steps

1. **Looper Integration**: Add recording and playback loops
2. **Visual Overlays**: Enhanced hand tracking visualization
3. **Performance Presets**: JSON-based gesture → sound mappings
4. **OBS Integration**: Stream the visual output
5. **Ableton Link**: Sync with other music software

## Troubleshooting

- **Camera not working**: Make sure to allow camera permissions
- **No audio**: Click anywhere on the page to start audio context
- **MIDI not working**: Check if you have MIDI devices connected
- **Performance issues**: Try closing other applications using camera

## Dependencies

- Electron: Desktop app framework
- React: UI framework
- TensorFlow.js: Machine learning for gesture recognition
- Tone.js: Web audio synthesis and effects
- TailwindCSS: Styling
- Vite: Build tool and dev server

## Development

The project is structured as:
- `main.js`: Electron main process
- `src/main.jsx`: React application entry
- `src/vision.js`: Computer vision and gesture detection
- `src/midi_mapper.js`: Gesture to MIDI/audio mapping
- `src/tone_setup.js`: Audio synthesis and effects
