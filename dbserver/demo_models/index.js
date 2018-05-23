'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(__filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../config/config')[env];
var db        = {};
var shelljs = require('shelljs');


// if (config.use_env_variable) {
//   var sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
  var sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs.readdirSync(__dirname)
shelljs.ls(path.join(__dirname, './**/*.js')).forEach(function(file) {
    if((file.indexOf('.') !== 0) && (path.basename(file) !== basename) && (file.slice(-3) === '.js')) {
        var model = sequelize['import'](path.join(file));
        db[model.name] = model;
    }
})

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
