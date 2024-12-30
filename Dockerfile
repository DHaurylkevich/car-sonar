FROM ghcr.io/puppeteer/puppeteer:23.11.1

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

CMD ["node", "scr/bot/index.js"]