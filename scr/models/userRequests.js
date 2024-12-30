'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserRequests extends Model {
        static associate(models) {
            UserRequests.belongsTo(models.Users, {
                foreignKey: 'userId',
                as: 'user'
            });
            UserRequests.belongsTo(models.Requests, {
                foreignKey: 'requestId',
                as: 'request'
            });
        }
    }
    UserRequests.init({
    }, {
        sequelize,
        modelName: 'UserRequests',
        tableName: 'user_requests',
        timestamps: false
    });
    return UserRequests;
};