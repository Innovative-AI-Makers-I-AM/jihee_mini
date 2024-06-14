// 현재 웹의 상태를 저장하는 변수들을 모은 js
export let currentUserName = '';
export let isFaceDetected = false;

export function setCurrentUserName(name) {
    currentUserName = name;
}

export function getCurrentUserName() {
    return currentUserName;
}

export function setIsFaceDetected(value) {
    isFaceDetected = value;
}

export function getIsFaceDetected() {
    return isFaceDetected;
}
