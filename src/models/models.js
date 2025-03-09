'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Models extends Model {
        static associate(models) {
            Models.hasMany(models.Cars, {
                foreignKey: 'modelId',
                as: 'cars'
            });
            Models.hasMany(models.Requests, {
                foreignKey: 'modelId',
                as: 'request'
            });
        }
    }
    Models.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Models',
        tableName: 'models',
        timestamps: false
    });
    return Models;
};