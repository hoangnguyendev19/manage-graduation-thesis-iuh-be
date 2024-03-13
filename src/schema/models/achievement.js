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
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
