module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'TermDetail',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.ENUM(
                    'CHOOSE_GROUP',
                    'CHOOSE_TOPIC',
                    'DISCUSSION',
                    'REPORT',
                    'PUBLIC_RESULT',
                ),
                allowNull: false,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_date',
            },
        },
        {
            tableName: 'term_details',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
