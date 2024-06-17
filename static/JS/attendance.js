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

    // GET 요청으로 유저 ID 가져오기
    fetch(`get_today_attendance`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    })
    .then(response => response.json())
    .then(entries => {
        console.log(entries);
        entriesList.innerHTML = ''; // 기존 리스트 초기화
        
        for (let entry of entries) {
            let totalWorkTime = calculateTotalWorkTime(entry);
            let totalLeaveTime = calculateTotalLeaveTime(entry);
            
            let li = document.createElement('li');
            li.textContent = `${entry.name} - (입실) ${entry.entry_time || '없음'} (퇴실) ${entry.exit_time || '없음'} (외출) ${entry.leave_time || '없음'} (복귀) ${entry.return_time || '없음'} // (근무시간) ${totalWorkTime} // (외출시간) ${totalLeaveTime}`;
            entriesList.appendChild(li);
        }
    })
    .catch(error => console.error('Error fetching attendance data:', error));
}

function calculateTotalWorkTime(entry) {
    if (!entry.entry_time || !entry.exit_time) {
        return '00:00:00';
    }

    let entryTime = new Date(`1970-01-01T${entry.entry_time}Z`);
    let exitTime = new Date(`1970-01-01T${entry.exit_time}Z`);
    let totalWorkTime = (exitTime - entryTime); // 밀리초 단위로 계산

    if (entry.leave_time && entry.return_time) {
        let leaveTime = new Date(`1970-01-01T${entry.leave_time}Z`);
        let returnTime = new Date(`1970-01-01T${entry.return_time}Z`);
        let totalLeaveTime = (returnTime - leaveTime); // 밀리초 단위로 계산
        totalWorkTime -= totalLeaveTime;
    }

    return formatTime(totalWorkTime);
}

function calculateTotalLeaveTime(entry) {
    if (!entry.leave_time || !entry.return_time) {
        return '00:00:00';
    }

    let leaveTime = new Date(`1970-01-01T${entry.leave_time}Z`);
    let returnTime = new Date(`1970-01-01T${entry.return_time}Z`);
    let totalLeaveTime = (returnTime - leaveTime); // 밀리초 단위로 계산

    return formatTime(totalLeaveTime);
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // 두 자리 숫자로 포맷팅
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// 출,외,복,퇴 버튼 처리
export function handleAction(type) {

    let userId = null;  

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

        confirmationModal.style.display = 'none';
        setIsFaceDetected(false);
        if (type === '퇴근') {
            setIsFaceDetected(true);
        }
    })
    .catch(error => console.error('Error:', error));
    }


// 현재 상태에 맞춰서 버튼 선택적으로 보여주기
export function showModalBasedOnState() {
    const userName = getCurrentUserName();
    const currentDate = getCurrentDate();

    // GET 요청으로 출퇴근 기록을 가져오기
    fetch(`get_one_today_attendance?name=${userName}&date=${currentDate}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(entry => {

        entryButton.style.display = 'none';
        outgoingButton.style.display = 'none';
        returningButton.style.display = 'none';
        exitButton.style.display = 'none';
        cancelButton.style.display = 'inline-block'; // 취소 버튼은 항상 보이게 설정

        if (!entry) {
            // 출퇴근 기록이 없는 경우
            entryButton.style.display = 'inline-block';
            confirmationMessage.textContent = `${userName}님 출근하시겠습니까?`;
        } else {
            // 출퇴근 기록이 있는 경우
            if (!entry.exit_time) {
                // 퇴근 기록이 없는 경우
                if (!entry.leave_time) {
                    // 외출 기록이 없는 경우
                    outgoingButton.style.display = 'inline-block';
                    exitButton.style.display = 'inline-block';
                    confirmationMessage.textContent = `${userName}님 외출 또는 퇴근하시겠습니까?`;
                } else {
                    // 외출 기록이 있는 경우
                    returningButton.style.display = 'inline-block';
                    exitButton.style.display = 'inline-block';
                    confirmationMessage.textContent = `${userName}님 복귀 또는 퇴근하시겠습니까?`;
                }
            } else {
                // 퇴근 기록이 있는 경우
                // exitButton.style.display = 'inline-block';
                // confirmationMessage.textContent = `${userName}님 퇴근하시겠습니까?`;
                return;
            }
        }

        confirmationModal.style.display = 'block';
    })
    .catch(error => {
        console.error('Error fetching attendance data:', error);
        // 에러 발생 시 처리 로직 추가 가능
    });
}


// 현재 날짜 가져오기
export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}
