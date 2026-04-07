const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtons = document.querySelectorAll('.station-btn');
const stationName = document.getElementById('station-name');

let currentStationIndex = -1;

function playStation(index) {
    if (index >= 0 && index < stationButtons.length) {
        const button = stationButtons[index];
        const src = button.getAttribute('data-src');
        const name = button.getAttribute('data-name');

        audioPlayer.src = src;
        stationName.textContent = name;
        audioPlayer.play();
        playPauseBtn.textContent = 'Pause';

        stationButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentStationIndex = index;
    }
}

stationButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        playStation(index);
    });
});

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        if (audioPlayer.src) {
            audioPlayer.play();
            playPauseBtn.textContent = 'Pause';
        } else if (stationButtons.length > 0) {
            playStation(0);
        }
    } else {
        audioPlayer.pause();
        playPauseBtn.textContent = 'Play';
    }
});

prevBtn.addEventListener('click', () => {
    let newIndex = currentStationIndex - 1;
    if (newIndex < 0) {
        newIndex = stationButtons.length - 1;
    }
    playStation(newIndex);
});

nextBtn.addEventListener('click', () => {
    let newIndex = currentStationIndex + 1;
    if (newIndex >= stationButtons.length) {
        newIndex = 0;
    }
    playStation(newIndex);
});