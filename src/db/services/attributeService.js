import db from "../models/index.js";

export async function getAllAttributes() {
    const [brands, fuelTypes, countries, generations] = await Promise.all([
        db.Brands.findAll({ raw: true }),
        db.FuelTypes.findAll({ raw: true }),
        db.Countries.findAll({ raw: true }),
        db.Generations.findAll({ raw: true }),
    ]);

    return { brands, fuelTypes, countries, generations };
};
export async function createAttributes(attributeType, values) {
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
};

export async function defaultAttributes() {
    try {
        await Promise.all([
            createAttributes("brands", ["audi", "bmw", "mercedes-benz", "volkswagen", "toyota", "ford", "renault", "peugeot", "opel", "hyundai", "kia", "nissan", "honda", "mazda", "fiat", "chevrolet", "skoda", "volvo", "land rover", "jeep", "suzuki", "subaru", "mitsubishi", "tesla", "citroën", "seat", "dacia", "mini", "porsche", "alfa romeo", "jaguar", "lexus"]),
            createAttributes("generations", ["Małe/Hatchback", "Kabriolet", "Combi", "Сoupe", "Minivan", "Sedan", "Pickup/SUV"]),
            createAttributes("fuelTypes", ["Benzyna", "CNG", "LPG", "Diesel", "Electric", "Etanol", "Hybrid", "Wodór"]),
        ]
        );

        console.log({ messages: "Successfully create" });
    } catch (err) {
        throw err;
    }
};