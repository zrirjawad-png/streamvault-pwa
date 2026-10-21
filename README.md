# StreamVault PWA & Video Extraction Proxy

StreamVault is a high-speed video downloader PWA supporting direct downloads from **YouTube**, **Instagram**, **TikTok**, **Twitter/X**, **Facebook**, and direct media links (.mp4, .webm).

## Why YouTube Needs This Backend
Unlike Instagram (which serves audio and video together in a single stream), **YouTube splits video and audio into separate adaptive streams** (DASH). Downloading a YouTube video directly with `stdout` without merging results in a corrupted 0-byte (empty) file.

This backend uses `yt-dlp` + `ffmpeg` to:
1. Fetch high-definition video + audio streams.
2. Merge them cleanly into a standard MP4 file on the fly.
3. Stream the merged video with exact byte progress directly to your phone, tablet, or desktop browser.

## 1-Click Free Deployment on Render
1. Push this folder to a GitHub repository.
2. Go to [Render.com](https://render.com) and click **New Web Service** -> **Connect GitHub Repo**.
3. Choose **Docker** environment (Render will automatically pick up `Dockerfile`).
4. Click **Deploy Web Service** (Free tier supported).
5. Copy your Render URL (e.g. `https://my-streamvault.onrender.com/api/stream?url=`) and paste it into the **Settings** menu of your StreamVault PWA!

## Local Run (Mac, Linux, Windows WSL)
```bash
# 1. Install prerequisites: Node.js 18+, Python 3, ffmpeg, yt-dlp
# On macOS: brew install ffmpeg yt-dlp node
# On Ubuntu/Debian: sudo apt install ffmpeg python3 nodejs npm && sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp

# 2. Install dependencies & start
npm install
npm start
# Server starts on http://localhost:10000
```
