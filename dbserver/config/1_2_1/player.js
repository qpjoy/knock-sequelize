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
        // player__uuid: {
        //     type: DataTypes.STRING,
        //     defaultValue: function() {
        //         return uuid.v4();
        //     },
        //     allowNull: false,
        //     field: 'player__uuid'
        // },
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
        schema: '1_2_1',
        timestamps: false,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'player',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Player.associate = function (models) {
        Player.belongsTo(models['team'], {
            // as: 'Player',
            sourceKey: 'player_uuid',
            foreignKey: 'team_uuid',
            targetKey: 'uuid',
            constraints: false
        });
    };

    return Player;
};