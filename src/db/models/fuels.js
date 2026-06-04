'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FuelTypes extends Model {
        static associate(models) {
            FuelTypes.hasMany(models.Cars, {
                foreignKey: 'fuelId',
                as: 'cars'
            });
            FuelTypes.hasMany(models.Requests, {
                foreignKey: 'fuelId',
                as: 'request'
            });
        }
    }
    FuelTypes.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'FuelTypes',
        tableName: 'fuelTypes',
        timestamps: false
    });
    return FuelTypes;
};