const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Transcript',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            score: {
                type: DataTypes.FLOAT,
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
