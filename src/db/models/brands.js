import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Brands extends Model {
        static associate(models) {
            Brands.hasMany(models.Requests, {
                foreignKey: 'brandId',
                as: 'request'
            });
        }
    }
    Brands.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
    }, {
        sequelize,
        modelName: 'Brands',
        tableName: 'brands',
        timestamps: false
    });
    return Brands;
};