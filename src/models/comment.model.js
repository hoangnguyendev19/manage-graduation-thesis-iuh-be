const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Comment',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            content: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'REPORT_POSTER', 'REPORT_COUNCIL'),
                allowNull: false,
            },
        },
        {
            tableName: 'comments',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
