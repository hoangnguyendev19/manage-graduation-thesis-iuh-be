const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Student',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fullName: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'full_name',
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            gender: {
                type: DataTypes.ENUM('MALE', 'FEMALE'),
                allowNull: true,
            },
            dateOfBirth: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'date_of_birth',
            },
            clazzName: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'clazz_name',
            },
            typeTraining: {
                type: DataTypes.ENUM('COLLEGE', 'UNIVERSITY'),
                allowNull: false,
                defaultValue: 'UNIVERSITY',
                field: 'type_training',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
            },
        },
        {
            tableName: 'students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
