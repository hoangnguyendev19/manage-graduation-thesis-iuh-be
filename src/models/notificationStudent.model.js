const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'NotificationStudent',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            message: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_read',
            },
        },
        {
            tableName: 'notification_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
