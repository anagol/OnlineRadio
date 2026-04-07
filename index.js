const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtons = document.querySelectorAll('.station-btn');
const stationName = document.getElementById('station-name');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');

let currentStationIndex = -1;

function updateMetadata(station) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: 'Online Radio',
            album: 'Live Stream',
            artwork: []
        });
    }
}

function showPlayIcon() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    playPauseBtn.setAttribute('title', 'Play');
}

function showPauseIcon() {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    playPauseBtn.setAttribute('title', 'Pause');
}

function playStation(index) {
    if (index >= 0 && index < stationButtons.length) {
        const button = stationButtons[index];
        const src = button.getAttribute('data-src');
        const name = button.getAttribute('data-name');

        audioPlayer.src = src;
        stationName.textContent = name;

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                showPauseIcon();
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            }).catch(error => {
                console.error("Playback failed:", error);
                showPlayIcon();
            });
        }

        stationButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentStationIndex = index;

        updateMetadata({ name: name });
    }
}

function play() {
    if (audioPlayer.src) {
        audioPlayer.play();
        showPauseIcon();
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    } else if (stationButtons.length > 0) {
        playStation(0);
    }
}

function pause() {
    audioPlayer.pause();
    showPlayIcon();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
}

function nextTrack() {
    let newIndex = currentStationIndex + 1;
    if (newIndex >= stationButtons.length) {
        newIndex = 0;
    }
    playStation(newIndex);
}

function prevTrack() {
    let newIndex = currentStationIndex - 1;
    if (newIndex < 0) {
        newIndex = stationButtons.length - 1;
    }
    playStation(newIndex);
}

// --- Event Listeners ---
stationButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        playStation(index);
    });
});

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        play();
    } else {
        pause();
    }
});

prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

// --- Media Session API Integration ---
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
}
