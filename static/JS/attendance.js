import { getCurrentUserName, getIsFaceDetected, setIsFaceDetected } from './state.js';

// 출근 버튼
const entryButton = document.getElementById('entryButton');
// 외출 버튼
const outgoingButton = document.getElementById('outgoingButton');
// 복귀 버튼
const returningButton = document.getElementById('returningButton');
// 퇴근 버튼
const exitButton = document.getElementById('exitButton');
// 취소 버튼
const cancelButton = document.getElementById('cancelButton');
// 버튼 감싸는 모달
const confirmationModal = document.getElementById('confirmationModal');
// 사용자 확인용 텍스트 메시지
const confirmationMessage = document.getElementById('confirmationMessage');
// 출퇴근 기록 리스트
const entriesList = document.getElementById('entries');

// 버튼 이벤트 리스너 설정
entryButton.addEventListener('click', () => handleAction('출근'));
outgoingButton.addEventListener('click', () => handleAction('외출'));
returningButton.addEventListener('click', () => handleAction('복귀'));
exitButton.addEventListener('click', () => handleAction('퇴근'));
cancelButton.addEventListener('click', () => {
    confirmationModal.style.display = 'none';
    setIsFaceDetected(false);
});

// 출퇴근 리스트 불러오기
export function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    const usersMap = new Map();

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

// 출,외,복,퇴 버튼 처리
export function handleAction(type) {

    let userId = null;  // 'let' 키워드를 사용하여 변수를 재할당할 수 있게 합니다.

    const userName = getCurrentUserName();

    const params = new URLSearchParams({
        'name': userName
    });

    // GET 요청으로 유저 ID 가져오기
    fetch(`get_user_id?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then(response => response.json())
    .then(data => {
        userId = data.user_id;
        console.log('User ID:', userId);

        // userId가 설정된 후에 switch 문 실행
        switch (type) {
            case '출근':
                fetch('attendance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'user_id': userId
                    })
                })
                .then(response => response.json())
                .then(data => {console.log(data); console.log("출근됨")})
                .catch(error => console.error('Error:', error));
                break;
            case '외출':
                fetch('leave', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'user_id': userId
                    })
                })
                .then(response => response.json())
                .then(data => {console.log(data); console.log("외출됨")})
                .catch(error => console.error('Error:', error));
                break;
            case '복귀':
                fetch('return', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'user_id': userId
                    })
                })
                .then(response => response.json())
                .then(data => {console.log(data); console.log("복귀됨")})
                .catch(error => console.error('Error:', error));
                break;
            case '퇴근':
                fetch('exit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'user_id': userId
                    })
                })
                .then(response => response.json())
                .then(data => {console.log(data); console.log("퇴근됨")})
                .catch(error => console.error('Error:', error));
                break;
        }

        // const now = new Date();
        // addEntry(getCurrentUserName(), now, type);
        confirmationModal.style.display = 'none';
        setIsFaceDetected(false);
        if (type === '퇴근') {
            setIsFaceDetected(true);
        }
    })
    .catch(error => console.error('Error:', error));
    }

// LocalStorage에 넣기 위해 데이터 처리 및 저장
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

// LocalStorage에 데이터 저장
function saveEntry(entry) {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    entries.push(entry);
    localStorage.setItem('attendanceEntries', JSON.stringify(entries));
}

// 총 근무시간 계산하기
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
            lastEntryTime = null;
        }
    });

    return formatTime(totalWorkTime);
}

// 총 근무시간을 nn시간 nn분으로 반환
function formatTime(milliseconds) {
    const totalMinutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}시간 ${minutes}분`;
}

// 현재 상태에 맞춰서 버튼 선택적으로 보여주기
export function showModalBasedOnState() {
    const entries = JSON.parse(localStorage.getItem('attendanceEntries')) || [];
    const todayEntries = entries.filter(entry => entry.name === getCurrentUserName() && entry.date === getCurrentDate());

    let hasOutgoing = false;

    // 외출이 이미 한 번 이상 있었는지 체크
    todayEntries.forEach(entry => {
        if (entry.type === '외출') {
            hasOutgoing = true;
        }
    });

    entryButton.style.display = 'none';
    outgoingButton.style.display = 'none';
    returningButton.style.display = 'none';
    exitButton.style.display = 'none';

    if (todayEntries.length === 0) {
        entryButton.style.display = 'inline-block';
        confirmationMessage.textContent = `${getCurrentUserName()}님 출근하시겠습니까?`;
    } else {
        const lastEntry = todayEntries[todayEntries.length - 1];
        if ((lastEntry.type === '출근' || lastEntry.type === '복귀') && !hasOutgoing) {
            outgoingButton.style.display = 'inline-block';
            exitButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${getCurrentUserName()}님 외출 또는 퇴근하시겠습니까?`;
        } else if (lastEntry.type === '외출') {
            returningButton.style.display = 'inline-block';
            exitButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${getCurrentUserName()}님 복귀 또는 퇴근하시겠습니까?`;
        } else if (lastEntry.type === '출근' || lastEntry.type === '복귀') {
            exitButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${getCurrentUserName()}님 퇴근하시겠습니까?`;
        }
    }

    confirmationModal.style.display = 'block';
}


// 현재 날짜 가져오기
export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
