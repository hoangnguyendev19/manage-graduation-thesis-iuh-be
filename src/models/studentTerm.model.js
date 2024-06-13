const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'StudentTerm',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            status: {
                type: DataTypes.ENUM(
                    'OPEN',
                    'FAIL_ADVISOR',
                    'FAIL_REVIEWER',
                    'FAIL_SESSION_HOST',
                    'PASS_ADVISOR',
                    'PASS_REVIEWER',
                    'PASS_SESSION_HOST',
                ),
                allowNull: false,
                defaultValue: 'OPEN',
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
