import { getAllAttributes } from "../../db/services/attributeService";

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
        console.log(`Brand "${brand.name}" created (id=${brand.id})`);
    }


    if (!fuelType) {
        fuelType = await createAttribute("fuelTypes", carData.fuelTypes.toLowerCase());
        fuelTypes.push(fuelType);
        console.log(`Fuel type "${fuelType.name}" created (id=${fuelType.id})`);
    }


    if (!generation) {
        generation = await createAttribute("generations", carData.generation.toLowerCase());
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
};

function findById(attrArray, attrId) {
    if (attrId) {
        return attrArray.find(attr => attr.id === attrId).name;
    }
    return attrId;
};

export const saveCars = async (carsData) => {
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

        const carsFromDb = findOrCreateAllNewCars(normalizedCars);

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

        console.log(`Saved ${savedCars.length} cars`);
        console.log(`Skipped ${results.length - savedCars.length} cars`);

        return savedCars;
    } catch (error) {
        logger.error('Save error:', error);
        throw error;
    }
};