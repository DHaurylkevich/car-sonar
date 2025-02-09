'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UsersRequests extends Model {
        static associate(models) {
            UsersRequests.belongsTo(models.Requests, {
                foreignKey: 'requestId',
            });
            UsersRequests.belongsTo(models.Users, {
                foreignKey: 'userId',
            });
        }
    }
    UsersRequests.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'UsersRequests',
        tableName: 'usersRequests',
        timestamps: false
    });
    return UsersRequests;
};