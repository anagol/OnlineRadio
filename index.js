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
const visualizerCanvas = document.getElementById('visualizer');

const playIcon = playPauseBtn.querySelector('.play-icon');
const pauseIcon = playPauseBtn.querySelector('.pause-icon');
const loadingIcon = playPauseBtn.querySelector('.loading-icon');

// --- Audio API & Visualizer State ---
let audioContext;
let analyser;
let source;
const canvasCtx = visualizerCanvas.getContext('2d');
let animationFrameId;

// --- localStorage Keys & State ---
const LS_LAST_STATION_KEY = 'radioPlayerLastStationId';
const LS_STATIONS_KEY = 'radioPlayerStations';
const LS_FAVORITES_KEY = 'radioPlayerFavorites';
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

// --- Visualizer Functions ---
function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 128;
        // Resume context on user gesture
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    } catch (e) {
        console.error("Web Audio API is not supported.", e);
    }
}

function visualize() {
    if (!analyser || animationFrameId) return; // Don't start if already running
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
        animationFrameId = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

        const barWidth = (visualizerCanvas.width / bufferLength) * 2;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 2;
            
            const gradient = canvasCtx.createLinearGradient(0, visualizerCanvas.height, 0, visualizerCanvas.height - barHeight);
            gradient.addColorStop(0, '#f95738');
            gradient.addColorStop(1, '#fc9e4f');
            canvasCtx.fillStyle = gradient;
            
            canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 2;
        }
    };
    draw();
}

function stopVisualizer() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
}

// --- Core App Functions ---
function playStation(stationId) {
    const station = stations.find(s => s.id === stationId);
    if (station) {
        initAudio(); // Ensure context is ready
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

// ... (Rest of the functions: openModal, closeModal, renderStations, etc.)
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
    filterStations(true);
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

function toggleFavorite(stationId) {
    if (favorites.includes(stationId)) {
        favorites = favorites.filter(id => id !== stationId);
    } else {
        favorites.push(stationId);
    }
    localStorage.setItem(LS_FAVORITES_KEY, JSON.stringify(favorites));
    renderStations();
}

function filterStations(isInitialRender = false) {
    const showFavorites = favoritesToggle.checked;
    let visibleCount = 0;
    document.querySelectorAll('.station-btn').forEach(button => {
        const stationId = parseInt(button.dataset.id, 10);
        const isVisible = !showFavorites || favorites.includes(stationId);
        
        button.style.display = isVisible ? 'flex' : 'none';
        
        if (isVisible) {
            if (isInitialRender) {
                button.style.transitionDelay = `${visibleCount * 50}ms`;
                setTimeout(() => button.classList.add('visible'), 50);
            } else {
                button.classList.add('visible');
            }
            visibleCount++;
        } else {
            button.classList.remove('visible');
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
favoritesToggle.addEventListener('change', () => filterStations(true));
addStationBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
saveStationBtn.addEventListener('click', addNewStation);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

playPauseBtn.addEventListener('click', () => {
    initAudio(); // Ensure context is ready
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

audioPlayer.addEventListener('playing', () => {
    showLoading(false);
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    visualize();
});
audioPlayer.addEventListener('waiting', () => showLoading(true));
audioPlayer.addEventListener('pause', () => {
    showLoading(false);
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    stopVisualizer();
});

// --- Initial Load ---
loadData();
renderStations();
if (currentStationId) {
    document.querySelectorAll('.station-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.id, 10) === currentStationId);
    });
}
