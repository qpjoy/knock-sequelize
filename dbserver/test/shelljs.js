var shelljs = require('shelljs');
var path = require('path');

shelljs.ls(path.join(__dirname, './**/*.js')).forEach(function(file) {
    console.log(file);
})
