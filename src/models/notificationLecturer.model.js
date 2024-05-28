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
        },
        {
            tableName: 'notification_lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
