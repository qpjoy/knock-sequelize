var models = require('../demo_models')


models.sequelize.sync().then(() => {
    models['user'].create({
    }).then((user) => {
        console.log('create');

    })
})

