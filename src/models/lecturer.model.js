const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Lecturer',
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
            avatar: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            gender: {
                type: DataTypes.ENUM('MALE', 'FEMALE'),
                allowNull: true,
            },
            degree: {
                type: DataTypes.ENUM('BACHELOR', 'MASTER', 'DOCTOR'),
                allowNull: true,
                defaultValue: 'MASTER',
            },
            role: {
                type: DataTypes.ENUM('HEAD_LECTURER', 'LECTURER', 'SUB_HEAD_LECTURER'),
                allowNull: true,
                defaultValue: 'LECTURER',
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
                field: 'is_admin',
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                field: 'is_active',
            },
        },
        {
            tableName: 'lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
