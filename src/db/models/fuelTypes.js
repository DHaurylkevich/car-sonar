import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class FuelTypes extends Model {
        static associate(models) {
            FuelTypes.hasMany(models.Requests, {
                foreignKey: 'fuelId',
                as: 'request'
            });
        }
    }
    FuelTypes.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
    }, {
        sequelize,
        modelName: 'FuelTypes',
        tableName: 'fuelTypes',
        timestamps: false
    });
    return FuelTypes;
};