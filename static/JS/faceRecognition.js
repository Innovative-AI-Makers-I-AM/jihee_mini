import { showModalBasedOnState } from './attendance.js';
import { setCurrentUserId, setCurrentUserName } from './state.js';

export async function handleFaceRecognition() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        const response = await fetch('/identify_user/', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
            setCurrentUserName(result.name);
            // 가람추가
            setCurrentUserId(result.user_id);
            showModalBasedOnState();
        } else if (response.status === 404) {
            alert('등록된 사용자가 없어 사용자 등록 페이지로 이동합니다.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            document.getElementById('result').innerHTML = `<p>${result.detail}</p>`;
        }
    }, 'image/jpeg');
}
