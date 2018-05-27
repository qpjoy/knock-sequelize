const Sequelize = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {

    const Player = sequelize.define('player', {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        uuid: {
            type: DataTypes.STRING,
            defaultValue: function() {
                return uuid.v4();
            },
            unique: true,
            allowNull: false,
            field: 'player_uuid'
        },
        team_player_uuid: {
            type: DataTypes.STRING,
            defaultValue: function() {
                return uuid.v4();
            },
            allowNull: false,
            field: 'team_player_uuid'
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
        schema: '1_2_m',
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'player',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Player.associate = function (models) {
        Player.belongsTo(models['team1'], {
            // as: 'Player',
            // sourceKey: 'uuid',
            foreignKey: 'team_player_uuid',
            targetKey: 'team_uuid',
            // sourceKey: 'team_player_uuid',
            constraints: false
        });
    };

    return Player;
};