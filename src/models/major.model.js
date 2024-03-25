module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Major',
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
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
