const Sequelize = require('sequelize');
const uuid = require('uuid');
module.exports = (sequelize, DataTypes) => {

    const TeamAddress = sequelize.define('teamAddress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        // uuid: {
        //     type: DataTypes.STRING,
        //     defaultValue: function() {
        //         return uuid.v4();
        //     },
        //     unique: true,
        //     allowNull: false,
        //     field: 'team_address_uuid'
        // },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
            unique: true
        },
        address: {
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
        tableName: 'team_address',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    });

    TeamAddress.associate = function (models) {
        TeamAddress.belongsTo(models['team'], {
            foreignKey: 'team_uuid',
            targetKey: 'team_uuid',
            constraints: false
        });
    };

    return TeamAddress;
};