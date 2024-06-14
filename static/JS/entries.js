export function loadEntries() {
    const entriesList = document.getElementById('entries');
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

export function addEntry(name, time, type) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const entry = {
        name: name,
        timeString: timeString,
        type: type,
        entryTime: now.toISOString(),
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

export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
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
            lastEntryTime = null;
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
