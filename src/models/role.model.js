const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Role',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            name: {
                type: DataTypes.ENUM('ADMIN', 'HEAD_LECTURER', 'HEAD_COURSE', 'LECTURER'),
                allowNull: true,
                defaultValue: 'LECTURER',
            },
        },
        {
            tableName: 'roles',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
