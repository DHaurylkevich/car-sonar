'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        static associate(models) {
            Users.hasOne(models.UserRequests, {
                foreignKey: 'userId',
                as: 'userRequest'
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
        post_message_id: {
            type: DataTypes.INTEGER
        }
    }, {
        sequelize,
        modelName: 'Users',
        tableName: 'users',
        timestamps: false
    });
    return Users;
};