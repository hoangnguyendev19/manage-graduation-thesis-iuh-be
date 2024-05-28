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
        },
        {
            tableName: 'assigns',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
