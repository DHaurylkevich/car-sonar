FROM ghcr.io/puppeteer/puppeteer:23.11.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

RUN if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then \
        echo "...Copying Puppeteer Cache from Build Cache"; \
        cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR; \
    else \
        echo "...Storing Puppeteer Cache in Build Cache"; \
        cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME; \
    fi


COPY . .
CMD ["node", "scr/bot/index.js"]