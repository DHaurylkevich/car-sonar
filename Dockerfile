FROM ghcr.io/puppeteer/puppeteer:23.11.1

RUN apt-get update && apt-get install -y google-chrome-stable --no-install-recommends

RUN npx puppeteer browsers install chrome --install-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

CMD ["node", "scr/bot/index.js"]