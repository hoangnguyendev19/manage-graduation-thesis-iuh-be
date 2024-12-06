const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupStudent',
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
            link: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
            },
        },
        {
            tableName: 'group_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
