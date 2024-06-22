const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Assign',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            type: {
                type: DataTypes.ENUM('REVIEWER', 'REPORT_POSTER', 'REPORT_COUNCIL'),
                allowNull: false,
                field: 'type',
            },
        },
        {
            tableName: 'assigns',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
