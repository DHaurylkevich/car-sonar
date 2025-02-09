const db = require('../models');
const { Op } = require('sequelize');

class CarService {
    static async normalizeData(rawCar, site) {
        let price = parseFloat(
            rawCar.price
                .replace(/[^\d.,]/g, '')
                .replace(',', '.')
        ) || 0;

        const yearMatch = rawCar.time.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : null;

        const brand = await db.Brands.findOne({
            where: {
                name: {
                    [Op.iLike]: `%${rawCar.name.split(' ')[0]}%`
                }
            }
        });

        return {
            name: rawCar.name,
            year: year,
            mileage: 0, // Заглушка (нужно доработать)
            price: price,
            link: rawCar.link,
            photo: rawCar.photo || '',
            site: site,
            brandId: brand?.id || null,
        };
    }

    static async saveCars(rawCars, site) {
        const transaction = await db.sequelize.transaction();

        try {
            const carsData = await Promise.all(
                rawCars.map(rawCar => this.normalizeData(rawCar, site))
            );

            console.log(`Получено ${rawCars.length} автомобилей с ${site}`);

            const queryFunctions = carsData.map(carData => {
                return () => {
                    return db.Cars.findOrCreate({
                        where: { name: carData.name, price: carData.price },
                        defaults: carData,
                        transaction
                    });
                };
            });

            const promises = queryFunctions.map(fn => fn());
            const results = await Promise.all(promises);

            const createdCars = results.filter(res => res[1] === true).map(res => res[0]);

            await transaction.commit();
            console.log(`Сохранено ${createdCars.length} автомобилей с ${site}`);
        } catch (error) {
            await transaction.rollback();
            console.error('Ошибка сохранения:', error);
        }
    }
}

module.exports = CarService;