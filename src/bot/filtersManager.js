const { AttributesServices } = require("../services/attributeService");

class FilterManager {
    static DEFAULT_FILTERS = {
        brands: "",
        generations: "",
        countries: "",
        fuelTypes: "",
        yearFrom: "",
        yearTo: "",
        mileageFrom: "",
        mileageTo: "",
        priceFrom: "",
        priceTo: "",
    };

    static DEFAULT_FILTERS_MENU = [
        { name: "Brand", key: "brands" },
        { name: "Typ nadwozia", key: "generations" },
        { name: "Kraj pochodzenia", key: "countries" },
        { name: "Fuel Type", key: "fuelTypes" },
        { name: "Year From", key: "yearFrom" },
        { name: "Year To", key: "yearTo" },
        { name: "Mileage From", key: "mileageFrom" },
        { name: "Mileage To", key: "mileageTo" },
        { name: "Price From", key: "priceFrom" },
        { name: "Price To", key: "priceTo" },
    ];

    static async filtersMenuList() {
        const attributes = await AttributesServices.getAllAttributes();

        this.DEFAULT_FILTERS_MENU.forEach(element => {
            if (attributes[element.key]) {
                element.options = attributes[element.key];
            }
        });
        return this.DEFAULT_FILTERS_MENU;
    };

    static getFilterByKey(key) {
        return this.DEFAULT_FILTERS_MENU.find(filter => filter.key === key);
    };
};

module.exports = FilterManager;
// { name: "Brand", key: "brand", options: ["audi", "bmw", "mercedes-benz", "volkswagen", "toyota", "ford", "renault", "peugeot", "opel", "hyundai", "kia", "nissan", "honda", "mazda", "fiat", "chevrolet", "skoda", "volvo", "land rover", "jeep", "suzuki", "subaru", "mitsubishi", "tesla", "citroën", "seat", "dacia", "mini", "porsche", "alfa romeo", "jaguar", "lexus"] },
// { name: "Typ nadwozia", key: "generation", options: ["Małe/Hatchback", "Kabriolet", "Combi", "Сoupe", "Minivan", "Sedan", "Pickup/SUV"] },
// { name: "Fuel Type", key: "fuelType", options: ["Benzyna", "CNG", "LPG", "Diesel", "Electric", "Etanol", "Hybrid", "Wodór"] },