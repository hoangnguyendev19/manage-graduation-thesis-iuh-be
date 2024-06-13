const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupLecturer',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'SESSION_HOST'),
                allowNull: true,
                defaultValue: 'REVIEWER',
            },
        },
        {
            tableName: 'group_lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
