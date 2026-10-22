# StreamVault v3.0 — Production Public Video Downloader

## What Is New in v3.0 (Public Release)
1. **100% Public-Ready UI**:
   - Removed all developer settings, proxy configuration modals, debug banners, and pre-filled sample links.
   - Clean, distraction-free visitor experience for YouTube, Instagram, TikTok, Facebook, and X.
2. **Flat Root File Structure (Fixes Windows GitHub Upload)**:
   - `index.html`, `sw.js`, and `manifest.json` are now placed directly in the **root folder** (as well as `public/`), so selecting all files in Windows Explorer and uploading to GitHub updates the frontend immediately.
3. **Works on BOTH Render Node.js and Render Docker**:
   - `server.js` automatically installs the standalone `yt-dlp` binary and uses `ffmpeg-static` if system `ffmpeg` is absent, so it works even if your Render service is configured as a standard Node service instead of Docker.
4. **3-Stage YouTube Extraction & Native Browser Save**:
   - Uses `/api/prepare` + `/api/download/:id` with multi-client YouTube extraction (`ios`, `android`, `mweb`, `tv`) and native `Content-Disposition: attachment` headers so downloads never produce 0-byte empty files and never get blocked by mobile popup blockers.
