
const link = {
    otomoto: async (filters) => {
        let url = "https://www.otomoto.pl/osobowe/";
        if (!filters) return url;

        let pathParts = [];

        if (filters.brand?.length) pathParts.push(filters.brand.join('--'));
        // if (filters.model) pathParts.push(filters.model);
        if (filters.generation?.length) pathParts.push(filters.generation.join('--'));
        if (filters.startYear?.length) pathParts.push(`od-${filters.startYear}`);
        if (filters.city?.length) pathParts.push(filters.city);
        url += pathParts.join("/")

        pathParts = [];

        if (filters.fuelType && Array.isArray(filters.fuelType)) {
            filters.fuelType.forEach((type) =>
                pathParts.push(`search%5Bfilter_enum_fuel_type%5D%5B%5D=${encodeURIComponent(type)}`)
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

        return pathParts.length > 0 ? url + "?" + pathParts.join("&") : url;
    }
};

module.exports = link