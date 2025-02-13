const { Op } = require('sequelize');
const db = require('../models');

class CarService {
    static normalizeData(listing, domain, allBrands) {
        let price = parseFloat(
            listing.price
                .replace(/[^\d.,]/g, '')
                .replace(',', '.')
        ) || 0;

        const brand = allBrands.find(req => listing.name.split(' ')[0] === req.name[0].toUpperCase() + req.name.slice(1));
        const yearMatch = listing.time.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : null;

        return {
            name: listing.name,
            year: year,
            mileage: 0,
            price: price,
            link: listing.link,
            photo: listing.photo || '',
            site: domain,
            brandId: brand?.id || null,
        };
    };

    static async normalizeAttributes(nameGeneration, nameFuel, nameCountry) {
        const [generation, fuelType, country] = await Promise.all([
            db.Generations.findOrCreate({
                where: { name: nameGeneration },
                raw: true
            }),
            db.FuelTypes.findOrCreate({
                where: { name: nameFuel },
                raw: true
            }),
            db.Countries.findOrCreate({
                where: { name: nameCountry },
                raw: true
            }),
        ]);

        return { generation: generation[0], fuelType: fuelType[0], country: country[0] };
    };

    static async saveCars(listings) {
        const transaction = await db.sequelize.transaction();

        try {
            const allBrands = await db.Brands.findAll({ raw: true });

            let listingsData = [];
            listings.forEach(listing => {
                if (listing.data !== undefined) {
                    listingsData.push(listing.data.map(element => this.normalizeData(element, listing.domain, allBrands)));
                }
            });
            listingsData = listingsData.flat();
            console.log(`Получено ${listingsData.length} автомобилей`);

            const queryFunctions = listingsData.map(listingData => {
                if (listingData.name === undefined) {
                    console.log(listingData)
                }
                return () => {
                    return db.Cars.findOrCreate({
                        raw: true,
                        where: { name: listingData.name, price: listingData.price },
                        defaults: listingData,
                        transaction
                    });
                };
            });

            const promises = queryFunctions.map(fn => fn());
            const results = await Promise.all(promises);

            const createdCars = results.filter(res => res[1] === true).map(res => res[0]);

            await transaction.commit();
            console.log(`Сохранено ${createdCars.length} автомобилей`);
            return createdCars;
        } catch (error) {
            await transaction.rollback();
            console.error('Ошибка сохранения:', error);
        }
    };

    static async updateCarAttr(link, updateData) {
        const carInDb = await db.Cars.findOne({ where: { link: link } });
        const attrs = await this.normalizeAttributes(updateData.generation, updateData.fuelType, updateData.country);

        await carInDb.update({
            photo: updateData.photo,
            mileage: updateData.mileage,
            year: updateData.year,
            fuelId: attrs.fuelType.id,
            countryId: attrs.country.id,
            generationId: attrs.generation.id
        });

        return await db.Cars.findOne({
            where: {
                link: link
            },
            include: [
                {
                    model: db.Countries,
                    as: 'country'
                },
                {
                    model: db.FuelTypes,
                    as: 'fuel'
                },
                {
                    model: db.Generations,
                    as: 'generation'
                }
            ]
        });
    };
};

module.exports = CarService;