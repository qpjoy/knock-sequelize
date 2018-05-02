const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const Player = sequelize.define('player', {
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
        tableName: 'player',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })

    Player.associate = function (models) {
        // Player.hasOne(models['player'],{as: 'Player'});
    }

    return Player;
};