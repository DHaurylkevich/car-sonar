'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Brands extends Model {
        static associate(models) {
            Brands.hasMany(models.Cars, {
                foreignKey: 'brandId',
                as: 'cars'
            });
            Brands.hasMany(models.Requests, {
                foreignKey: 'brandId',
                as: 'request'
            });
        }
    }
    Brands.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Brands',
        tableName: 'brands',
        timestamps: false
    });
    return Brands;
};