module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'NotificationLecturer',
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
                    'UPDATE_STATUS_COMMENT_MY_TOPIC',
                    'ASSIGN_REVIEW',
                    'ASSIGN_SESSION_HOST',
                    'ASSIGN_ADVISOR',
                    'LECTURER',
                    'GROUP_STUDENT',
                    'CHOOSE_TOPIC',
                ),
                allowNull: true,
            },
        },
        {
            // Other model options go here
            tableName: 'notification_lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
