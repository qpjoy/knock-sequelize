var Sequelize = require('sequelize');
var uuid = require('uuid');

module.exports = function (sequelize, DataTypes) {
    var coreSurveyResponse = sequelize.define('coreSurveyResponse', {
        csr_uid: {
            type: Sequelize.BIGINT,
            unique: true,
            autoIncrement: true,
            primaryKey: true,
            field: "csr_uid"
        },
        csr_object_guid:  {
            type: DataTypes.STRING,
            defaultValue: function() {
                return uuid.v4();
            },
            unique: true,
            allowNull: false,
            field: 'csr_object_guid'
        },
        csr_survey_guid: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'csr_survey_guid'
        },
        csr_question_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
            field: 'csr_question_id'
        },
        csr_question_text: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false,
            field: 'csr_question_text'
        },
        csr_answer_id: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
            field: 'csr_answer_id'
        },
        csr_answer_text: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false,
            field: 'csr_answer_text'
        },
        csr_answer_selected: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false,
            field: 'csr_answer_selected'
        },
        csr_answer_risk_score: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            allowNull: false,
            field: 'csr_answer_risk_score'
        },
        csr_inactive_date: {
            type: 'timestamp',
            // defaultValue: sequelize.literal('NOW()'),
            field: 'csr_inactive_date'
        },
        csr_page_name: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
            field: 'csr_page_name'
        },
        csr_comments: {
            type: DataTypes.TEXT,
            defaultValue: '',
            allowNull: false,
            field: 'csr_comments'
        }
    },{
        schema:'one_to_one',
        tableName: 'core_survey_response',
        freezeTableName: true,
        underscored: true,
        timestamps: false
    });
    coreSurveyResponse.associate = function (models) {
        // coreSurveyResponse.hasMany(models['coreSurveyAnswerDetails'], {
        //     as: "answers",
        //     foreignKey: 'core_survey_responses_guid',
        //     // targetKey: 'csa_object_guid',
        //     sourceKey: 'csr_object_guid',
        //     constraints: false
        // })
    }
    return coreSurveyResponse;
}
