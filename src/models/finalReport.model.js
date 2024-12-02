const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'FinalReport',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            link: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            comment: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
            },
        },
        {
            tableName: 'final_reports',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
