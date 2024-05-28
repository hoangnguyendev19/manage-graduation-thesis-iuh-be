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
            tableName: 'majors',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
