var models = require('../index')


models.sequelize.sync(


    {
        force: true
    }


).then(async() => {
    // add

    var t = await models.sequelize.transaction();
    try {
        let team = await models['team'].create({
            name: 'team_name_one',
            desc: 'this is desc one'
        },{t});
        let teamAddress = await models['teamAddress'].create({
            city: 'Sydney',
            address: 'team_address_one'
        },{t});

        let settle_team_address = await team.addBasketBallAddress([teamAddress], {t});

        await t.commit();
    }catch(err) {
        console.log(err);
        await t.rollback();
    }
});

