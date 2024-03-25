module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupLecturerMember',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        },
        {
            // Other model options go here
            tableName: 'group_lecturer_members',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
