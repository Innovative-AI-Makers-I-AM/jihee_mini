import { startVideoStream } from './videoStream.js';
import { loadEntries, handleAction, getCurrentDate } from './attendance.js';

document.addEventListener('DOMContentLoaded', () => {
    const recordTitle = document.getElementById('recordTitle');
    recordTitle.textContent += ` (${getCurrentDate()})`;
    loadEntries();
    startVideoStream();
});

// 페이지를 떠나기 전에 비디오 스트림을 중지하는 이벤트 핸들러
window.addEventListener('beforeunload', () => {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
        track.stop();
    });

    video.srcObject = null;
});
