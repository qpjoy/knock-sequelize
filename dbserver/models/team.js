const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const Team = sequelize.define('team', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        }
    }, {
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'team',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })

    Team.associate = function (models) {
        // Player.hasOne(models['player'],{as: 'Player'});
    }

    return Team;
};