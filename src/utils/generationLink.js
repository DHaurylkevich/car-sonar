const urlValuesList = require("../bot/urlValuesList");
const fixedPrices = urlValuesList.fixedPricesAutoscout;
const fixedMileage = urlValuesList.fixedMileageAutoscout;

function normalizePrice(value, fixedValues) {
    console.log(value, fixedValues[0]);
    if (value <= fixedValues[0]) return null;
    if (value >= fixedValues[fixedValues.length - 1]) return null;

    return fixedValues.reduce((prev, curr) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
};

const link = {
    otomoto: (filters) => {
        let url = "https://www.otomoto.pl/osobowe/";
        if (!filters) return url;

        let pathParts = [];

        if (filters.brand?.length) {
            pathParts.push(filters.brand.join('--'))
        };
        if (filters.generation?.length) {
            const generation = [];
            filters.generation.forEach(element => {
                generation.push(urlValuesList.generation[element].otomoto)
            });
            pathParts.push(generation.join('--'));
        }
        if (filters.yearFrom?.length) pathParts.push(`od-${filters.yearFrom}`);
        url += pathParts.join("/")

        pathParts = [];

        if (filters.fuelType && filters.brand?.length) {
            // pathParts.push(`search%5Bfilter_enum_fuel_type%5D%5B0%5D=${encodeURIComponent(urlValuesList.fuelType[filters.fuelType].otomoto)}`)
            filters.fuelType.forEach((type, index) => {
                pathParts.push(`search%5Bfilter_enum_fuel_type%5D%5B${index}%5D=${encodeURIComponent(urlValuesList.fuelType[type].otomoto)}`)
            }
            );
        }
        if (filters.mileageFrom) {
            pathParts.push(`search%5Bfilter_float_mileage%3Afrom%5D=${encodeURIComponent(filters.mileageFrom)}`);
        }
        if (filters.mileageTo) {
            pathParts.push(`search%5Bfilter_float_mileage%3Ato%5D=${encodeURIComponent(filters.mileageTo)}`);
        }
        if (filters.priceFrom) {
            pathParts.push(`search%5Bfilter_float_price%3Afrom%5D=${encodeURIComponent(filters.priceFrom)}`);
        }
        if (filters.priceTo) {
            pathParts.push(`search%5Bfilter_float_price%3Ato%5D=${encodeURIComponent(filters.priceTo)}`);
        }
        if (filters.yearTo) {
            pathParts.push(`search%5Bfilter_float_year%3Ato%5D=${encodeURIComponent(filters.yearTo)}`);
        }

        pathParts.push('search%5Border%5D=created_at_first%3Adesc');
        pathParts.push('search%5Badvanced_search_expanded%5D=true');

        return pathParts.length > 0 ? url + "?" + pathParts.join("&") : url;
    },
    olx: (filters) => {
        let url = "https://www.olx.pl/motoryzacja/samochody";
        if (!filters) return url += "/?search%5Border%5D=created_at:desc";

        if (filters.brand?.length) {
            url += `/${filters.brand[0]}`;
        }
        url += "/?search%5Border%5D=created_at:desc";

        let pathParts = [];

        if (filters.priceFrom?.length) {
            pathParts.push(`search%5Bfilter_float_price:from%5D=${filters.priceFrom}`);
        }
        if (filters.priceTo?.length) {
            pathParts.push(`search%5Bfilter_float_price:to%5D=${filters.priceTo}`);
        }
        if (filters.yearFrom?.length) {
            pathParts.push(`search%5Bfilter_float_year:from%5D=${filters.yearFrom}`);
        }
        if (filters.yearTo?.length) {
            pathParts.push(`search%5Bfilter_float_year:to%5D=${filters.yearTo}`);
        }
        if (filters.fuelType?.length) {
            // pathParts.push(`search%5Bfilter_enum_petrol%5D%5B0%5D=${urlValuesList.fuelType[filters.fuelType].olx}`);
            filters.fuelType.forEach((type, index) => {
                pathParts.push(`search%5Bfilter_enum_petrol%5D%5B${index}%5D=${urlValuesList.fuelType[type].olx}`);
            });
        }
        if (filters.generation?.length) {
            // pathParts.push(`search%5Bfilter_enum_car_body%5D%5B0%5D=${urlValuesList.generation[filters.generation].olx}`)
            filters.generation.forEach((type, index) =>
                pathParts.push(`search%5Bfilter_enum_car_body%5D%5B${index}%5D=${urlValuesList.generation[type].olx}`)
            );
        }
        if (filters.mileageFrom?.length) {
            pathParts.push(`search%5Bfilter_float_milage:from%5D=${filters.mileageFrom}`);
        }
        if (filters.mileageTo?.length) {
            pathParts.push(`search%5Bfilter_float_milage:to%5D=${filters.mileageTo}`);
        }

        return pathParts.length > 0 ? `${url}&${pathParts.join("&")}` : url;
    },
    mobile: (filters) => {
        const baseUrl = 'https://suchen.mobile.de/fahrzeuge/search.html';
        const params = [];

        if (filters.generation?.length) {
            filters.generation.forEach(type => {
                params.push(`c=${urlValuesList.generation[type].mobile}`);
            });
        }
        params.push("dam=false");

        if (filters.fuelType?.length) {
            filters.fuelType.forEach(type => {
                params.push(`ft=${urlValuesList.fuelType[type].mobile}`);
            });
        }

        params.push("isSearchRequest=true");

        if (filters.mileageFrom?.[0] || filters.mileageTo?.[0]) {
            const from = filters.mileageFrom?.[0] || '';
            const to = filters.mileageTo?.[0] || '';
            params.push(`ml=${from}%3A${to}`);
        }

        if (filters.brand?.length) {
            filters.brand.forEach(brand => {
                params.push(`ms=${urlValuesList.brand[brand]}%3B%3B%3B`);
            });
        }

        params.push("od=down");

        // if (filters.yearFrom || filters.yearTo) {
        //     const yearFrom = filters.yearFrom?.[0] || '1900';
        //     const yearTo = filters.yearTo?.[0] || '';
        //     params.push('ms', `${yearFrom};;${yearTo}`);
        // }

        if (filters.priceFrom?.[0] || filters.priceTo?.[0]) {
            const from = filters.priceFrom?.[0] || '';
            const to = filters.priceTo?.[0] || '';
            params.push('p', `${from}%3A${to}`);
        }

        return `${baseUrl}?${params.join("&")}s=Car&sb=doc&vc=Car`;
    },
    autoscout: (filters) => {
        const baseUrl = 'https://www.autoscout24.pl/lst';

        const params = [];

        let path = filters.brand?.length ? `/${filters.brand.join(',')}` : '';
        params.push("atype=C");

        if (filters.generation?.length) {
            const generation = [];
            filters.generation.forEach(element => {
                generation.push(urlValuesList.generation[element].autoscout24);
            });
            params.push(`body=${generation}`);
        }

        params.push("desc=1");

        if (filters.fuelType?.length) {
            const fuelType = [];
            filters.fuelType.forEach(element => {
                fuelType.push(urlValuesList.fuelType[element].autoscout24);
            });
            params.push(`fuel=${fuelType.join(',')}`);
        }

        if (filters.mileageTo?.length) {
            const miles = normalizePrice(filters.mileageTo, fixedMileage);
            if (miles) {
                params.push(`kmto=${miles}`);
            }
        }

        if (filters.mileageFrom?.length) {
            const miles = normalizePrice(filters.mileageFrom, fixedMileage);
            if (miles) {
                params.push(`kmfrom=${miles}`);
            }
        }

        if (filters.priceFrom?.length) {
            const price = normalizePrice(filters.mileageFrom, fixedPrices);
            if (price) {
                params.push(`pricefrom=${filters.priceFrom}`);
            }
        }

        if (filters.priceTo?.length) {
            const price = normalizePrice(filters.mileageFrom, fixedPrices);
            if (price) {
                params.push(`priceto=${filters.priceTo}`);
            }
        }

        params.push("sort=age&source=homepage_search-mask&ustate=N%2CU");

        return `${baseUrl}${path}?${params.join("&")}`;
    },
};

module.exports = link;