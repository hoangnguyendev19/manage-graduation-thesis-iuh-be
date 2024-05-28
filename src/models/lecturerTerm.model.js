module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'LecturerTerm',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        },
        {
            tableName: 'lecturer_terms',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
