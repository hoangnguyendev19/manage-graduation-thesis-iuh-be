const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'LecturerTerm',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
        },
        {
            tableName: 'lecturer_terms',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
