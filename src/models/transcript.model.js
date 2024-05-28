module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Transcript',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            score: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: 'transcripts',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
