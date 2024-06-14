import { handleFaceRecognition } from './faceRecognition.js';
import { getIsFaceDetected, setIsFaceDetected } from './state.js';

export function startVideoStream() {
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
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
        if (!getIsFaceDetected() && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            setIsFaceDetected(true);
            handleFaceRecognition();
        } else {
            console.log('No face detected');
        }
    }

    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);

    setInterval(() => {
        if (!getIsFaceDetected()) {
            faceMesh.send({ image: video });
        }
    }, 500);
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
