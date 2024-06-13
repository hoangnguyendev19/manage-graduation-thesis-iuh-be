const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Achievement',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            bonusScore: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'bonus_score',
            },
        },
        {
            tableName: 'achievements',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
