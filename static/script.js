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
// const confirmationMessage = document.getElementById('confirmationMessage');
const commuteBtn = document.getElementById('commute');
const departBtn = document.getElementById('depart');
const outingBtn = document.getElementById('outing');
const returnBtn = document.getElementById('return');
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
let isFaceDetected = false;

// FaceMesh 라이브러리 스크립트 로드 후 실행될 함수
function onScriptLoad() {
    // Mediapipe 얼굴 랜드마크 감지 함수
    async function onResults(results) {
        if (!isFaceDetected && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
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

    currentUserInEntryList = false;

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

            const entriesTable = document.getElementById('entriesTable');
            currentUserInEntryList = entriesTable.querySelector(`tr[data-name="${currentUserName}"]`) !== null;
            
            // 퇴근했다면 퇴근했다고 띄우기
            const alreadyExited = entriesTable.querySelector(`tr[data-name="${currentUserName}"][data-exit-time]`);
            if (alreadyExited) {
                alreadyExitedMessage.textContent = `${currentUserName}님은 이미 퇴근하셨습니다.`;
                alreadyExitedModal.style.display = 'block';
                return;
            } 
            
            // 퇴근하지 않았다면 
            if(currentUserInEntryList){ // 이력에 해당 사용자가 적혀있다면

                const statEntry = entriesTable.querySelector(`tr[data-name="${currentUserName}"][data-entry-time]`);
                const statOuting = entriesTable.querySelector(`tr[data-name="${currentUserName}"][data-out-time]`);
                const statReturn = entriesTable.querySelector(`tr[data-name="${currentUserName}"][data-return-time]`);
                
                // 출근한 사람일때
                // 외출과 퇴근만 누를 수 잇음
                if(statEntry){
                    commuteBtn.disabled = true;
                    outingBtn.disabled = false;
                    departBtn.disabled = false;
                    returnBtn.disabled = true;
                }

                // 외출한 사람일때
                // 복귀만 누를 수 있음
                if(statOuting){
                    commuteBtn.disabled = true;
                    outingBtn.disabled = true;
                    departBtn.disabled = true;
                    returnBtn.disabled = false;
                }

                // 복귀한 사람일때
                // 퇴근만 누를 수 있음
                if(statReturn){
                    commuteBtn.disabled = true;
                    outingBtn.disabled = true;
                    departBtn.disabled = false;
                    returnBtn.disabled = true;
                }

                confirmationModal.style.display = 'block';

                setTimeout(() => {
                    isFaceDetected = false;
                }, 2000);
            } else{     // 이력에 해당 사용자가 적혀있지 않다면
                commuteBtn.disabled = false;
                outingBtn.disabled = true;
                departBtn.disabled = true;
                returnBtn.disabled = true;

                confirmationModal.style.display = 'block';
    
                setTimeout(() => {
                    isFaceDetected = false;
                }, 2000);
            }
            
            
        } else if (response.status === 404) {
            alert('등록된 사용자가 없어 사용자 등록 페이지로 이동합니다.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            resultDiv.innerHTML = `<p>${result.detail}</p>`;
            setTimeout(() => {
                isFaceDetected = false;
            }, 2000);
        }
    }, 'image/jpeg');
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
    const entriesTable = document.getElementById('entriesTable');
    const timeString = time.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false});
    const rowHTML = `
        <tr data-name="${name}" data-entry-time="${time.toISOString()}">
            <td>${name}</td>
            <td>${timeString}</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
    `;
    entriesTable.insertAdjacentHTML('beforeend', rowHTML);
}


// 퇴근 기록 추가 함수
function addExit(name, exitTime) {
    const entriesTable = document.getElementById('entriesTable');
    const tragetRow = entriesTable.querySelector(`tr[data-name="${name}"]`);
    tragetRow.setAttribute('data-exit-time', exitTime.toISOString());
    const exit = tragetRow.querySelector(":nth-child(3)");

    const timeString = exitTime.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false});
    exit.innerHTML = `${timeString}`

    calTotalWorkingTime(tragetRow);
    calTotalOutingTime(tragetRow);
}

