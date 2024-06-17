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

// 가람추가
async function recordTime(action) {
    const userId = getCurrentUserId(); // 현재 사용자 ID 가져오는 함수
    const response = await fetch('/api/record_time', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            user_id: userId,
            action: action
        })
    });
    
    const result = await response.json();
    if(result.success) {
        alert('시간이 기록되었습니다.')
    } else {
        alert('시간 기록에 실패했습니다.')
    }
}

document.getElementById('entryButton').addEventListener('click',() => recordTime('check_in'))
document.getElementById('outgoingButton').addEventListener('click',() => recordTime('out_time'))
document.getElementById('returningButton').addEventListener('click',() => recordTime('return_time'))
document.getElementById('exitButton').addEventListener('click',() => recordTime('check_out'))