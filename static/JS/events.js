export function addEventListeners(handleAction) {
    const entryButton = document.getElementById('entryButton');
    const outgoingButton = document.getElementById('outgoingButton');
    const returningButton = document.getElementById('returningButton');
    const exitButton = document.getElementById('exitButton');
    const cancelButton = document.getElementById('cancelButton');

    entryButton.addEventListener('click', () => handleAction('출근'));
    outgoingButton.addEventListener('click', () => handleAction('외출'));
    returningButton.addEventListener('click', () => handleAction('복귀'));
    exitButton.addEventListener('click', () => handleAction('퇴근'));
    cancelButton.addEventListener('click', () => {
        const confirmationModal = document.getElementById('confirmationModal');
        confirmationModal.style.display = 'none';
        isFaceDetected = false;
    });
}