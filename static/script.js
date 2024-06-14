// DOMContentLoaded => 웹 페이지가 로드되 때 발생하는 이벤트
document.addEventListener('DOMContentLoaded', () => {
    // HTML에 ID가 recordTitle인 HTML 요소를 가져온다.
    const recordTitle = document.getElementById('recordTitle');
    // 해당 요소에 textContent를 가져와서 현재 날짜를 추가한다.
    recordTitle.textContent += ` (${getCurrentDate()})`;
    loadEntries();
});

const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');
const entriesList = document.getElementById('entries');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationMessage = document.getElementById('confirmationMessage');
<<<<<<< HEAD
// const confirmButton = document.getElementById('confirmButton');
=======
const entryButton = document.getElementById('entryButton');
const outgoingButton = document.getElementById('outgoingButton');
const returningButton = document.getElementById('returningButton');
const exitButton = document.getElementById('exitButton');
>>>>>>> 5b900969c2d1eef66b9f0d20dd1347668444f17a
const cancelButton = document.getElementById('cancelButton');
const alreadyExitedModal = document.getElementById('alreadyExitedModal');
const alreadyExitedMessage = document.getElementById('alreadyExitedMessage');
const alreadyExitedConfirmButton = document.getElementById('alreadyExitedConfirmButton');
let currentUserName = '';
<<<<<<< HEAD
let currentUserInEntryList = false;

const startWorkButton = document.getElementById('startWorkButton');
const endWorkButton = document.getElementById('endWorkButton');
const goOutButton = document.getElementById('goOutButton');
const comeBackButton = document.getElementById('comeBackButton');

// 웹캠 비디오 스트림을 시작하는 함수
=======
let isFaceDetected = false;

>>>>>>> 5b900969c2d1eef66b9f0d20dd1347668444f17a
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

function onScriptLoad() {
    async function onResults(results) {
        if (!isFaceDetected && results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            isFaceDetected = true;
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
        if (!isFaceDetected) {
            faceMesh.send({ image: video });
        }
    }, 500);
}

startVideoStream();

async function handleFaceRecognition() {
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
            currentUserName = result.name;
<<<<<<< HEAD
            // confirmationMessage.textContent = `${currentUserName}님, 원하시는 작업을 선택하세요.`;
            // confirmationModal.style.display = 'block';
            // currentUserInEntryList = document.querySelector(`#entries li[data-name="${currentUserName}"]`) !== null;
            // 이미 퇴근한 사용자인지 확인
            const alreadyExited = document.querySelector(`#entries li[data-name="${currentUserName}"][data-exit-time]`);
            if (alreadyExited) {
                alreadyExitedMessage.textContent = `${currentUserName}님은 이미 퇴근하셨습니다.`;
                alreadyExitedModal.style.display = 'block';
            } else {
                confirmationMessage.textContent = `${currentUserName}님 ${currentUserInEntryList ? '퇴근' : '출근'}확인을 하시겠습니까?`;
                confirmationModal.style.display = 'block';
            }
=======
            showModalBasedOnState();
>>>>>>> 5b900969c2d1eef66b9f0d20dd1347668444f17a
        } else if (response.status === 404) {
            alert('등록된 사용자가 없어 사용자 등록 페이지로 이동합니다.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            resultDiv.innerHTML = `<p>${result.detail}</p>`;
        }
    }, 'image/jpeg');
<<<<<<< HEAD
});

