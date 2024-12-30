FROM ghcr.io/puppeteer/puppeteer:23.11.1

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["node", "scr/bot/index.js"]