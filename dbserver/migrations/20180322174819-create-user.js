'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('user', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            uuid: {
                type: Sequelize.UUID
            },
            name: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            },
            mobile: {
                type: Sequelize.STRING
            },
            sex: {
                type: Sequelize.STRING
            },
            age: {
                type: Sequelize.STRING
            },
            career: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        }, {
            schema: 'intern',
            freezeTableName: true,
            underscored: true,
            // timestamps: false,
            timestamps: true,
            // // I don't want createdAt
            // createdAt: false,
            //
            // // I want updatedAt to actually be called updateTimestamp
            // updatedAt: 'updateTimestamp',
            //
            // // And deletedAt to be called destroyTime (remember to enable paranoid for this to work)
            // deletedAt: 'destroyTime',
            paranoid: true,
            defaultScope: {
                where: {},
                limit: 10
            }
        });
    },
    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('user');
    }
};