// 외출 기록 추가 함수
function addOuting(name, time) {
    const entriesTable = document.getElementById('entriesTable');
    const tragetRow = entriesTable.querySelector(`tr[data-name="${name}"]`);
    tragetRow.setAttribute('data-out-time', time.toISOString());
    const out = tragetRow.querySelector(":nth-child(4)");

    const timeString = time.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false});
    out.innerHTML = `${timeString}`
}

// 복귀 기록 추가 함수
function addReturn(name, time) {
    const entriesTable = document.getElementById('entriesTable');
    const tragetRow = entriesTable.querySelector(`tr[data-name="${name}"]`);
    tragetRow.setAttribute('data-return-time', time.toISOString());
    const ret = tragetRow.querySelector(":nth-child(5)");

    const timeString = time.toLocaleTimeString('ko-KR', {hour: '2-digit', minute: '2-digit', hour12: false});
    ret.innerHTML = `${timeString}`
}


// 총 근무시간 계산 함수
function calTotalWorkingTime(tragetRow) {
    let entryTime = tragetRow.dataset.entryTime;
    let exitTime = tragetRow.dataset.exitTime;

    // ISO 문자열을 Date 객체로 변환
    let entryDate = new Date(entryTime);
    let exitDate = new Date(exitTime);

    // 시간 차이를 밀리초로 계산
    let timeDifference = exitDate - entryDate; // 밀리초 단위의 시간 차이

    // 밀리초를 시간, 분, 초로 변환
    let totalSeconds = Math.floor(timeDifference / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    const totWorkingTimeBlock = tragetRow.querySelector(":nth-child(6)");
    totWorkingTimeBlock.innerText = `${hours}시간 ${minutes}분 ${seconds}초`;
}

// 총 외출시간 계산 함수
function calTotalOutingTime(tragetRow) {

    let outingTime = tragetRow.dataset.outTime;
    let returnTime = tragetRow.dataset.returnTime;
    const totWorkingTimeBlock = tragetRow.querySelector(":nth-child(7)");

    // 만약 외출을 하지 않았다면
    if(outingTime === undefined){

        totWorkingTimeBlock.innerHTML = "X";
        return;
    }

    // ISO 문자열을 Date 객체로 변환
    let outingDate = new Date(outingTime);
    let returnDate = new Date(returnTime);

    // 시간 차이를 밀리초로 계산
    let timeDifference = returnDate - outingDate; // 밀리초 단위의 시간 차이

    // 밀리초를 시간, 분, 초로 변환
    let totalSeconds = Math.floor(timeDifference / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    totWorkingTimeBlock.innerHTML = `${hours}시간 ${minutes}분 ${seconds}초`;
}

// 출근 버튼 눌렸을 때
commuteBtn.onclick = (e)=>{
    addEntry(currentUserName, new Date());
    confirmationModal.style.display = 'none';

    // commuteBtn.disabled = true;
    // departBtn.disabled = false;
    // outingBtn.disabled = false;
}

// 퇴근 버튼 눌렸을 때
departBtn.onclick = (e)=>{
    addExit(currentUserName, new Date());
    confirmationModal.style.display = 'none';
}

// 외출 버튼 눌렀을 때
outingBtn.onclick = (e)=>{
    addOuting(currentUserName, new Date());
    confirmationModal.style.display = 'none';

    // outingBtn.disabled = true;
    // departBtn.disabled = true;
    // returnBtn.disabled = false;
}

// 복귀 버튼 눌렀을 때
returnBtn.onclick = (e)=>{
    addReturn(currentUserName, new Date());
    confirmationModal.style.display = 'none';

    // returnBtn.disabled = true;
    // departBtn.disabled = false;
}

