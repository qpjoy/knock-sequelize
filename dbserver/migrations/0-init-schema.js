'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {

        return Promise.all([
            queryInterface.createSchema(
                'intern'
            ),
            queryInterface.createSchema(
                'test'
            )
        ]);
    },
    down: (queryInterface, Sequelize) => {
        return Promise.all([
            queryInterface.dropSchema(
                'intern'
            ),
            queryInterface.dropSchema(
                'test'
            )
        ]);
    }
};