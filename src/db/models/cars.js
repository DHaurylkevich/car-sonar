import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Cars extends Model {
        static associate(models) {
            Cars.belongsTo(models.Brands, {
                foreignKey: 'brandId',
                as: 'brand'
            });
            Cars.belongsTo(models.FuelTypes, {
                foreignKey: 'fuelId',
                as: 'fuel'
            });
            Cars.belongsTo(models.Generations, {
                foreignKey: 'generationId',
                as: 'generation'
            });
        }
    }
    Cars.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        mileage: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        link: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        photo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'Cars',
        tableName: 'cars',
        timestamps: true,
        indexes: [
            { fields: ['year'] },
            { fields: ['price'] },
            { fields: ['brandId'] },
            { fields: ['fuelId'] }
        ]
    });
    return Cars;
};