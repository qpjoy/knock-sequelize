const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const Project = sequelize.define('project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        projectname: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        ppp: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        }
    }, {
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'project',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Project.associate = function (models) {
        Project.hasOne(models['user'],{ foreignKey: 'project_id', as: 'Puser'});
    }

    return Project;
}