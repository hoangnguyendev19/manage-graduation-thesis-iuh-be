module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'NotificationStudent',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            message: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_read',
            },
            type: {
                type: DataTypes.ENUM(
                    'ACHIEVEMENT',
                    'STUDENT',
                    'GROUP_MEMBER',
                    'CHOOSE_TOPIC',
                    'NEW_GROUP_MEMBER',
                    'CHANGE_TYPE_REPORT_GROUP',
                ),
                allowNull: true,
            },
        },
        {
            // Other model options go here
            tableName: 'notification_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
