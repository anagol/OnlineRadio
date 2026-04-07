const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtons = document.querySelectorAll('.station-btn');
const stationName = document.getElementById('station-name');

let currentStationIndex = -1;

function updateMetadata(station) {
    if ('mediaSession' in navigator) {
        console.log('Updating metadata for:', station.name);
        navigator.mediaSession.metadata = new MediaMetadata({
            title: station.name,
            artist: 'Online Radio',
            album: 'Live Stream',
            artwork: [] 
        });
    }
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
                playPauseBtn.textContent = 'Pause';
                playPauseBtn.classList.add('playing'); // Add class on play
                if ('mediaSession' in navigator) {
                    navigator.mediaSession.playbackState = 'playing';
                }
            }).catch(error => {
                console.error("Playback failed:", error);
                playPauseBtn.textContent = 'Play';
                playPauseBtn.classList.remove('playing'); // Remove class on fail
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
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('playing'); // Add class on play
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
        }
    } else if (stationButtons.length > 0) {
        playStation(0);
    }
}

function pause() {
    audioPlayer.pause();
    playPauseBtn.textContent = 'Play';
    playPauseBtn.classList.remove('playing'); // Remove class on pause
    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
    }
}

function nextTrack() {
    console.log('Executing nextTrack');
    let newIndex = currentStationIndex + 1;
    if (newIndex >= stationButtons.length) {
        newIndex = 0;
    }
    playStation(newIndex);
}

function prevTrack() {
    console.log('Executing prevTrack');
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
    console.log('Setting up Media Session handlers');
    
    navigator.mediaSession.setActionHandler('play', () => {
        console.log('MediaSession: Play');
        play();
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
        console.log('MediaSession: Pause');
        pause();
    });
    
    navigator.mediaSession.setActionHandler('previoustrack', () => {
        console.log('MediaSession: Previous Track');
        prevTrack();
    });
    
    navigator.mediaSession.setActionHandler('nexttrack', () => {
        console.log('MediaSession: Next Track');
        nextTrack();
    });
}
