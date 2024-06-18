// import { startVideoStream } from './videoStream.js';
// import { loadEntries, handleAction, getCurrentDate } from './attendance.js';

// document.addEventListener('DOMContentLoaded', () => {
//     const recordTitle = document.getElementById('recordTitle');
//     recordTitle.textContent += ` (${getCurrentDate()})`;
//     loadEntries();
//     startVideoStream();
// });

// // 페이지를 떠나기 전에 비디오 스트림을 중지하는 이벤트 핸들러
// window.addEventListener('beforeunload', () => {
//     const stream = video.srcObject;
//     const tracks = stream.getTracks();

//     tracks.forEach(track => {
//         track.stop();
//     });

//     video.srcObject = null;
// });

import { startVideoStream } from './videoStream.js';
import { loadEntries, handleAction, getCurrentDate, showModalBasedOnState } from './attendance.js';

document.addEventListener('DOMContentLoaded', () => {
    const recordTitle = document.getElementById('recordTitle');
    recordTitle.textContent += ` (${getCurrentDate()})`;
    loadEntries();
    startVideoStream();

    // 각 버튼 클릭 이벤트 핸들러 등록
    document.getElementById("entryButton").addEventListener("click", function() {
        handleAction('attendance');
    });
    document.getElementById("exitButton").addEventListener("click", function() {
        handleAction('exit');
    });
    document.getElementById("outgoingButton").addEventListener("click", function() {
        handleAction('leave');
    });
    document.getElementById("returningButton").addEventListener("click", function() {
        handleAction('return');
    });

    // 페이지를 떠나기 전에 비디오 스트림을 중지하는 이벤트 핸들러
    window.addEventListener('beforeunload', () => {
        const video = document.getElementById('video');
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }
        video.srcObject = null;
    });

    // 상태 기반으로 모달 표시
    showModalBasedOnState();
});
