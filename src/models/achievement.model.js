module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Achievement',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at',
            },
        },
        {
            tableName: 'achievements',
            timestamps: false,
        },
    );
};
