'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Requests extends Model {
        static associate(models) {
            Requests.hasMany(models.UserRequests, {
                foreignKey: 'requestId',
                as: 'userRequests'
            });
            Requests.belongsToMany(models.Attributes, {
                through: 'RequestAttributes',
                foreignKey: 'requestId',
                as: 'attributes'
            });
        }
    }
    Requests.init({
        lastPost: {
            type: DataTypes.DATE,
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