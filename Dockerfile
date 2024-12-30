FROM ghcr.io/puppeteer/puppeteer:23.11.1

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENV PUPPETEER_CACHE_DIR=/opt/render/project/.chrome

CMD ["node", "scr/bot/index.js"]