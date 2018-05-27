const Sequelize = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {

    const Student = sequelize.define('student', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        uuid: {
            primaryKey: true,
            type: DataTypes.STRING,
            defaultValue: function () {
                return uuid.v4();
            },
            unique: true,
            allowNull: false,
            field: 'student_uuid'
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
        timestamps: true,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'student',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Student.associate = function (models) {

        Student.belongsToMany(models['lesson'], {
            through: {
                model: models['studentLesson'],
                unique: false,
            },
            // foreignKey: 'uuid',
            // otherKey: 'student_uuid',
            constraints: false
        });
    };

    return Student;
};