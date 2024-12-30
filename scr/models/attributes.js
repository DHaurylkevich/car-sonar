'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Attributes extends Model {
        static associate(models) {
            Attributes.belongsToMany(models.Requests, {
                through: 'RequestAttributes',
                foreignKey: 'attributeId',
                as: 'request'
            });
        }
    }
    Attributes.init({
        value: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM("brand", "model", "generation", "startYear", "yearTo", "city", "fuelType", "mileageFrom", "mileageTo", "priceFrom", "priceTo", "last_request"),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Attributes',
        tableName: 'attributes',
        timestamps: false
    });
    return Attributes;
};