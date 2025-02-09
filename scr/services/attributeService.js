const db = require("../models");

const AttributesServices = {
    getAllAttributes: async () => {
        try {
            const [brands, fuelTypes, countries, generations] = await Promise.all([
                db.Brands.findAll({ raw: true }),
                db.FuelTypes.findAll({ raw: true }),
                db.Countries.findAll({ raw: true }),
                db.Generations.findAll({ raw: true }),
            ]);

            return { brands, fuelTypes, countries, generations };
        } catch (err) {
            throw err;
        }
    },
    createAttributes: async (attributeType, values) => {
        try {
            let items = [];
            values.forEach(element => {
                items.push({ name: element });
            });

            switch (attributeType) {
                case "brands":
                    await db.Brands.bulkCreate(items);
                    break;
                case "countries":
                    await db.Countries.bulkCreate(items);
                    break;
                case "fuelTypes":
                    await db.FuelTypes.bulkCreate(items);
                    break;
                case "generations":
                    await db.Generations.bulkCreate(items);
                    break;
            }

            return { messages: "Successfully create" };
        } catch (err) {
            throw err;
        }
    },
};

async function defaultAttributes() {
    try {
        await Promise.all([
            AttributesServices.createAttributes("brands", ["audi", "bmw", "mercedes-benz", "volkswagen", "toyota", "ford", "renault", "peugeot", "opel", "hyundai", "kia", "nissan", "honda", "mazda", "fiat", "chevrolet", "skoda", "volvo", "land rover", "jeep", "suzuki", "subaru", "mitsubishi", "tesla", "citroën", "seat", "dacia", "mini", "porsche", "alfa romeo", "jaguar", "lexus"]),
            AttributesServices.createAttributes("generations", ["Małe/Hatchback", "Kabriolet", "Combi", "Сoupe", "Minivan", "Sedan", "Pickup/SUV"]),
            AttributesServices.createAttributes("fuelTypes", ["Benzyna", "CNG", "LPG", "Diesel", "Electric", "Etanol", "Hybrid", "Wodór"]),
        ]
        );

        console.log({ messages: "Successfully create" });
    } catch (err) {
        throw err;
    }
};

module.exports = { AttributesServices, defaultAttributes };