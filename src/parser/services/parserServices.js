import axios from "axios";
import * as cheerio from "cheerio";

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
        console.error("Error fetching HTML page:", e);
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
            console.log("!!!!!find last link", lastLink, "\n", link, "\n", linksAd.length);
            return linksAd;
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

export const getNewCarsData = async (linksAd, getCarAttributes) => {
    const newCarsData = [];
    

    for (const link of linksAd) {
        let htmlCarPage = await getHtmlPage(link);
        let carAttr = getCarData(htmlCarPage, getCarAttributes)
        newCarsData.push({ link, ...carAttr });
        console.log("Extracted car data:", newCarsData);
        break;
    }

    return newCarsData;
};