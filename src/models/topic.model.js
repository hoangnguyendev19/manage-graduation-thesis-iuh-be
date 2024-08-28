const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Topic',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            key: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT('long'),
                allowNull: true,
            },
            quantityGroupMax: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'quantity_group_max',
            },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            target: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            expectedResult: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
                field: 'expected_result',
            },
            standardOutput: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
                field: 'standard_output',
            },
            requireInput: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
                field: 'require_input',
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                defaultValue: 'PENDING',
                allowNull: false,
            },
        },
        {
            tableName: 'topics',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
