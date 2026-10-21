const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Render
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Streams YouTube, Instagram, TikTok, Facebook, or direct video links via yt-dlp
app.get('/api/stream', (req, res) => {
  const videoUrl = req.query.url;
  const quality = req.query.quality || '1080p';

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  const isAudio = quality === 'audio';
  res.setHeader(
    'Content-Disposition',
    isAudio ? 'attachment; filename="audio.m4a"' : 'attachment; filename="video.mp4"'
  );
  res.setHeader('Content-Type', isAudio ? 'audio/mp4' : 'video/mp4');

  const formatArg = isAudio
    ? 'bestaudio[ext=m4a]/bestaudio'
    : 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';

  const args = [
    '--no-playlist',
    '--no-warnings',
    '-f', formatArg,
    '-o', '-',
    videoUrl
  ];

  const ytdlp = spawn('yt-dlp', args);
  ytdlp.stdout.pipe(res);
  ytdlp.stderr.on('data', (data) => console.error('[yt-dlp]', data.toString()));
  req.on('close', () => {
    try {
      ytdlp.kill();
    } catch (e) {}
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StreamVault PWA + yt-dlp Proxy listening on port ${PORT}`);
});
