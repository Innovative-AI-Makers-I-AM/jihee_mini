import { handleFaceRecognition } from './faceRecognition.js';
import { getIsFaceDetected, setIsFaceDetected } from './state.js';

export function startVideoStream() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/face_detection.js';
            script.onload = function () {
                onScriptLoad(video);
            };
            document.body.appendChild(script);
        })
        .catch(err => {
            console.error('Error accessing webcam:', err);
        });
}

function onScriptLoad(video) {
    async function onResults(results) {
        if (!getIsFaceDetected() && results.detections && results.detections.length > 0) {
            setIsFaceDetected(true);
            handleFaceRecognition();
        } else {
            console.log('No face detected');
        }
    }

    const faceDetection = new FaceDetection({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
      }});
    faceDetection.setOptions({
        modelSelection: 0,
        minDetectionConfidence: 0.5
    });
    faceDetection.onResults(onResults);

    setInterval(() => {
        if (!getIsFaceDetected()) {
            faceDetection.send({ image: video });
        }
    }, 1000);
}

window.addEventListener('beforeunload', () => {
    const video = document.getElementById('video');
    if (video && video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach(track => {
            track.stop();
        });

        video.srcObject = null;
    }
});
