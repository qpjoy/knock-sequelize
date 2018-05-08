var Sequelize = require('sequelize');
var uuid = require('uuid');

module.exports = function (sequelize, DataTypes) {
    var coreSurvey = sequelize.define('coreSurvey', {
        core_survey_uid: {
            type: Sequelize.BIGINT,
            unique: true,
            autoIncrement: true,
            primaryKey: true,
            field: "core_survey_uid"
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
        answer_detail: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: '',
            field: 'answer_detail'
        },
        total_score: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
            field: 'total_score'
        },
        case_guid: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'case_guid'
        },
        survey_guid: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'survey_guid'
        },

        // cet_create_date : {
        //     type: 'timestamp',
        //     defaultValue: sequelize.literal('NOW()'),
        //     field: 'cet_create_date'
        // }
        createdAt: {
            type: 'timestamp',
            defaultValue: sequelize.literal('NOW()'),
            field: 'created_at',
        },
        updatedAt: {
            type: 'timestamp',
            defaultValue: sequelize.literal('NOW()'),
            field: 'updated_at',
        },
        deleteAt: {
            type: 'timestamp',
            field: 'deleted_at'
        }
    },{
        schema:'one_to_one',
        tableName: 'core_survey',
        freezeTableName: true,
        underscored: true,
        timestamps: true,
        paranoid: true
    });
    coreSurvey.associate = function (models) {
        coreSurvey.hasMany(models['coreSurveyResponse'], {
            as: "responses",
            foreignKey: 'core_survey_response_guid',
            // targetKey: 'csa_object_guid',
            sourceKey: 'csr_object_guid',
            constraints: false
        })
    }
    return coreSurvey;
}
