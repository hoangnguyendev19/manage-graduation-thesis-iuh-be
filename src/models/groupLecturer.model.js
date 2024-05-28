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
        },
        {
            tableName: 'group_lecturers',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
