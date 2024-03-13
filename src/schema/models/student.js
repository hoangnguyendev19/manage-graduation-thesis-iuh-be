module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Student',
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
            avatarUrl: {
                // avatar
                type: DataTypes.STRING,
                allowNull: true,
                field: 'avatar_url',
            },
            phoneNumber: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'phone_number',
            },
            email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            gender: {
                type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
                allowNull: true,
            },
            schoolYear: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'school_year',
            },
            typeTraning: {
                type: DataTypes.ENUM('COLLEGE', 'UNIVERSITY'),
                allowNull: false,
                defaultValue: 'UNIVERSITY',
                field: 'type_traning',
            },
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
