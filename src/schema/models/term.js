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
            isSubmitTopic: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_submit_topic',
            },
            isChooseTopic: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_choose_topic',
            },
            isDiscussion: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_discussion',
            },
            isReport: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_report',
            },
            isPublicResult: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                field: 'is_public_result',
            },
        },
        {
            // Other model options go here
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    );
};
