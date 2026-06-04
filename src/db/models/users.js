'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        static associate(models) {
            Users.belongsToMany(models.Requests, {
                through: 'UsersRequests',
                foreignKey: 'userId',
                as: 'requests'
            });
        }
    }
    Users.init({
        telegram_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true
        },
        username: {
            type: DataTypes.STRING
        },
        isPremium: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
        timestamps: false
    });
    return Users;
};