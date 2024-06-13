const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Evaluation',
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
            scoreMax: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'score_max',
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'SESSION_HOST'),
                allowNull: true,
                defaultValue: 'REVIEWER',
            },
        },
        {
            tableName: 'evaluations',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
