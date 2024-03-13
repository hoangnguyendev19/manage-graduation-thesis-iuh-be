module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupStudent',
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
            typeReport: {
                type: DataTypes.ENUM('OPEN', 'POSTER', 'SESSION_HOST'),
                allowNull: false,
                defaultValue: 'OPEN',
                field: 'type_report',
            },
        },
        {
            // Other model options go here
            tableName: 'group_students',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
