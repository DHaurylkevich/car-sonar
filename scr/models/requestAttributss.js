'use strict';
module.exports = (sequelize, DataTypes) => {
    const RequestAttributes = sequelize.define('RequestAttributes', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        requestId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Requests',
                key: 'id'
            }
        },
        attributeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Attributes',
                key: 'id'
            }
        }
    }, {
        timestamps: false,
        tableName: 'request_attributes'
    });

    return RequestAttributes;
};
