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
            showModal();
        } else {
            const result = await response.json();
            document.getElementById('result').innerHTML = `<p>${result.detail}</p>`;
        }
    }, 'image/jpeg');
}

function showModal() {
    const modal = document.getElementById('errorModal');
    modal.style.display = 'block';

    document.getElementById('retryButton').onclick = () => {
        modal.style.display = 'none';
        handleFaceRecognition(); // 다시 시도
    };

    document.getElementById('registerButton').onclick = () => {
        window.location.href = '/register'; // 등록 페이지로 이동
    };
}