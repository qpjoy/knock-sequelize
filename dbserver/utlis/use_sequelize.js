var models = require('../models')


models.sequelize.sync().then(() => {
    models['user'].create({
    }).then((user) => {
        console.log('create');
        user.addProject({

        })
    })
})

