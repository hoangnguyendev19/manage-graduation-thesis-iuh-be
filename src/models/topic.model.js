module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Topic',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
