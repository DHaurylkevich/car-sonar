import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
    class Generations extends Model {
        static associate(models) {
            Generations.hasMany(models.Requests, {
                foreignKey: 'generationId',
                as: 'request'
            });
        }
    }
    Generations.init({
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
    }, {
        sequelize,
        modelName: 'Generations',
        tableName: 'generations',
        timestamps: false
    });
    return Generations;
};