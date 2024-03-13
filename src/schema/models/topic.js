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
                allowNull: false,
            },
            level: {
                type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH'),
                allowNull: false,
            },
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
