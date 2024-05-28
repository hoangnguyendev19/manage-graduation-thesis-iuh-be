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
                unique: true,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            quantityGroupMax: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'quantity_group_max',
            },
            note: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            target: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            standardOutput: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'standard_output',
            },
            requireInput: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'require_input',
            },
            comment: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                defaultValue: 'PENDING',
                allowNull: false,
            },
            level: {
                type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
                allowNull: false,
                defaultValue: 'LOW',
            },
        },
        {
            tableName: 'topics',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
