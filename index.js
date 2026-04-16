// --- DOM Elements ---
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stationButtonsContainer = document.querySelector('.station-buttons');
const stationNameEl = document.getElementById('station-name');
const favoritesToggle = document.getElementById('favoritesToggle');
const addStationBtn = document.getElementById('addStationBtn');
const modal = document.getElementById('addStationModal');
const closeModalBtn = document.querySelector('.close-btn');
const saveStationBtn = document.getElementById('saveStationBtn');
const newStationNameInput = document.getElementById('newStationName');
const newStationUrlInput = document.getElementById('newStationUrl');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const loadingIcon = playPauseBtn.querySelector('.loading-icon');

// --- localStorage Keys ---
const LS_LAST_STATION_KEY = 'radioPlayerLastStationId';
const LS_STATIONS_KEY = 'radioPlayerStations';
const LS_FAVORITES_KEY = 'radioPlayerFavorites';

// --- State ---
let stations = [];
let favorites = [];
let currentStationId = null;

// --- Default Stations ---
const DEFAULT_STATIONS = [
    { id: 1, name: "Medlyak FM", src: "https://radiorecord.hostingradio.ru/mdl96.aacp" },
    { id: 2, name: "Русское Радио", src: "https://rusradio.hostingradio.ru/rusradio96.aacp?0.7839820559672495" },
    { id: 3, name: "Серебряный дождь", src: "https://silverrain.hostingradio.ru/silver32.aacp?radiostatistica=IRP_FMPlay" },
    { id: 4, name: "Relax FM", src: "https://fed.fmplay.ru:8000/relax-32.aac" }
];

// --- Functions ---

function openModal() {
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal() {
    modal.classList.remove('show');
    modal.addEventListener('transitionend', () => {
        modal.style.display = 'none';
    }, { once: true });
}

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

function getVisibleStations() {
    const showFavorites = favoritesToggle.checked;
    if (showFavorites) {
        return stations.filter(station => favorites.includes(station.id));
    }
    return stations;
}

function nextTrack() {
    const visibleStations = getVisibleStations();
    if (visibleStations.length === 0) return;

    const currentIndex = visibleStations.findIndex(s => s.id === currentStationId);
    const newIndex = (currentIndex + 1) % visibleStations.length;
    playStation(visibleStations[newIndex].id);
}

function prevTrack() {
    const visibleStations = getVisibleStations();
    if (visibleStations.length === 0) return;

    const currentIndex = visibleStations.findIndex(s => s.id === currentStationId);
    const newIndex = (currentIndex - 1 + visibleStations.length) % visibleStations.length;
    playStation(visibleStations[newIndex].id);
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

    const savedLastStationId = localStorage.getItem(LS_LAST_STATION_KEY);
    if (savedLastStationId !== null) {
        const station = stations.find(s => s.id === parseInt(savedLastStationId, 10));
        if (station) {
            stationNameEl.textContent = station.name;
            currentStationId = station.id;
        }
    }
}

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
        closeModal();
    }
}

// --- Event Listeners ---
favoritesToggle.addEventListener('change', filterStations);

addStationBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
saveStationBtn.addEventListener('click', addNewStation);
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

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

prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

audioPlayer.addEventListener('playing', () => { showLoading(false); playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; });
audioPlayer.addEventListener('waiting', () => showLoading(true));
audioPlayer.addEventListener('pause', () => { showLoading(false); playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; });

// --- Initial Load ---
loadData();
renderStations();
if (currentStationId) {
    document.querySelectorAll('.station-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id, 10) === currentStationId);
    });
}
