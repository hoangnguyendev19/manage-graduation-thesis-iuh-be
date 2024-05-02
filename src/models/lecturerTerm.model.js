module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'LecturerTerm',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            tableName: 'lecturer_terms',
            timestamps: false,
        },
    );
};
