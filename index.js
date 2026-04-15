const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtons = document.querySelectorAll('.station-btn');
const stationName = document.getElementById('station-name');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');

let currentStationIndex = -1;

// Generic artwork for the media session
const GENERIC_ARTWORK = [
    { src: 'https://via.placeholder.com/96x96', sizes: '96x96', type: 'image/png' },
    { src: 'https://via.placeholder.com/128x128', sizes: '128x128', type: 'image/png' },
    { src: 'https://via.placeholder.com/192x192', sizes: '192x192', type: 'image/png' },
    { src: 'https://via.placeholder.com/256x256', sizes: '256x256', type: 'image/png' },
    { src: 'https://via.placeholder.com/384x384', sizes: '384x384', type: 'image/png' },
    { src: 'https://via.placeholder.com/512x512', sizes: '512x512', type: 'image/png' },
];

function updateMetadata(station) {
    if ('mediaSession' in navigator) {
        console.log('Updating metadata for:', station.name);
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: 'Online Radio',
            album: 'Live Stream',
            artwork: GENERIC_ARTWORK // Use generic artwork
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
                // Playback started successfully, UI updated by 'play' event listener
            }).catch(error => {
                console.error("Playback failed:", error);
                showPlayIcon();
                if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
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
        audioPlayer.play().catch(error => {
            console.error("Manual play failed:", error);
            showPlayIcon();
            if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
        });
    } else if (stationButtons.length > 0) {
        // If no station is selected, play the first one
        playStation(0);
    }
}

function pause() {
    audioPlayer.pause();
}

function nextTrack() {
    console.log('Executing nextTrack via button or MediaSession');
    let newIndex = currentStationIndex + 1;
    if (newIndex >= stationButtons.length) {
        newIndex = 0;
    }
    playStation(newIndex);
}

function prevTrack() {
    console.log('Executing prevTrack via button or MediaSession');
    let newIndex = currentStationIndex - 1;
    if (newIndex < 0) {
        newIndex = stationButtons.length - 1;
    }
    playStation(newIndex);
}

// --- Event Listeners for UI ---
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

// --- Event Listeners for audioPlayer state changes ---
audioPlayer.addEventListener('play', () => {
    console.log('AudioPlayer: playing');
    showPauseIcon();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
    }
});

audioPlayer.addEventListener('pause', () => {
    console.log('AudioPlayer: paused');
    showPlayIcon();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
});

audioPlayer.addEventListener('ended', () => {
    console.log('AudioPlayer: ended');
    showPlayIcon();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
    // Optionally, play next track automatically
    // nextTrack();
});

audioPlayer.addEventListener('error', (e) => {
    console.error('AudioPlayer: error', e);
    showPlayIcon();
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
    stationName.textContent = 'Error playing station';
});


// --- Media Session API Integration ---
if ('mediaSession' in navigator) {
    console.log('Setting up Media Session handlers');

    navigator.mediaSession.setActionHandler('play', () => {
        console.log('MediaSession: Play command received');
        play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
        console.log('MediaSession: Pause command received');
        pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('MediaSession: Previous Track command received');
        prevTrack();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('MediaSession: Next Track command received');
        nextTrack();
    });
}

// Initial state
showPlayIcon();
