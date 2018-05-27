const sequelize = require('sequelize');
const uuid = require('uuid');

module.exports = (sequelize, DataTypes) => {

    const StudentLesson = sequelize.define('studentLesson', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        uuid: {
            type: DataTypes.STRING,
            defaultValue: function () {
                return uuid.v4();
            },
            unique: true,
            allowNull: false,
            field: 'student_lesson_uuid'
        },
        // student_uuid: {
        //     type: DataTypes.STRING,
        //     defaultValue: function () {
        //         return uuid.v4();
        //     },
        //     allowNull: false,
        //     field: 'student_uuid'
        // },
        // lesson_uuid: {
        //     type: DataTypes.STRING,
        //     defaultValue: function () {
        //         return uuid.v4();
        //     },
        //     allowNull: false,
        //     field: 'lesson_uuid'
        // }
    }, {
        schema: 'm_2_m',
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'student_lesson',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });


    StudentLesson.associate = function (models) {

        // StudentLesson.belongsToMany(models['student'], {
        //     through: 'studentLesson',
        //     // sourceKey: 'team_uuid',
        //     // foreignKey: 'team_player_uuid',
        //     constraints: false
        // });
    };

    return StudentLesson;
};