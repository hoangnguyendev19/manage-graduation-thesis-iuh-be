const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'GroupLecturerMember',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            position: {
                type: DataTypes.ENUM(
                    'PRESIDENT',
                    'VICE_PRESIDENT',
                    'SECRETARY',
                    'MEMBER_ONE',
                    'MEMBER_TWO',
                ),
                allowNull: false,
            },
        },
        {
            tableName: 'group_lecturer_members',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
