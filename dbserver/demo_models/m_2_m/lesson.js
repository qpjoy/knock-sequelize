const Sequelize = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {

    const Lesson = sequelize.define('lesson', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        uuid: {
            primaryKey: true,
            type: DataTypes.STRING,
            defaultValue: function() {
                return uuid.v4();
            },
            unique: true,
            allowNull: false,
            field: 'lesson_uuid'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
            unique: true
        },
        desc: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        }
    }, {
        schema: 'm_2_m',
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'lesson',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Lesson.associate = function (models) {
        Lesson.belongsToMany(models['student'], {
            through: 'studentLesson',
            // foreignKey: 'uuid_lesson',
            // sourceKey: 'uuid',
            // otherKey: 'uuid',
            constraints: false
        });
    };

    return Lesson;
};