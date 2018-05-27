var models = require('../index')


models.sequelize.sync(


    {
        force: true
    }


).then(async() => {
    // add

    var t = await models.sequelize.transaction();
    try {
        var team = await models['team'].create({
            name: 'team_name_one',
            desc: 'this is desc one'
        },{t});
        var teamAddress = await models['teamAddress'].create({
            city: 'Sydney',
            address: 'team_address_one'
        },{t});

        var settle_team_address = await teamAddress.setTeam(team, {t});

        await t.commit();
    }catch(err) {
        console.log(err);
        await t.rollback();
    }
});

