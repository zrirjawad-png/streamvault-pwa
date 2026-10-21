# StreamVault — Direct-to-Device Video Downloader PWA

## Features
- **Paste & Save Directly to Device**: Uses `window.showSaveFilePicker()` (File System Access API) on supported desktop browsers and `<a download>` Blob streaming on mobile (Android/iOS) to write video files straight to the user's device storage.
- **Chunked Download Progress**: Uses `ReadableStream` (`response.body.getReader()`) to display live megabyte counts and percentage progress bars, with `AbortController` cancellation.
- **Web Share Target API**: Registered in `manifest.json` so mobile users can share a link directly from another app into StreamVault.
- **Optional CORS & Social Proxy (`server.js`)**: Bridges CORS restrictions for third-party hosts and streams platform URLs via `yt-dlp`.

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Ensure `yt-dlp` is installed on your host machine if you want to extract videos from third-party social platforms.
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:3000` in Chrome, Edge, or Safari and install the PWA.
