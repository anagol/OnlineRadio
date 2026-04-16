// --- DOM Elements ---
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
// ... (all other DOM elements are the same)
const modal = document.getElementById('addStationModal');
const addStationBtn = document.getElementById('addStationBtn');
const closeModalBtn = document.querySelector('.close-btn');
const saveStationBtn = document.getElementById('saveStationBtn');
// ... (and so on for all elements)

// --- Functions ---

function openModal() {
    modal.style.display = 'flex'; // Use flex to enable centering
    // Use a tiny timeout to allow the display property to apply before starting the transition
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    modal.classList.remove('show');
    // Wait for the transition to finish before setting display to none
    modal.addEventListener('transitionend', () => {
        modal.style.display = 'none';
    }, { once: true }); // The listener will be removed after it runs once
}

// --- Event Listeners ---
addStationBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
saveStationBtn.addEventListener('click', () => {
    addNewStation();
    // The closeModal() is now implicitly handled by addNewStation if successful
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

function addNewStation() {
    const name = newStationNameInput.value.trim();
    const src = newStationUrlInput.value.trim();

    if (name && src) {
        const newStation = { id: Date.now(), name, src };
        stations.push(newStation);
        localStorage.setItem(LS_STATIONS_KEY, JSON.stringify(stations));
        renderStations();
        newStationNameInput.value = '';
        newStationUrlInput.value = '';
        closeModal(); // Close modal on success
    }
}

// The rest of your index.js file remains the same.
// I will just paste the full content to be safe.

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtonsContainer = document.querySelector('.station-buttons');
const stationNameEl = document.getElementById('station-name');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const favoritesToggle = document.getElementById('favoritesToggle');
const newStationNameInput = document.getElementById('newStationName');
const newStationUrlInput = document.getElementById('newStationUrl');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const loadingIcon = playPauseBtn.querySelector('.loading-icon');
const volumeUpIcon = muteBtn.querySelector('.volume-up-icon');
const volumeMuteIcon = muteBtn.querySelector('.volume-mute-icon');

const LS_VOLUME_KEY = 'radioPlayerVolume';
const LS_LAST_STATION_KEY = 'radioPlayerLastStationId';
const LS_STATIONS_KEY = 'radioPlayerStations';
const LS_FAVORITES_KEY = 'radioPlayerFavorites';

let stations = [];
let favorites = [];
let currentStationId = null;

const DEFAULT_STATIONS = [
    { id: 1, name: "Medlyak FM", src: "https://radiorecord.hostingradio.ru/mdl96.aacp" },
    { id: 2, name: "Русское Радио", src: "https://rusradio.hostingradio.ru/rusradio96.aacp?0.7839820559672495" },
    { id: 3, name: "Серебряный дождь", src: "https://silverrain.hostingradio.ru/silver32.aacp?radiostatistica=IRP_FMPlay" },
    { id: 4, name: "Relax FM", src: "https://fed.fmplay.ru:8000/relax-32.aac" }
];

function showLoading(isLoading) {
    loadingIcon.style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'none';
    }
}

function renderStations() {
    stationButtonsContainer.innerHTML = '';
    stations.forEach(station => {
        const button = document.createElement('button');
        button.className = 'station-btn';
        button.dataset.id = station.id;

        const text = document.createElement('span');
        text.className = 'station-text';
        text.textContent = station.name;

        const star = document.createElement('span');
        star.className = 'favorite-star';
        star.innerHTML = favorites.includes(station.id) 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
        
        if (favorites.includes(station.id)) {
            star.classList.add('is-favorite');
        }

        button.appendChild(text);
        button.appendChild(star);
        stationButtonsContainer.appendChild(button);
    });
    addStationButtonListeners();
    filterStations();
}

function addStationButtonListeners() {
    document.querySelectorAll('.station-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-star')) return;
            const stationId = parseInt(button.dataset.id, 10);
            playStation(stationId);
        });

        const star = button.querySelector('.favorite-star');
        star.addEventListener('click', () => {
            const stationId = parseInt(button.dataset.id, 10);
            toggleFavorite(stationId);
        });
    });
}

