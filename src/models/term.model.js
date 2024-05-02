module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'Term',
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
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_date',
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_date',
            },
            startChooseGroup: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_choose_group',
            },
            endChooseGroup: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_choose_group',
            },
            startChooseTopic: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_choose_topic',
            },
            endChooseTopic: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_choose_topic',
            },
            startDiscussion: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_discussion',
            },
            endDiscussion: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_discussion',
            },
            startReport: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_report',
            },
            endReport: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_report',
            },
            startPublicResult: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'start_public_result',
            },
            endPublicResult: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'end_public_result',
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
            tableName: 'terms',
            timestamps: false,
        },
    );
};
