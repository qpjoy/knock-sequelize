var models = require('../index');


models.sequelize.sync(


    {
        force: true
    }


).then(async() => {
    // add

    var t = await models.sequelize.transaction();
    try {
        let team = await models['team1'].create({
            name: 'team_name_one',
            desc: 'this is desc one'
        },{t});

        let player = await models['player'].create({
            name: 'James bond',
            desc: 'big man'
        },{t});

        let player1 = await models['player'].create({
            name: 'James bond1',
            desc: 'big man1'
        },{t});
        let player2 = await models['player'].create({
            name: 'James bond2',
            desc: 'big man2'
        },{t});

        // belongsTo
        let settle_team_address = await player.setTeam1(team, {t});
        let settle_team_address1 = await player1.setTeam1(team, {t});

        // hasMany
        let settle_team_address2 = await team.addPlayers([player2], {t});

        await t.commit();
    }catch(err) {
        console.log(err);
        await t.rollback();
    }
});

