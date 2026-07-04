import axios from "axios";
import * as cheerio from "cheerio";
import { fetchPageWithBrowser } from "./browserService.js";

const createAxiosInstance = (url) => {
    return axios.create({
        baseURL: url,
        timeout: 10000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "pl-PL, pl; q=0.9"
        }
    });
};

export const getHtmlPage = async (url) => {
    try {
        const axiosInstance = createAxiosInstance(url);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (e) {
        console.warn(`Axios failed for ${url} (${e.response?.status ?? e.message}), retrying with browser`);
    }

    try {
        return await fetchPageWithBrowser(url);
    } catch (e) {
        console.error(`Browser fetch failed for ${url}:`, e.message);
    }
};

export const getLinksAd = (htmlPage, adMarker, lastLink, getLinkFromHtml) => {
    const $ = cheerio.load(htmlPage);

    const linksAd = [];
    console.log($(adMarker).length, "found ad elements");
    $(adMarker).each((index, element) => {
        let card = $(element);
        let link = getLinkFromHtml(card);

        if (lastLink === link) {
            console.log("Found last parsed link, stopping:", lastLink, "collected:", linksAd.length);
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

const REQUEST_DELAY_MS = Number(process.env.PARSE_REQUEST_DELAY_MS) || 1500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getNewCarsData = async (linksAd, getCarAttributes) => {
    const newCarsData = [];

    for (const link of linksAd) {
        let htmlCarPage = await getHtmlPage(link);
        if (htmlCarPage) {
            try {
                let carAttr = getCarData(htmlCarPage, getCarAttributes);
                newCarsData.push({ link, ...carAttr });
                console.log("Extracted car data:", link);
            } catch (e) {
                console.error("Error extracting car data:", link, e.message);
            }
        }
        await delay(REQUEST_DELAY_MS);
    }

    return newCarsData;
};