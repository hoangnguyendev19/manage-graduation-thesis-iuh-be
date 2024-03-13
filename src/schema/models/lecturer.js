module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Lecturer',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                field: 'user_name',
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            fullName: {
                // name
                type: DataTypes.STRING,
                allowNull: false,
                field: 'full_name',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: false,
                field: 'phone_number',
            },
            avatarUrl: {
                // avatar
                type: DataTypes.STRING,
                allowNull: true,
                field: 'avatar_url',
            },
            gender: {
                type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
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
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
