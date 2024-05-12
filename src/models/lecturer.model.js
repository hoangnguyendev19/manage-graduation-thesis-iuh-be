module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Lecturer',
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
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
            createdAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'created_at',
            },
            updatedAt: {
                type: DataTypes.DATE,
                defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'updated_at',
            },
        },
        {
            tableName: 'lecturers',
            timestamps: false,
        },
    );
};
