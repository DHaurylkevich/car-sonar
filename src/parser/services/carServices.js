import { createAttribute, getAllAttributes } from "../../db/services/attributeService.js";
import { findOrCreateAllNewCars } from "../../db/services/carService.js";
import { logger } from "../../utils/logger.js";

export async function normalizeData(
    carData,
    brands,
    fuelTypes,
    generations
) {
    let brand = brands.find(item => item.name.toLowerCase().includes(carData.brand.toLowerCase()));
    let fuelType = fuelTypes.find(item => item.name.toLowerCase().includes(carData.fuelTypes.toLowerCase()));
    let generation = generations.find(item => item.name.toLowerCase().includes(carData.generation.toLowerCase()));

    if (!brand) {
        brand = await createAttribute("brands", carData.brand.toLowerCase());
        brands.push(brand);
        logger.warn(`Brand "${brand.name}" created (id=${brand.id})`);
    }


    if (!fuelType) {
        fuelType = await createAttribute("fuelTypes", carData.fuelTypes.toLowerCase());
        fuelTypes.push(fuelType);
        logger.warn(`Fuel type "${fuelType.name}" created (id=${fuelType.id})`);
    }


    if (!generation) {
        generation = await createAttribute("generations", carData.generation.toLowerCase());
        generations.push(generation);
        logger.warn(`Generation "${generation.name}" created (id=${generation.id})`);
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
};

function findById(attrArray, attrId) {
    if (attrId) {
        return attrArray.find(attr => attr.id === attrId).name;
    }
    return attrId;
};

export const saveCars = async (carsData) => {
    try {
        logger.info("Saving cars");
        const { brands, fuelTypes, generations } = await getAllAttributes();

        const normalizedCars = [];

        for (const car of carsData) {
            if (!car?.brand || !car.fuelTypes || !car.generation) {
                logger.warn(`Skipping car with incomplete data: ${car?.link}`);
                continue;
            }

            normalizedCars.push(
                await normalizeData(
                    car,
                    brands,
                    fuelTypes,
                    generations
                )
            );
        }

        const carsFromDb = await findOrCreateAllNewCars(normalizedCars);

        const savedCars = carsFromDb
            .filter(([, created]) => created)
            .map(
                ([car]) => {
                    let carData = car.toJSON();
                    carData.brand = findById(brands, carData.brandId);
                    carData.fuelType = findById(fuelTypes, carData.fuelId);
                    carData.generation = findById(generations, carData.generationId);
                    return carData;
                }
            );

        logger.info(`Saved ${savedCars.length} cars`);
        logger.info(`Skipped ${carsFromDb.length - savedCars.length} cars`);

        return savedCars;
    } catch (error) {
        logger.error('Save error:', error);
        throw error;
    }
};