// // 확인 버튼 클릭 이벤트 핸들러
// confirmButton.addEventListener('click', () => {
//     const now = new Date();
//     const timeString = now.toLocaleTimeString();
//     if (currentUserInEntryList) {
//         addExit(currentUserName, now);
//     } else {
//         addEntry(currentUserName, now);
//     }
//     confirmationModal.style.display = 'none';
//     currentUserName = '';
//     currentUserInEntryList = false;
// });
// // 취소 버튼 클릭 이벤트 핸들러
// cancelButton.addEventListener('click', () => {
//     confirmationModal.style.display = 'none';
//     currentUserName = '';
//     currentUserInEntryList = false;
// });
// // 이미 퇴근한 사용자 확인 버튼 클릭 이벤트 핸들러
// alreadyExitedConfirmButton.addEventListener('click', () => {
//     alreadyExitedModal.style.display = 'none';
// });
// // 출근 기록 추가 함수
// function addEntry(name, time) {
//     const timeString = time.toLocaleTimeString();
//     const entry = document.createElement('li');
//     entry.textContent = `${name} - ${timeString} (출근)`;
//     entry.setAttribute('data-name', name);
//     entry.setAttribute('data-entry-time', time.toISOString());
//     entriesList.appendChild(entry);
// }
// // 퇴근 기록 추가 함수
// function addExit(name, exitTime) {
//     const entry = document.querySelector(`#entries li[data-name="${name}"]`);
//     if (entry) {
//         const entryTime = new Date(entry.getAttribute('data-entry-time'));
//         const timeString = exitTime.toLocaleTimeString();
//         const totalTime = calculateTotalTime(entryTime, exitTime);
//         entry.textContent += ` / ${timeString} (퇴근) - 총 근무시간: ${totalTime}`;
//         entry.setAttribute('data-exit-time', exitTime.toISOString());
//     }
// }
// // 총 근무시간 계산 함수
// function calculateTotalTime(entryTime, exitTime) {
//     const diff = exitTime - entryTime;
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}시간 ${minutes}분`;
// }


// 가람 추가
// 확인 모달 창에 대한 버튼 이벤트 핸들러 추가
document.getElementById('startWorkButton').addEventListener('click', () => handleAttendance('출근'));
document.getElementById('endWorkButton').addEventListener('click', () => handleAttendance('퇴근'));
document.getElementById('goOutButton').addEventListener('click', () => handleAttendance('외출'));
document.getElementById('comeBackButton').addEventListener('click', () => handleAttendance('복귀'));

function handleAttendance(action) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const entry = findOrCreateEntry(currentUserName, action);

    if (action === '퇴근') {
        const startAction = '출근';
        const startTime = findLastActionTime(currentUserName, startAction);
        if (startTime) {
            const totalTime = calculateTimeDifference(startTime, now);
            entry.querySelector('.total-time').textContent = `총 시간: ${totalTime}`;
        }
        // 퇴근 버튼을 비활성화하여 하루에 한번만 퇴근할 수 있도록 설정
        endWorkButton.disabled = true;
        goOutButton.disabled = true;
        comeBackButton.disabled = true;
        startWorkButton.disabled = true;
    } else if (action === '복귀') {
        const goOutTime = findLastActionTime(currentUserName, '외출');
        if (goOutTime) {
            const totalTime = calculateTimeDifference(goOutTime, now);
            entry.querySelector('.total-time').textContent = `총 외출시간: ${totalTime}`;
        }
        goOutButton.disabled = false;
    }
    entry.querySelector(`.${action}`).textContent = `${timeString} (${action})`;

    // 출근 시 외출, 퇴근 버튼을 활성화
    if (action === '출근') {
        setButtonStates({ startWork: true, endWork: false, goOut: false, comeBack: true });
    }
    // 외출 시 복귀 버튼을 활성화
    if (action === '외출') {
        setButtonStates({ startWork: true, endWork: false, goOut: true, comeBack: false });
    }
    // 복귀 시 외출 버튼을 활성화
    if (action === '복귀') {
        setButtonStates({ startWork: true, endWork: false, goOut: false, comeBack: true });
    }

    // if (action === '퇴근' || action === '복귀') {
    //     const startAction = action === '퇴근' ? '출근' : '외출';
    //     const startTime = findLastActionTime(currentUserName, startAction);
    //     if (startTime) {
    //         const totalTime = calculateTimeDifference(startTime, now);
    //         entry.querySelector('.total-time').textContent = `총 시간: ${totalTime}`;
    //     }
    // }
    // entry.querySelector(`.${action}`).textContent = `${timeString} (${action})`;
    confirmationModal.style.display = 'none';
    isFaceDetected = false;
}

function findOrCreateEntry(name, action) {
    let entry = document.querySelector(`#entries li[data-name="${name}"]`);
    if (!entry) {
        entry = document.createElement('li');
        entry.setAttribute('data-name', name);
        entry.innerHTML = `<span class="name">${name}</span> 
                            <span class="출근"></span> 
                             - <span class="퇴근"></span> 
                            <br>
                            <span class="외출"></span> 
                             - <span class="복귀"></span> 
                            <span class="total-time"></span>`;
        entriesList.appendChild(entry);
    }
    return entry;
}

// function handleAttendance(action) {
//     const now = new Date();
//     const timeString = now.toLocaleTimeString();
//     const entry = document.createElement('li');
//     entry.textContent = `${currentUserName} - ${timeString} (${action})`;
//     entry.setAttribute('data-name', currentUserName);
//     entry.setAttribute('data-action', action);
//     entry.setAttribute('data-time', now.toISOString());
//     entriesList.appendChild(entry);
//     confirmationModal.style.display = 'none';

//     // 출근/퇴근 또는 외출/복귀 짝을 지어 근무시간 및 외출시간 계산
//     if (action === '퇴근') {
//         const entryTime = findLastActionTime(currentUserName, '출근');
//         if (entryTime) {
//             const totalTime = calculateTimeDifference(entryTime, now);
//             entry.textContent += ` - 총 근무시간: ${totalTime}`;
//         }
//     } else if (action === '복귀') {
//         const goOutTime = findLastActionTime(currentUserName, '외출');
//         if (goOutTime) {
//             const totalOutTime = calculateTimeDifference(goOutTime, now);
//             entry.textContent += ` - 총 외출시간: ${totalOutTime}`;
//         }
//     }

//     currentUserName = '';
//     currentUserInEntryList = false;

// }

function findLastActionTime(name, action) {
    const entries = document.querySelectorAll(`#entries li[data-name="${name}"][data-action="${action}"]`);
    if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        return new Date(lastEntry.getAttribute('data-time'));
    }
    return null;
}

