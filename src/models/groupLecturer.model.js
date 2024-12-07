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
                type: DataTypes.ENUM('REVIEWER', 'REPORT_POSTER', 'REPORT_COUNCIL'),
                allowNull: true,
                defaultValue: 'REVIEWER',
            },
            keywords: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: new Date(),
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: new Date(),
                field: 'end_date',
            },
            location: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'group_lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
