const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        username: {
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
        tableName: 'user',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })

    // User.associate = function (models) {
    //     User.hasOne(models['project'],{foreignKey: 'uId',sourceKey: 'id'});
    // }

    return User;
};