function calculateTimeDifference(startTime, endTime) {
    const diff = endTime - startTime;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}시간 ${minutes}분`;
}

=======
}

function showModalBasedOnState() {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    const todayEntries = entries.filter(entry => entry.name === currentUserName && entry.date === getCurrentDate());

    entryButton.style.display = 'none';
    outgoingButton.style.display = 'none';
    returningButton.style.display = 'none';
    exitButton.style.display = 'none';

    if (todayEntries.length === 0) {
        entryButton.style.display = 'inline-block';
        confirmationMessage.textContent = `${currentUserName}님 출근하시겠습니까?`;
    } else {
        const lastEntry = todayEntries[todayEntries.length - 1];
        if (lastEntry.type === '출근' || lastEntry.type === '복귀') {
            outgoingButton.style.display = 'inline-block';
            exitButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${currentUserName}님 외출 또는 퇴근하시겠습니까?`;
        } else if (lastEntry.type === '외출') {
            returningButton.style.display = 'inline-block';
            exitButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${currentUserName}님 복귀 또는 퇴근하시겠습니까?`;
        }
    }

    confirmationModal.style.display = 'block';
}


entryButton.addEventListener('click', () => handleAction('출근'));
outgoingButton.addEventListener('click', () => handleAction('외출'));
returningButton.addEventListener('click', () => handleAction('복귀'));
exitButton.addEventListener('click', () => handleAction('퇴근'));
>>>>>>> 5b900969c2d1eef66b9f0d20dd1347668444f17a
cancelButton.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    isFaceDetected = false;
});

<<<<<<< HEAD
alreadyExitedConfirmButton.addEventListener('click', () => {
    alreadyExitedModal.style.display = 'none';
});
=======
function handleAction(type) {
    const now = new Date();
    addEntry(currentUserName, now, type);
    confirmationModal.style.display = 'none';
    isFaceDetected = false;
    if (type === '퇴근') {
        isFaceDetected = true;
    }
}

function addEntry(name, time, type) {
    const timeString = time.toLocaleTimeString();
    const entry = {
        name: name,
        timeString: timeString,
        type: type,
        entryTime: time.toISOString(),
        date: getCurrentDate()
    };
    saveEntry(entry);
    loadEntries();
}

function saveEntry(entry) {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    entries.push(entry);
    localStorage.setItem('attendanceEntries', JSON.stringify(entries));
}

function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    const usersMap = new Map();

    // 사용자 이름을 기준으로 그룹화
    entries.forEach(entry => {
        const key = entry.name;
        const value = {
            timeString: entry.timeString,
            type: entry.type,
            entryTime: entry.entryTime
        };
        if (usersMap.has(key)) {
            usersMap.get(key).push(value);
        } else {
            usersMap.set(key, [value]);
        }
    });

    entriesList.innerHTML = '';

    // 각 사용자별로 출퇴근 기록을 한 줄에 표시
    usersMap.forEach((entries, name) => {
        const li = document.createElement('li');
        li.textContent = `${name}: `;
        entries.forEach((entry, index) => {
            li.textContent += `${entry.timeString} (${entry.type})`;
            if (index !== entries.length - 1) {
                li.textContent += ', ';
            }
        });

        const totalWorkTime = calculateTotalWorkTime(entries);
        li.textContent += ` - 총 근무시간: ${totalWorkTime}`;
        entriesList.appendChild(li);
    });
}

function calculateTotalWorkTime(entries) {
    let totalWorkTime = 0;
    let lastEntryTime = null;
    let totalOutgoingTime = 0;
    let lastOutgoingTime = null;

    entries.forEach(entry => {
        const entryTime = new Date(entry.entryTime);

        if (entry.type === '출근') {
            lastEntryTime = entryTime;
        } else if (entry.type === '외출') {
            lastOutgoingTime = entryTime;
        } else if (entry.type === '복귀' && lastOutgoingTime !== null) {
            totalOutgoingTime += entryTime - lastOutgoingTime;
            lastOutgoingTime = null;
        } else if (entry.type === '퇴근' && lastEntryTime) {
            totalWorkTime += entryTime - lastEntryTime - totalOutgoingTime;
            lastEntryTime = null; // 퇴근 후에는 새로운 출근 전까지 근무시간을 계산하지 않음
        }
    });

    return formatTime(totalWorkTime);
}


function formatTime(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}시간 ${minutes}분`;
}

function updateWorkTime(entries) {
    const todayEntries = entries.filter(entry => entry.name === currentUserName && entry.date === getCurrentDate());
    if (todayEntries.length >= 4 && todayEntries[todayEntries.length - 1].type === '퇴근') {
        const totalWorkTime = calculateTotalWorkTime(todayEntries);
        todayEntries[todayEntries.length - 1].totalWorkTime = totalWorkTime;
        localStorage.setItem('attendanceEntries', JSON.stringify(entries));
        loadEntries();
    }
}

// 현재 날짜 반환 함수
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// 페이지를 떠나기 전에 비디오 스트림을 중지하는 이벤트 핸들러
window.addEventListener('beforeunload', () => {
    const stream = video.srcObject;
    const tracks = stream.getTracks();

    tracks.forEach(track => {
        track.stop();
    });

    video.srcObject = null;
});
>>>>>>> 5b900969c2d1eef66b9f0d20dd1347668444f17a
