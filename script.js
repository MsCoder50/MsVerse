const API_BASE = 'http://localhost:3000';
let currentAudio = null;
let isPlaying = false;
let currentPlaylistTracks = [];
let currentTrackIndex = -1;
let currentPlaylistName = '';

document.addEventListener('DOMContentLoaded', () => {
    fetchPlaylists();
    setupControls();
    setupSidebarToggle();
});

/* ─── PLAYLISTS ──────────────────────────────────────── */

async function fetchPlaylists() {
    try {
        const res = await fetch(`${API_BASE}/api/playlists`);
        const playlists = await res.json();
        renderPlaylists(playlists);
    } catch (err) {
        console.error("Failed to fetch playlists:", err);
    }
}

function renderPlaylists(playlists) {
    const container = document.querySelector('.playlists .cards');
    container.innerHTML = '';

    let row;
    playlists.forEach((playlist, i) => {
        if (i % 4 === 0) {
            row = document.createElement('div');
            row.className = 'row';
            container.appendChild(row);
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="top" style="background-image: url('${playlist.coverImage}')"></div>
            <div class="bottom">
                <h3>${playlist.name}</h3>
                <h5>${playlist.totalSongs} Songs</h5>
                <h5>${playlist.author}</h5>
            </div>
        `;

        card.addEventListener('click', () => {
            fetchTracks(playlist.id, playlist.name);
            if (window.innerWidth <= 900) {
                document.querySelector('.sidebar').classList.add('show-sidebar');
            }
        });

        row.appendChild(card);
    });
}

/* ─── TRACKS ─────────────────────────────────────────── */

async function fetchTracks(playlistId, playlistName) {
    try {
        const res = await fetch(`${API_BASE}/api/playlists/${playlistId}/tracks`);
        const tracks = await res.json();
        currentPlaylistTracks = tracks;
        currentPlaylistName = playlistName || playlistId;
        renderTracks(tracks);
    } catch (err) {
        console.error("Failed to fetch tracks:", err);
    }
}

function renderTracks(tracks) {
    const sidebarBottom = document.querySelector('.sidebar .bottom');
    sidebarBottom.innerHTML = '';

    tracks.forEach((track, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = idx;
        card.innerHTML = `
            <div class="content">
                <h3 class="songName">${track.title}</h3>
                <p class="duration">${track.duration}</p>
            </div>
            <div class="play">
                <img src="img/play.svg" alt="Play">
            </div>
        `;
        card.addEventListener('click', () => playByIndex(idx));
        sidebarBottom.appendChild(card);
    });
}

function setActiveTrackCard(index) {
    document.querySelectorAll('.sidebar .bottom .card').forEach((c, i) => {
        c.classList.toggle('active', i === index);
    });
}

/* ─── PLAYBACK ───────────────────────────────────────── */

function playByIndex(index) {
    if (index < 0 || index >= currentPlaylistTracks.length) return;
    currentTrackIndex = index;
    playTrack(currentPlaylistTracks[index]);
    setActiveTrackCard(index);
}

function playTrack(track) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.removeEventListener('timeupdate', updateProgress);
        currentAudio.removeEventListener('ended', onTrackEnded);
    }

    currentAudio = new Audio(`${API_BASE}/stream/${track.file}`);
    currentAudio.volume = getVolumeValue();
    currentAudio.play();
    isPlaying = true;
    updatePlayPauseButton();
    updateNowPlaying(track.title);

    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', onTrackEnded);
}

function onTrackEnded() {
    const next = currentTrackIndex + 1;
    if (next < currentPlaylistTracks.length) {
        playByIndex(next);
    } else {
        isPlaying = false;
        updatePlayPauseButton();
    }
}

/* ─── CONTROLS ───────────────────────────────────────── */

function setupControls() {
    const progress  = document.querySelector('.control-center .slider input[type="range"]');
    const volumeBar = document.querySelector('.sound input[type="range"]');

    // Previous track
    document.getElementById('btn-prev').addEventListener('click', () => {
        const prev = currentTrackIndex - 1;
        if (prev >= 0) playByIndex(prev);
    });

    // Play / Pause
    document.getElementById('btn-play').addEventListener('click', () => {
        if (!currentAudio) return;
        if (isPlaying) {
            currentAudio.pause();
        } else {
            currentAudio.play();
        }
        isPlaying = !isPlaying;
        updatePlayPauseButton();
    });

    // Skip back 10s (go backward in the track)
    document.getElementById('btn-skip-back').addEventListener('click', () => {
        if (!currentAudio) return;
        currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 10);
    });

    // Skip forward 10s (go forward in the track)
    document.getElementById('btn-skip-fwd').addEventListener('click', () => {
        if (!currentAudio) return;
        currentAudio.currentTime = Math.min(currentAudio.duration || 0, currentAudio.currentTime + 10);
    });

    // Next track
    document.getElementById('btn-next').addEventListener('click', () => {
        const next = currentTrackIndex + 1;
        if (next < currentPlaylistTracks.length) playByIndex(next);
    });

    // Seek
    progress.addEventListener('input', (e) => {
        if (!currentAudio || !currentAudio.duration) return;
        currentAudio.currentTime = (e.target.value / 100) * currentAudio.duration;
    });

    // Volume
    volumeBar.addEventListener('input', (e) => {
        if (currentAudio) currentAudio.volume = e.target.value / 100;
    });
}

function updatePlayPauseButton() {
    const iconPlay  = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    if (isPlaying) {
        iconPlay.style.display  = 'none';
        iconPause.style.display = 'block';
    } else {
        iconPlay.style.display  = 'block';
        iconPause.style.display = 'none';
    }
}

function updateNowPlaying(title) {
    const el = document.getElementById('np-title');
    const pl = document.getElementById('np-playlist');
    if (el) el.textContent = title;
    if (pl) pl.textContent = currentPlaylistName;
}

function getVolumeValue() {
    const v = document.querySelector('.sound input[type="range"]');
    return v ? v.value / 100 : 1;
}

function updateProgress() {
    if (!currentAudio) return;
    const progress      = document.querySelector('.control-center .slider input[type="range"]');
    const currentLabel  = document.querySelector('.control-center .slider .time');
    const durationLabel = document.querySelector('.control-center .slider .final');

    const pct = (currentAudio.currentTime / currentAudio.duration) * 100;
    progress.value = pct || 0;
    currentLabel.textContent  = formatTime(currentAudio.currentTime);
    if (currentAudio.duration) {
        durationLabel.textContent = formatTime(currentAudio.duration);
    }
}

function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/* ─── SIDEBAR TOGGLE ─────────────────────────────────── */

function setupSidebarToggle() {
    const barIcon = document.querySelector('.nav .bar img');
    const sidebar = document.querySelector('.sidebar');

    barIcon.addEventListener('click', () => {
        sidebar.classList.toggle('show-sidebar');
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth > 900) return;
        if (!sidebar.contains(e.target) && !e.target.closest('.nav .bar')) {
            sidebar.classList.remove('show-sidebar');
        }
    });
}
