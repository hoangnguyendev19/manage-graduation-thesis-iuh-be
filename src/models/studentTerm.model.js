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
            tableName: 'student_terms',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
