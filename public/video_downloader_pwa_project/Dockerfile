# StreamVault v3.5 Production Dockerfile (Render / Railway / Fly.io)
FROM node:20-bookworm-slim

# Install Python 3, pip, ffmpeg, curl, and yt-dlp with curl-cffi (fixes TikTok TLS fingerprint)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    ca-certificates \
  && pip3 install --no-cache-dir --break-system-packages "yt-dlp[default,curl-cffi]" \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
