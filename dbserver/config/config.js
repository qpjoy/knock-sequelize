// require('dotenv').config();

const {Op} = require('sequelize');

module.exports = {
    development: {
        host: process.env.POSTGRES_HOST?process.env.POSTGRES_HOST:'127.0.0.1',
        port: process.env.POSTGRES_PORT?process.env.POSTGRES_PORT:5432,
        username: process.env.POSTGRES_USER?rocess.env.POSTGRES_USER:'postgres',
        password: process.env.POSTGRES_PASSWORD?process.env.POSTGRES_PASSWORD: 'C',
        database: process.env.POSTGRES_DB?process.env.POSTGRES_DB: 'knock_sequelize',

        dialect: 'postgres',
        operatorsAliases: Op,

        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },

        // // Use a different storage type. Default: sequelize
        // "migrationStorage": "json",
        //
        // // Use a different file name. Default: sequelize-meta.json
        // "migrationStoragePath": "sequelizeMeta.json",
        //
        // // Use a different table name. Default: SequelizeMeta
        // "migrationStorageTableName": "sequelize_meta",
        //
        //
        // // Use a different storage. Default: none
        // "seederStorage": "json",
        // // Use a different file name. Default: sequelize-data.json
        // "seederStoragePath": "sequelizeData.json",
        // // Use a different table name. Default: SequelizeData
        // "seederStorageTableName": "sequelize_data",

        define: {
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
                where: {
                },
                limit: 10
            },
        },
    },
};


// {
//     "development": {
//     "username": "postgres",
//         "password": "admin",
//         "database": "intern_site",
//         "host": "127.0.0.1",
//         "protocol": "postgres",
//         "port": 5432,
//         "dialect": "postgres"
// },
//     "test": {
//     "username": "root",
//         "password": null,
//         "database": "database_test",
//         "host": "127.0.0.1",
//         "dialect": "mysql"
// },
//     "production": {
//     "username": "root",
//         "password": null,
//         "database": "database_production",
//         "host": "127.0.0.1",
//         "dialect": "mysql"
// }
// }
