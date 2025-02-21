'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Requests extends Model {
        static associate(models) {
            Requests.belongsTo(models.Brands, {
                foreignKey: 'brandId',
                as: 'brand'
            });
            Requests.belongsTo(models.FuelTypes, {
                foreignKey: 'fuelId',
                as: 'fuel'
            });
            Requests.belongsTo(models.Countries, {
                foreignKey: 'countryId',
                as: 'country'
            });
            Requests.belongsTo(models.Generations, {
                foreignKey: 'generationId',
                as: 'generation'
            });
            Requests.belongsToMany(models.Users, {
                through: 'UsersRequests',
                foreignKey: 'requestId',
                as: 'users',
            });
        }
    }
    Requests.init({
        yearFrom: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        yearTo: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        priceTo: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        priceFrom: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        mileageFrom: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        mileageTo: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Requests',
        tableName: 'requests',
        timestamps: false
    });
    return Requests;
};