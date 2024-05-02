module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupLecturer',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
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
            tableName: 'group_lecturers',
            timestamps: false,
        },
    );
};
