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
            typeReport: {
                type: DataTypes.ENUM('OPEN', 'POSTER', 'SESSION_HOST'),
                allowNull: false,
                defaultValue: 'OPEN',
                field: 'type_report',
            },
        },
        {
            tableName: 'group_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
