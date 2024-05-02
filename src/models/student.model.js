module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Student',
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
            schoolYear: {
                type: DataTypes.STRING,
                allowNull: true,
                field: 'school_year',
            },
            typeTraining: {
                type: DataTypes.ENUM('COLLEGE', 'UNIVERSITY'),
                allowNull: false,
                defaultValue: 'UNIVERSITY',
                field: 'type_training',
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
            tableName: 'students',
            timestamps: false,
        },
    );
};
