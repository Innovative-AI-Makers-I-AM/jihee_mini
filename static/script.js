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
const newModal = document.querySelector("#new-modal");
const attendanceBtn = document.querySelector("#attendance");
const leavingWorkBtn = document.querySelector("#leaving-work");
const leaveBtn = document.querySelector("#leave");
const returnBtn = document.querySelector("#return");
const closeBtn = document.querySelector(".close-btn");
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
let isFaceDetected = false;

// FaceMesh 라이브러리 스크립트 로드 후 실행될 함수
function onScriptLoad() {
    // Mediapipe 얼굴 랜드마크 감지 함수
    async function onResults(results) {
        if (results.multiFaceLandmarks) {
            isFaceDetected = true; // 얼굴이 감지되면 플래그를 true로 설정

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
        if (!isFaceDetected) { // 얼굴이 감지되지 않았을 때만 얼굴 감지 요청
            faceMesh.send({ image: video });
        }
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
                // confirmationMessage.textContent = `${currentUserName}님 ${currentUserInEntryList ? '퇴근' : '출근'}확인을 하시겠습니까?`;
                // confirmationModal.style.display = 'block';

                newModal.style.display = 'block';
            }
        } else if (response.status === 404) {
            alert('등록된 사용자가 없어 사용자 등록 페이지로 이동합니다.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            resultDiv.innerHTML = `<p>${result.detail}</p>`;

            setTimeout(() => {
                isFaceDetected = false;
                resultDiv.innerHTML = ''
            }, 1500); // 몇 초 후에 다시 얼굴 감지 허용
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

    newModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;

    attendanceBtn.disabled = true;
    leavingWorkBtn.disabled = false; 
    leaveBtn.disabled = false;
    
}
// 퇴근 기록 추가 함수
function addExit(name, exitTime) {
    const entry = document.querySelector(`#entries li[data-name="${name}"]`);
    if (entry) {
        const entryTime = new Date(entry.getAttribute('data-entry-time'));
        const timeString = exitTime.toLocaleTimeString();
        entry.setAttribute('data-exit-time', exitTime.toISOString());
        entry.textContent += ` / ${timeString} (퇴근)`;
        calculateTotalTime();
    }

    newModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;
}
// 총 근무시간 계산 함수
function calculateTotalTime() {
    const entry = document.querySelector(`#entries li[data-name="${currentUserName}"]`);

    let entryTime = new Date(entry.getAttribute('data-entry-time'));
    let exitTime = new Date(entry.getAttribute('data-exit-time'));
    let leaveTime = new Date(entry.getAttribute('data-leave-time'));
    let returnTime = new Date(entry.getAttribute('data-return-time'));

    if(document.querySelector("li[data-name='sksk']").dataset.returnTime === undefined)
        returnTime = exitTime;
    if(document.querySelector("li[data-name='sksk']").dataset.leaveTime === undefined)
        leaveTime = returnTime;

    let leavedTime = returnTime - leaveTime;
    let workingTime = exitTime - entryTime;

    // 퇴근 - 출근 - 외출시간(외출~복귀 or 외출~퇴근)

    console.log("entrytime : ", entryTime)
    console.log("exitTime : ", exitTime)
    console.log("leaveTime : ", leaveTime)
    console.log("returnTime : ", returnTime)

    let diff = workingTime - leavedTime;
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diff % (1000 * 60)) / 1000);
    entry.textContent += ` / 총 근무시간: ${hours}시간 ${minutes}분 ${seconds}초 / `;

    diff = leavedTime;
    hours = Math.floor(diff / (1000 * 60 * 60));
    minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if(document.querySelector("li[data-name='sksk']").dataset.leaveTime === undefined)
        entry.textContent += `총 외출시간 : 0시간 0분 0초`
    else
        entry.textContent += `총 외출시간 : ${hours}시간 ${minutes}분 ${seconds}초`;
}


function addLeave(currentUserName, now){
    const entry = document.querySelector(`#entries li[data-name="${currentUserName}"]`);
    if (entry) {
        const timeString = now.toLocaleTimeString();
        entry.textContent += ` / ${timeString} (외출)`;
        entry.setAttribute('data-leave-time', now.toISOString());
    }

    newModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;

    leaveBtn.disabled = true; 
    leavingWorkBtn.disabled = false; 
    returnBtn.disabled = false; 
}

function addReturn(currentUserName, now){
    const entry = document.querySelector(`#entries li[data-name="${currentUserName}"]`);
    if (entry) {
        const timeString = now.toLocaleTimeString();
        entry.textContent += ` / ${timeString} (복귀)`;
        entry.setAttribute('data-return-time', now.toISOString());
    }

    newModal.style.display = 'none';
    currentUserName = '';
    currentUserInEntryList = false;

    returnBtn.disabled = true;

}


attendanceBtn.addEventListener("click", (e)=>{
    console.log("출근")
    const now = new Date();
    addEntry(currentUserName, now);

    
    setTimeout(() => {
        isFaceDetected = false;
    }, 1500); // 몇 초 후에 다시 얼굴 감지 허용
})
leavingWorkBtn.addEventListener("click", (e)=>{
    console.log("퇴근")
    const now = new Date();
    addExit(currentUserName, now);

})
leaveBtn.addEventListener("click", (e)=>{
    console.log("외출")
    const now = new Date();
    addLeave(currentUserName, now);

    setTimeout(() => {
        isFaceDetected = false;
    }, 1500); // 몇 초 후에 다시 얼굴 감지 허용
})
returnBtn.addEventListener("click", (e)=>{
    console.log("복귀")
    const now = new Date();
    addReturn(currentUserName, now);

    setTimeout(() => {
        isFaceDetected = false;
    }, 1500); // 몇 초 후에 다시 얼굴 감지 허용
})


closeBtn.onclick = e=>{
    console.log("dd")
    newModal.style.display = 'none';

    setTimeout(() => {
        isFaceDetected = false;
    }, 1500); // 몇 초 후에 다시 얼굴 감지 허용
}