import { logger } from "../../utils/logger.js";
import db from '../models/index.js';
import { getAllAttributes, createAttribute } from "./attributeService.js";


export async function normalizeData(
    carData,
    brands,
    fuelTypes,
    generations
) {
    let brand = brands.find(item => item.name.toLowerCase() === carData.brand.toLowerCase());
    let fuelType = fuelTypes.find(item => item.name.toLowerCase() === carData.fuelTypes.toLowerCase());
    let generation = generations.find(item => item.name.toLowerCase() === carData.generation.toLowerCase());

    if (!brand) {
        brand = await createAttribute("brands", carData.brand);
        brands.push(brand);
        console.log(`Brand "${brand.name}" created (id=${brand.id})`);
    }


    if (!fuelType) {
        fuelType = await createAttribute("fuelTypes", carData.fuelTypes);
        fuelTypes.push(fuelType);
        console.log(`Fuel type "${fuelType.name}" created (id=${fuelType.id})`);
    }


    if (!generation) {
        generation = await createAttribute("generations", carData.generation);
        generations.push(generation);
        console.log(`Generation "${generation.name}" created (id=${generation.id})`);
    }

    return {
        name: carData.name,
        year: carData.year,
        mileage: carData.mileage ?? 0,
        price: carData.price,
        link: carData.link,
        photo: carData.photo ?? "",
        brandId: brand.id,
        fuelId: fuelType.id,
        generationId: generation.id,
    };
}

export const saveCars = async (carsData) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { brands, fuelTypes, generations } = await getAllAttributes();

        const normalizedCars = [];

        for (const car of carsData) {
            normalizedCars.push(
                await normalizeData(
                    car,
                    brands,
                    fuelTypes,
                    generations
                )
            );
        }

        const results = await Promise.all(
            normalizedCars.map(car =>
                db.Cars.findOrCreate({
                    where: { link: car.link },
                    defaults: car,
                    transaction,
                })
            )
        );

        await transaction.commit();

        const savedCars = results
            .filter(([, created]) => created)
            .map(([car]) => car);

        console.log(`Saved ${savedCars.length} cars`);
        console.log(`Skipped ${results.length - savedCars.length} cars`);

        return savedCars;
    } catch (error) {
        await transaction.rollback();
        logger.error('Save error:', error);
        throw error;
    }
};

export const clear = async () => {
    await db.Cars.destroy({ where: { createdAt: { [db.Sequelize.Op.lt]: new Date() } } });
};