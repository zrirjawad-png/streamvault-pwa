// StreamVault High-Performance Video Extraction Proxy (server.js)
// Fixes YouTube empty video issue by properly muxing separate video & audio streams using yt-dlp + ffmpeg
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint (for Render / Railway uptime monitoring)
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Video info endpoint: extracts title, thumbnail, duration, and available formats
app.get('/api/info', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--dump-single-json',
    videoUrl
  ];

  let stdoutData = '';
  let stderrData = '';
  const ytdlp = spawn('yt-dlp', args);

  ytdlp.stdout.on('data', (d) => { stdoutData += d.toString(); });
  ytdlp.stderr.on('data', (d) => { stderrData += d.toString(); });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      return res.status(500).json({
        error: 'Failed to inspect video metadata',
        details: stderrData.slice(-300)
      });
    }
    try {
      const info = JSON.parse(stdoutData);
      res.json({
        id: info.id,
        title: info.title || 'Untitled Video',
        thumbnail: info.thumbnail || '',
        duration: info.duration || 0,
        uploader: info.uploader || info.channel || 'Unknown Channel',
        formats_count: (info.formats && info.formats.length) || 0
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to parse video metadata JSON' });
    }
  });

  req.on('close', () => {
    try { ytdlp.kill(); } catch (e) {}
  });
});

// Stream endpoint: downloads and merges video + audio into a valid MP4 / M4A file
// Works seamlessly for YouTube (separate video + audio DASH streams), Instagram, TikTok, Twitter/X, and direct links
app.get('/api/stream', (req, res) => {
  const videoUrl = req.query.url;
  const quality = req.query.quality || '1080p';

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  const isAudio = quality === 'audio';
  const fileExt = isAudio ? 'm4a' : 'mp4';
  const contentType = isAudio ? 'audio/mp4' : 'video/mp4';

  // Create unique temporary filename for muxing
  const tempId = crypto.randomBytes(8).toString('hex');
  const tempOutput = path.join(os.tmpdir(), `streamvault_${tempId}.${fileExt}`);

  // Format selection matrix:
  // YouTube separates 1080p/720p video from audio. We select best video + best audio and merge with ffmpeg.
  // If the source is Instagram/TikTok (single muxed progressive stream), yt-dlp falls back cleanly.
  let formatArg;
  if (isAudio) {
    formatArg = 'bestaudio[ext=m4a]/bestaudio/best';
  } else if (quality === '720p') {
    formatArg = 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]/best';
  } else if (quality === '480p') {
    formatArg = 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]/best';
  } else {
    // 1080p or best available
    formatArg = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best';
  }

  const args = [
    '--no-playlist',
    '--no-warnings',
    '-f', formatArg,
    '--merge-output-format', fileExt,
    '-o', tempOutput,
    videoUrl
  ];

  let stderrData = '';
  const ytdlp = spawn('yt-dlp', args);

  ytdlp.stderr.on('data', (d) => {
    stderrData += d.toString();
  });

  const cleanup = () => {
    if (fs.existsSync(tempOutput)) {
      try { fs.unlinkSync(tempOutput); } catch (e) {}
    }
  };

  req.on('close', () => {
    try { ytdlp.kill(); } catch (e) {}
    cleanup();
  });

  ytdlp.on('close', (code) => {
    if (code !== 0 || !fs.existsSync(tempOutput)) {
      console.error(`yt-dlp extraction failed (exit code ${code}):`, stderrData);
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Video extraction failed. Video might be private, geoblocked, or requires authentication.',
          details: stderrData.slice(-300)
        });
      }
      return;
    }

    const stat = fs.statSync(tempOutput);
    if (stat.size === 0) {
      cleanup();
      if (!res.headersSent) {
        return res.status(500).json({ error: 'Extracted video is empty (0 bytes).' });
      }
      return;
    }

    // Set headers with exact Content-Length so the client can display real progress!
    res.setHeader('Content-Disposition', `attachment; filename="video_${tempId}.${fileExt}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);

    const stream = fs.createReadStream(tempOutput);
    stream.pipe(res);

    stream.on('end', cleanup);
    stream.on('error', (err) => {
      console.error('File streaming error:', err);
      cleanup();
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StreamVault PWA + yt-dlp backend listening on port ${PORT}`);
});
