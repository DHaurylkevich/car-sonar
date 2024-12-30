FROM ghcr.io/puppeteer/puppeteer:23.11.1

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

    
RUN PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
    npx puppeteer browsers install chrome --install-deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "scr/bot/index.js"]