import * as hands from '@tensorflow-models/hand-pose-detection';
import * as face from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs-backend-webgl';
import * as tf from '@tensorflow/tfjs';
import { dispatchGesture } from './midi_mapper';

// Utility function to count extended fingers
function countExtendedFingers(landmarks3D) {
  if (!landmarks3D || landmarks3D.length < 21) return 0;
  
  let count = 0;
  
  // Thumb (compare tip with previous joint)
  if (landmarks3D[4].y < landmarks3D[3].y) count++;
  
  // Other fingers (compare tip with previous joint)
  const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
  const fingerPips = [6, 10, 14, 18]; // Previous joints
  
  for (let i = 0; i < fingerTips.length; i++) {
    if (landmarks3D[fingerTips[i]].y < landmarks3D[fingerPips[i]].y) {
      count++;
    }
  }
  
  return Math.min(count, 5);
}

// Simple mood classification based on face landmarks
function classifyMood(faceResult) {
  // This is a simplified mood detector
  // In a real implementation, you'd analyze mouth corners, eyebrow positions, etc.
  const predictions = faceResult.predictions || [];
  if (predictions.length === 0) return 'neutral';
  
  // Placeholder logic - you'd implement proper facial expression recognition here
  const random = Math.random();
  if (random < 0.33) return 'smile';
  if (random < 0.66) return 'neutral';
  return 'frown';
}

export async function initHands() {
  const video = document.getElementById('cam');
  const canvas = document.getElementById('overlay');
  const ctx = canvas.getContext('2d');
  
  // Get user media
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 480 } 
    });
    video.srcObject = stream;
    console.log('✓ Camera access granted');
  } catch (err) {
    throw new Error('Camera access denied: ' + err.message);
  }
  
  // Initialize TensorFlow backend
  await tf.setBackend('webgl');
  await tf.ready();
  console.log('✓ TensorFlow.js backend ready');

  // Initialize detectors
  const handDetector = await hands.createDetector(
    hands.SupportedModels.MediaPipeHands, 
    { 
      runtime: 'tfjs',
      maxHands: 2,
      modelType: 'lite'
    }
  );
  console.log('✓ Hand detector loaded');

  let faceDetector = null;
  try {
    faceDetector = await face.load(face.SupportedPackages.mediapipeFacemesh, {
      maxFaces: 1
    });
    console.log('✓ Face detector loaded');
  } catch (err) {
    console.warn('Face detection not available:', err.message);
  }

  // Main detection loop
  async function detectLoop() {
    if (video.readyState === 4) {
      try {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Detect hands
        const handResults = await handDetector.estimateHands(video, { 
          flipHorizontal: true 
        });

        // Process hand results
        handResults.forEach(hand => {
          const fingerCount = countExtendedFingers(hand.keypoints3D);
          const handedness = hand.handedness.toLowerCase();
          
          dispatchGesture({ 
            hand: handedness, 
            fingers: fingerCount,
            confidence: hand.score 
          });

          // Draw hand landmarks on canvas
          if (hand.keypoints) {
            ctx.fillStyle = handedness === 'left' ? '#00ff00' : '#ff0000';
            hand.keypoints.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
              ctx.fill();
            });
            
            // Display finger count
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(
              `${handedness}: ${fingerCount}`, 
              hand.keypoints[0].x, 
              hand.keypoints[0].y - 20
            );
          }
        });

        // Detect face (if available)
        if (faceDetector) {
          try {
            const faceResults = await faceDetector.estimateFaces({ 
              input: video 
            });
            
            if (faceResults.length > 0) {
              const mood = classifyMood(faceResults[0]);
              dispatchGesture({ mood });
            }
          } catch (err) {
            // Face detection failed, continue without it
          }
        }
        
      } catch (err) {
        console.warn('Detection error:', err);
      }
    }
    
    requestAnimationFrame(detectLoop);
  }
  
  // Wait for video to be ready then start detection
  video.addEventListener('loadeddata', () => {
    console.log('✓ Video stream ready, starting detection...');
    detectLoop();
  });
}
