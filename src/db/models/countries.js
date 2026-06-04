'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Countries extends Model {
        static associate(models) {
            Countries.hasMany(models.Cars, {
                foreignKey: 'brandId',
                as: 'cars'
            });
            Countries.hasMany(models.Requests, {
                foreignKey: 'countryId',
                as: 'request'
            });
        }
    }
    Countries.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Countries',
        tableName: 'countries',
        timestamps: false
    });
    return Countries;
};