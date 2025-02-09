'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Generations extends Model {
        static associate(models) {
            Generations.hasMany(models.Cars, {
                foreignKey: 'generationId',
                as: 'cars'
            });
            Generations.hasMany(models.Requests, {
                foreignKey: 'generationId',
                as: 'request'
            });
        }
    }
    Generations.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Generations',
        tableName: 'generations',
        timestamps: false
    });
    return Generations;
};