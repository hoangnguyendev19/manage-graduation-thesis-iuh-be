const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Notification',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            content: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('LECTURER', 'STUDENT', 'GROUP_STUDENT'),
                allowNull: false,
            },
        },
        {
            tableName: 'notifications',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
