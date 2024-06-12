// 현재 날짜를 yyyy.mm.dd 형식으로 반환하는 함수
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
// 페이지가 로드될 때 출퇴근 기록 제목에 현재 날짜 추가
document.addEventListener('DOMContentLoaded', () => {
    const recordTitle = document.getElementById('recordTitle');
    recordTitle.textContent += ` (${getCurrentDate()})`;
});
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');
const entriesList = document.getElementById('entries');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationMessage = document.getElementById('confirmationMessage');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');
const alreadyExitedModal = document.getElementById('alreadyExitedModal');
const alreadyExitedMessage = document.getElementById('alreadyExitedMessage');
const alreadyExitedConfirmButton = document.getElementById('alreadyExitedConfirmButton');
let currentUserName = '';
let currentUserInEntryList = false;
// 웹캠 비디오 스트림을 시작하는 함수
function startVideoStream() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js';
            script.onload = function () {
                onScriptLoad();
            };
            document.body.appendChild(script);
        })
        .catch(err => {
            console.error('Error accessing webcam:', err);
        });
}

// FaceMesh 라이브러리 스크립트 로드 후 실행될 함수
function onScriptLoad() {
    // Mediapipe 얼굴 랜드마크 감지 함수
    async function onResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            // 필요에 따라 landmarks를 처리하거나 저장할 수 있습니다.
            console.log('Landmarks detected:', landmarks);

            // 얼굴이 감지되면 사진을 찍는 함수 호출
            captureButton.click();
            console.log("capture button 클릭")
        } else {
            console.log('No face detected');
        }
    }

    // Mediapipe FaceMesh 설정
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    faceMesh.onResults(onResults);

    // 웹캠 비디오 스트림 연결
    // faceMesh.send({ image: video });
    setInterval(() => {
        faceMesh.send({ image: video });
    }, 500);
}

// 웹캠 비디오 스트림 시작
startVideoStream();

// 캡처 버튼 클릭 이벤트 핸들러
captureButton.addEventListener('click', () => {
    // 캔버스를 생성하여 비디오에서 이미지 캡처
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    // 캡처한 이미지를 Blob 형식으로 변환
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        // 서버로 이미지 업로드 및 사용자 인식 요청
        const response = await fetch('/identify_user/', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            const result = await response.json();
            currentUserName = result.name;
            currentUserInEntryList = document.querySelector(`#entries li[data-name="${currentUserName}"]`) !== null;
            // 이미 퇴근한 사용자인지 확인
            const alreadyExited = document.querySelector(`#entries li[data-name="${currentUserName}"][data-exit-time]`);
            if (alreadyExited) {
                alreadyExitedMessage.textContent = `${currentUserName}님은 이미 퇴근하셨습니다.`;
                alreadyExitedModal.style.display = 'block';
            } else {
                confirmationMessage.textContent = `${currentUserName}님 ${currentUserInEntryList ? '퇴근' : '출근'}확인을 하시겠습니까?`;
                confirmationModal.style.display = 'block';
            }
        } else if (response.status === 404) {
            alert('등록된 사용자가 없어 사용자 등록 페이지로 이동합니다.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            resultDiv.innerHTML = `<p>${result.detail}</p>`;
        }
    }, 'image/jpeg');
});
// 확인 버튼 클릭 이벤트 핸들러
confirmButton.addEventListener('click', () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    if (currentUserInEntryList) {
        addExit(currentUserName, now);
    } else {
        addEntry(currentUserName, now);
    }
    confirmationModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;
});
// 취소 버튼 클릭 이벤트 핸들러
cancelButton.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;
});
// 이미 퇴근한 사용자 확인 버튼 클릭 이벤트 핸들러
alreadyExitedConfirmButton.addEventListener('click', () => {
    alreadyExitedModal.style.display = 'none';
});
// 출근 기록 추가 함수
function addEntry(name, time) {
    const timeString = time.toLocaleTimeString();
    const entry = document.createElement('li');
    entry.textContent = `${name} - ${timeString} (출근)`;
    entry.setAttribute('data-name', name);
    entry.setAttribute('data-entry-time', time.toISOString());
    entriesList.appendChild(entry);
}
// 퇴근 기록 추가 함수
function addExit(name, exitTime) {
    const entry = document.querySelector(`#entries li[data-name="${name}"]`);
    if (entry) {
        const entryTime = new Date(entry.getAttribute('data-entry-time'));
        const timeString = exitTime.toLocaleTimeString();
        const totalTime = calculateTotalTime(entryTime, exitTime);
        entry.textContent += ` / ${timeString} (퇴근) - 총 근무시간: ${totalTime}`;
        entry.setAttribute('data-exit-time', exitTime.toISOString());
    }
}
// 총 근무시간 계산 함수
function calculateTotalTime(entryTime, exitTime) {
    const diff = exitTime - entryTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
}