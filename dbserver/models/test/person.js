const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {

    const Person = sequelize.define('person', {
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
        tableName: 'person',
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })

    Person.associate = function (models) {
        Person.hasOne(models['person'],{as: 'Father',foreignKey:'DadId'});
    }

    return Person;
};