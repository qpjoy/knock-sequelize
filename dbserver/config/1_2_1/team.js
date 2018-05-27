const Sequelize = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {

    const Team = sequelize.define('team', {
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
            field: 'team_uuid'
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
        schema: '1_2_1',
        timestamps: true,
        underscored: true,
        // paranoid: true,
        freezeTableName: true,
        tableName: 'team',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    Team.associate = function (models) {
        // Team.hasMany(models['player'], {
        //     sourceKey: 'team_uuid',
        //     foreignKey: 'team_player_uuid',
        //     constraints: false
        // });
    };

    return Team;
};