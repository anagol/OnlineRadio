const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtons = document.querySelectorAll('.station-btn');
const stationName = document.getElementById('station-name');
const eqBandsContainer = document.querySelector('.eq-bands');
const resetEqBtn = document.getElementById('resetEqBtn');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');

let currentStationIndex = -1;
let audioContext, audioSource, filters;
let eqSliders = [];

const FREQUENCIES = [60, 170, 350, 1000, 3500, 10000];

function setupAudioContext() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSource = audioContext.createMediaElementSource(audioPlayer);

        filters = FREQUENCIES.map(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        audioSource.connect(filters[0]);
        for (let i = 0; i < filters.length - 1; i++) {
            filters[i].connect(filters[i + 1]);
        }
        filters[filters.length - 1].connect(audioContext.destination);

    } catch (e) {
        console.error("Web Audio API is not supported or failed to initialize.", e);
    }
}

function createEqualizerUI() {
    FREQUENCIES.forEach((freq, i) => {
        const band = document.createElement('div');
        band.className = 'eq-band';

        const label = document.createElement('label');
        label.textContent = freq < 1000 ? `${freq}Hz` : `${freq / 1000}KHz`;
        
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = -12;
        slider.max = 12;
        slider.step = 0.1;
        slider.value = 0;
        
        slider.addEventListener('input', (e) => {
            if (filters) {
                filters[i].gain.value = e.target.value;
            }
        });

        sliderContainer.appendChild(slider);
        band.appendChild(sliderContainer);
        band.appendChild(label);
        eqBandsContainer.appendChild(band);
        eqSliders.push(slider);
    });
}

function resetEqualizer() {
    eqSliders.forEach((slider, i) => {
        slider.value = 0;
        if (filters) {
            filters[i].gain.value = 0;
        }
    });
}

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
        setupAudioContext();
        
        const button = stationButtons[index];
        const src = button.getAttribute('data-src');
        const name = button.getAttribute('data-name');

        audioPlayer.src = src;
        stationName.textContent = name;

        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                showPauseIcon();
                if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
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
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else if (stationButtons.length > 0) {
        playStation(0);
    }
}

function pause() {
    audioPlayer.pause();
    showPlayIcon();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
}

function nextTrack() {
    let newIndex = currentStationIndex + 1;
    if (newIndex >= stationButtons.length) newIndex = 0;
    playStation(newIndex);
}

function prevTrack() {
    let newIndex = currentStationIndex - 1;
    if (newIndex < 0) newIndex = stationButtons.length - 1;
    playStation(newIndex);
}

// --- Initialize ---
createEqualizerUI();

// --- Event Listeners ---
stationButtons.forEach((button, index) => {
    button.addEventListener('click', () => playStation(index));
});

playPauseBtn.addEventListener('click', () => {
    if (!audioContext) {
        playStation(currentStationIndex >= 0 ? currentStationIndex : 0);
    } else if (audioPlayer.paused) {
        play();
    } else {
        pause();
    }
});

prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
resetEqBtn.addEventListener('click', resetEqualizer);

// --- Media Session API Integration ---
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', play);
    navigator.mediaSession.setActionHandler('pause', pause);
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
}
