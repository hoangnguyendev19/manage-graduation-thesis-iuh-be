const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Article',
        {
            id: {
                type: DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                defaultValue: () => uuidv4(),
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            author: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            authorNumber: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'author_number',
            },
            publicDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'public_date',
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
                defaultValue: 'PENDING',
                allowNull: false,
            },
            link: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            },
            bonusScore: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                allowNull: false,
                field: 'bonus_score',
            },
            comment: {
                type: DataTypes.TEXT('medium'),
                allowNull: true,
            },
        },
        {
            tableName: 'articles',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
