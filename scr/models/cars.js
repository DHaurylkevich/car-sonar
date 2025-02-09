'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Cars extends Model {
        static associate(models) {
            Cars.belongsTo(models.Brands, {
                foreignKey: 'brandId',
                as: 'brand'
            });
            Cars.belongsTo(models.FuelTypes, {
                foreignKey: 'fuelId',
                as: 'fuel'
            });
            Cars.belongsTo(models.Countries, {
                foreignKey: 'countryId',
                as: 'country'
            });
            Cars.belongsTo(models.Generations, {
                foreignKey: 'generationsd',
                as: 'generation'
            });
        }
    }
    Cars.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        mileage: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
            allowNull: false
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        site: {
            // type: DataTypes.ENUM("brand", "model", "generation", "startYear", "yearTo", "city", "fuelType", "mileageFrom", "mileageTo", "priceFrom", "priceTo", "last_request"),
            type: DataTypes.ENUM("autoscout", "olx", "otomoto"),
            allowNull: false
        },
        sendedUser: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    }, {
        sequelize,
        modelName: 'Cars',
        tableName: 'cars',
        timestamps: true,
        indexes: [
            { fields: ['year'] },
            { fields: ['price'] },
            { fields: ['brandId'] },
            { fields: ['fuelId'] }
        ]
    });
    return Cars;
};