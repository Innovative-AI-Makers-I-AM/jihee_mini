const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const resultDiv = document.getElementById('result');
const entriesList = document.getElementById('entries');

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Error accessing webcam:', err);
    });

captureButton.addEventListener('click', () => {
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
            resultDiv.innerHTML = `<p>User: ${result.name}</p><p>Similarity: ${result.similarity}</p>`;
            addEntry(result.name);
        } else if (response.status === 404) {
            alert('No matching user found. Redirecting to registration page.');
            window.location.href = "/register";
        } else {
            const result = await response.json();
            resultDiv.innerHTML = `<p>${result.detail}</p>`;
        }
    }, 'image/jpeg');
});

function addEntry(name) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const entry = document.createElement('li');
    entry.textContent = `${timeString} - ${name}`;
    entriesList.appendChild(entry);
}
