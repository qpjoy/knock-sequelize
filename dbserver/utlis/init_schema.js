const models = require('../models');
const sequelize = models.sequelize;
const color = require('chalk');
const log = console.log;

const _ = require('lodash');
var Promise = require('bluebird');

const init_schemas = ['intern', 'test1','one_to_one'];

module.exports = {
    init_schemas: async function() {
	      await sequelize.authenticate();
        // create if not exist schema
        log(color.blue('Initializing schemas ... without public') + color.red('!'));
        let exist_schemas = await sequelize.showAllSchemas();

        log(color.blue('Existing db is ' + exist_schemas.join(',') + ', Default injecting db is ') + color.red(init_schemas.join(',') + '...'));
        let difference = _(init_schemas).chain().difference(exist_schemas).compact().value();

        log(color.blue('we create dbs: ' + difference.join(',') + '!'));

        await Promise.all(difference.reduce(function(pre, cur, idx) {
            // return idx == 0 ? currVal : prevVal + ', ' + currVal;
            pre.push(sequelize.createSchema(cur, {raw: true}).catch(function(err) {
                return err;
            }))
            return pre;
        }, []))
        .then(async function(arrayOfValuesOrErrors) {
            arrayOfValuesOrErrors.forEach(function(cur, idx, arr) {
                log(color.green('Schema', difference[idx], 'initialized!'));
            })
            await sequelize.sync();
        }).catch(function(err) {
                log(color.red(err.message)); // some coding error in handling happened
                return Promise.reject(err);
            });
    }
}