const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'EventGroupStudent',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            link: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
            },
            comment: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
            },
        },
        {
            tableName: 'event_group_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
