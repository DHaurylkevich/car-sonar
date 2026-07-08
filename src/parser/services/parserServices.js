import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";
import { logger } from "../../utils/logger.js";

// const createAxiosInstance = (url) => {
//     return axios.create({
//         baseURL: url,
//         timeout: 50000,
//         headers: {
//             "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//             "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
//             "Accept-Language": "pl-PL, pl; q=0.9",
//             "Referer": "https://www.google.com",
//             "Cookie": ""
//         }
//     });
// };

const client = gotScraping.extend({
    timeout: {
        request: 50000,
    },
    retry: {
        limit: 3,
    },
    http2: true,
    headers: {
        "accept-language": "pl-PL,pl;q=0.9",
    },
});

export const getHtmlPage = async (url) => {
    try {
        // const axiosInstance = createAxiosInstance(url);
        // const response = await axiosInstance.get(url);

        // return response.data;
        const response = await client.get(url);

        return response.body;
    } catch (err) {
        logger.error(`Error fetching HTML page: ${url}`, err);
    }
};

export const getLinksAd = (htmlPage, adMarker, lastLink, getLinkFromHtml) => {
    const $ = cheerio.load(htmlPage);

    const linksAd = [];
    logger.info($(adMarker).length, "found ad elements");
    $(adMarker).each((index, element) => {
        let card = $(element);
        let link = getLinkFromHtml(card);

        if (lastLink === link) {
            logger.warn("!!!!!find last link" + lastLink + "\n" + link + "\n" + linksAd.length);
            return false;
        };
        if (link !== undefined) {
            linksAd.push(link);
        }
    });

    return linksAd;
};

export const getCarData = (htmlCarPage, getCarAttributes) => {
    const $ = cheerio.load(htmlCarPage);
    return getCarAttributes($);
};

const CONCURRENCY = 5;

async function pMap(items, fn, concurrency = CONCURRENCY) {
    const results = [];
    for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(
            batch.map(item => fn(item))
        );
        for (const result of batchResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
        }
    }
    return results;
}

export const getNewCarsData = async (linksAd, getCarAttributes) => {
    const results = await pMap(linksAd, async (link) => {
        const htmlCarPage = await getHtmlPage(link);
        if (!htmlCarPage) return null;
        const carAttr = getCarData(htmlCarPage, getCarAttributes);
        return { link, ...carAttr };
    });

    return results.filter(Boolean);
};