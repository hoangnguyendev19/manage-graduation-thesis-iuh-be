const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Assign',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            typeEvaluation: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'SESSION_HOST'),
                allowNull: false,
                field: 'type_evaluation',
            },
        },
        {
            tableName: 'assigns',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
