module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Evaluation',
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
            scoreMax: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'score_max',
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'SESSION_HOST'),
                allowNull: true,
                defaultValue: 'REVIEWER',
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
            tableName: 'evaluations',
            timestamps: false,
        },
    );
};