function playStation(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (station) {
        showLoading(true);
        audioPlayer.src = station.src;
        stationNameEl.textContent = station.name;
        currentStationId = station.id;
        localStorage.setItem(LS_LAST_STATION_KEY, station.id);
        
        document.querySelectorAll('.station-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.id, 10) === stationId);
        });

        audioPlayer.play().catch(e => {
            console.error("Playback failed", e);
            showLoading(false);
        });
    }
}

function toggleFavorite(stationId) {
    if (favorites.includes(stationId)) {
        favorites = favorites.filter(id => id !== stationId);
    } else {
        favorites.push(stationId);
    }
    localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(favorites));
    renderStations();
}

function filterStations() {
    const showFavorites = favoritesToggle.checked;
    document.querySelectorAll('.station-btn').forEach(button => {
        const stationId = parseInt(button.dataset.id, 10);
        if (showFavorites && !favorites.includes(stationId)) {
            button.style.display = 'none';
        } else {
            button.style.display = 'flex';
        }
    });
}

function loadData() {
    const savedStations = localStorage.getItem(LS_STATIONS_KEY);
    if (savedStations) {
        stations = JSON.parse(savedStations);
    } else {
        stations = DEFAULT_STATIONS;
        localStorage.setItem(LS_STATIONS_KEY, JSON.stringify(stations));
    }

    const savedFavorites = localStorage.getItem(LS_FAVORITES_KEY);
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }

    const savedVolume = localStorage.getItem(LS_VOLUME_KEY);
    if (savedVolume !== null) {
        volumeSlider.value = savedVolume;
        audioPlayer.volume = savedVolume;
    }

    const savedLastStationId = localStorage.getItem(LS_LAST_STATION_KEY);
    if (savedLastStationId !== null) {
        const station = stations.find(s => s.id === parseInt(savedLastStationId, 10));
        if (station) {
            stationNameEl.textContent = station.name;
            currentStationId = station.id;
        }
    }
}

function updateVolumeUI() {
    if (audioPlayer.muted || audioPlayer.volume === 0) {
        volumeUpIcon.style.display = 'none';
        volumeMuteIcon.style.display = 'block';
    } else {
        volumeUpIcon.style.display = 'block';
        volumeMuteIcon.style.display = 'none';
    }
}

favoritesToggle.addEventListener('change', filterStations);

playPauseBtn.addEventListener('click', () => {
    if (audioPlayer.paused) {
        if (!audioPlayer.src && currentStationId) {
            playStation(currentStationId);
        } else {
            audioPlayer.play();
        }
    } else {
        audioPlayer.pause();
    }
});

prevBtn.addEventListener('click', () => {
    const currentIndex = stations.findIndex(s => s.id === currentStationId);
    const newIndex = (currentIndex - 1 + stations.length) % stations.length;
    playStation(stations[newIndex].id);
});

nextBtn.addEventListener('click', () => {
    const currentIndex = stations.findIndex(s => s.id === currentStationId);
    const newIndex = (currentIndex + 1) % stations.length;
    playStation(stations[newIndex].id);
});

muteBtn.addEventListener('click', () => {
    audioPlayer.muted = !audioPlayer.muted;
    updateVolumeUI();
});

volumeSlider.addEventListener('input', (e) => {
    audioPlayer.muted = false;
    audioPlayer.volume = e.target.value;
    localStorage.setItem(LS_VOLUME_KEY, e.target.value);
});

audioPlayer.addEventListener('volumechange', updateVolumeUI);
audioPlayer.addEventListener('playing', () => { showLoading(false); playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
audioPlayer.addEventListener('waiting', () => showLoading(true));
audioPlayer.addEventListener('pause', () => { showLoading(false); playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });

// --- Initial Load ---
loadData();
renderStations();
updateVolumeUI();
if (currentStationId) {
    document.querySelectorAll('.station-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id, 10) === currentStationId);
    });
}
