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
            tableName: 'student_terms',
            timestamps: false,
        },
    );
};
