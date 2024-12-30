FROM ghcr.io/puppeteer/puppeteer:23.11.1

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "scr/bot/index.js"]