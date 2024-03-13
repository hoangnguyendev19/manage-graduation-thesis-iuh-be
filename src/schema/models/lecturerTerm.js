module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'LecturerTerm',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            role: {
                type: DataTypes.ENUM('HEAD_LECTURER', 'LECTURER', 'SUB_HEAD_LECTURER'),
                allowNull: true,
            },
        },
        {
            // Other model options go here
            tableName: 'lecturer_term',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
