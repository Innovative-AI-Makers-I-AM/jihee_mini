// main.js와 같은경로에서 video.js, entries.js, events.js 를 불러온다.
// 각 js에서 import 할 함수명을 { } 안에 적는다.
import { startVideoStream, handleAction } from './video.js';
import { loadEntries, getCurrentDate } from './entries.js';
import { addEventListeners } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    const recordTitle = document.getElementById('recordTitle');
    recordTitle.textContent += ` (${getCurrentDate()})`;
    loadEntries();
});

startVideoStream();
addEventListeners(handleAction);