# MsVerse UI

A minimalist music streaming web UI that loads playlists and tracks dynamically using a Node.js backend.

## Features
- Dynamic playlists loaded from `./tracks` sub‑folders (e.g., **Bollywood**, **Moostape**, **Punjabi**).
- Stream individual tracks with HTTP range‑requests for smooth playback and seeking.
- Clean UI with now‑playing strip and full playback controls (prev, skip ±10 s, play/pause, next).
- Automatic cover‑image handling – place a PNG named after the playlist (e.g., `bollywood.png`) in `img/`.
- Clean song titles – bitrate descriptors are stripped server‑side.

## Getting Started
```bash
# Clone / copy the repository
cd "MsVerse UI"
# Install dependencies (express, cors)
npm install
# Ensure a `tracks/` folder with sub‑folders for each playlist
# Add cover images to `img/` (names must match playlist folder, lower‑cased, .png)
# Start the server
node server.js
```
The server runs on **http://localhost:3000**.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/playlists` | Returns an array of playlists (id, name, coverImage, totalSongs). |
| GET | `/api/playlists/:id/tracks` | Returns the track list for a playlist (id, title, file). |
| GET | `/stream/:playlist/:file` | Streams an MP3 file using byte‑range requests. The server reads the `Range` header and responds with **206 Partial Content** so the browser can seek efficiently. |

## How to Use the Streaming Endpoint
The HTML `<audio>` element (or any media player) can request a track like this:
```html
<audio src="http://localhost:3000/stream/Bollywood/song1.mp3" controls></audio>
```
When the player seeks, it sends a `Range: bytes=start-end` header. The server returns only that slice of the file, enabling smooth, on‑demand playback without downloading the whole track.

You can also test it manually with `curl`:
```bash
# Get the first 200KB of a file
curl -r 0-200000 http://localhost:3000/stream/Bollywood/song1.mp3 -o part.mp3
```
Replace `Bollywood` and `song1.mp3` with your playlist and file names.

---


A minimalist music streaming web UI that loads playlists and tracks dynamically using a Node.js backend.

## Features
- Dynamic playlists loaded from `./tracks` sub‑folders (e.g., **Bollywood**, **Moostape**, **Punjabi**).
- Stream individual tracks with range‑requests for smooth playback.
- Clean UI with minimal design, now‑playing strip, and full playback controls (prev, skip ±10 s, play/pause, next).
- Automatic cover‑image handling – place a PNG named after the playlist (e.g., `bollywood.png`) in `img/`.
- Clean song titles – bitrate descriptors are stripped server‑side.

## Getting Started
```bash
# Clone / copy the repository
cd "MsVerse UI"
# Install dependencies (express, cors)
npm install
# Make sure you have a `tracks/` folder with sub‑folders for each playlist
# Add cover images to `img/` (names must match playlist folder, lower‑cased, .png)
# Start the server
node server.js
```
The server runs on **http://localhost:3000**.

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/playlists` | Returns an array of playlists – each includes `id`, `name`, `author`, `totalSongs`, and `coverImage` (relative URL). |
| GET | `/api/playlists/:id/tracks` | Returns the track list for a playlist. Each track has `id`, `title` (cleaned), `duration` (currently `"Unknown"`), and `file` (e.g., `Bollywood/song.mp3`). |
| GET | `/stream/:playlist/:file` | Streams a specific MP3 file with range support – required for HTML5 audio playback. |
| GET | `/health` | Simple health check. |

## Front‑end
- Open `index.html` in a browser.
- The UI fetches playlists via `/api/playlists` and displays them as cards.
- Clicking a playlist loads its tracks and enables playback controls.
- The now‑playing strip shows the currently playing track and playlist name.

## Adding New Playlists
1. Create a new folder inside `tracks/` (e.g., `MyMix`).
2. Add MP3 files to that folder.
3. (Optional) Add a cover image `img/mymix.png` – the UI will automatically use it.
4. Reload the page – the new playlist appears automatically.

## Customisation
- **Styling** – edit `style.css` for colours, fonts, or layout tweaks.
- **Cover images** – any PNG placed in `img/` with a matching lower‑cased name will be used.
- **Server port** – change the `PORT` environment variable or edit `server.js`.

---
© 2026 MsCoder – All rights reserved.
