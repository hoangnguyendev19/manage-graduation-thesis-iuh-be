module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'StudentTerm',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            isAdmin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_admin',
            },
        },
        {
            // Other model options go here
            tableName: 'student_term',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
