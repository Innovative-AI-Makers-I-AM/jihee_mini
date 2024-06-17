let captureCount = 0;
let stream;
let previousImage = null;

// 비디오 캡처 시작 버튼 클릭 이벤트 핸들러
window.addEventListener('load', function() {
    document.getElementById('videoContainer').style.display = 'block';
    // 웹캠 스트림 시작
    navigator.mediaDevices.getUserMedia({ video: true })
    .then(function(s) {
        stream = s;
        var video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
    })
    .catch(function(err) {
        console.log("An error occurred: " + err);
    });
});

// 이미지 캡처 버튼 클릭 이벤트 핸들러
document.getElementById('capture').addEventListener('click', function() {
    var video = document.getElementById('video');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // 비디오에서 현재 프레임을 캡처하여 캔버스에 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 캔버스를 이미지 데이터 URL로 변환
    var data = canvas.toDataURL('image/png');

    // 각도 검사
    checkAngle(data, captureCount + 1).then(result => {
        if (result.message === "Angle is correct") {
            captureCount++;
            document.getElementById('image' + captureCount).value = data;
            document.getElementById('photo' + captureCount).src = data;
            document.getElementById('photo' + captureCount).style.display = 'block';
            previousImage = data;
            if (captureCount >= 3) {
                document.getElementById('capture').disabled = true;
                stream.getTracks().forEach(track => track.stop());
            }
            const capCount = document.querySelector(".cap-count");
            capCount.innerText = captureCount;
            updateInstructions(); // 캡처 후 안내 메시지 업데이트
            if(captureCount == 3){
                const submitBtn = document.querySelector('button[type="submit"]');
                const formGroup = document.querySelector('.form-group');
                submitBtn.style.display = "block";
                formGroup.style.display = "block";
            }
        } else {
            alert(result.detail);
        }
    }).catch(error => {
        console.error('Error:', error);
        alert("Error checking angle. Please try again.");
    });
});

function updateInstructions() {
    const instructions = document.getElementById('captureInstructions');
    if (captureCount === 1) {
        instructions.textContent = "두 번째 사진: 왼쪽 얼굴을 향해 주세요.";
    } else if (captureCount === 2) {
        instructions.textContent = "세 번째 사진: 오른쪽 얼굴을 향해 주세요.";
    }
}

document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var formData = new FormData();
    const nameField = document.getElementById('name');
    const image1 = document.getElementById('image1').value;
    const image2 = document.getElementById('image2').value;
    const image3 = document.getElementById('image3').value;
    
    if (!nameField.value || !image1 || !image2 || !image3) {
        alert("모든 필드를 채워주세요.");
        return;
    }

    formData.append('name', nameField.value);
    formData.append('front_image', image1);
    formData.append('left_image', image2);
    formData.append('right_image', image3);

    fetch('/register_user/', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.message === "성공적으로 등록되었습니다.") {
            window.location.href = "/";
        }
    }).catch(error => {
        console.error('Error:', error);
    });
});

async function checkAngle(image, step) {
    var formData = new FormData();
    formData.append('image', image);
    formData.append('step', step);
    const response = await fetch('/check_angle/', {
        method: 'POST',
        body: formData
    });
    return response.json();
}

let video = document.getElementById('video');

video.onloadeddata = (e)=>{
    const captureBtn = document.querySelector("#capture");
    captureBtn.style.display = "block";

}