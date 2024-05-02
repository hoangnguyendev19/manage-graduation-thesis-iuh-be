module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Assign',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            typeEvaluation: {
                type: DataTypes.ENUM('ADVISOR', 'REVIEWER', 'SESSION_HOST'),
                allowNull: false,
                field: 'type_evaluation',
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
            tableName: 'assigns',
            timestamps: false,
        },
    );
};
