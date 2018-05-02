var models = require('../../models')


async function oneAdd() {
    await models.sequelize.sync(
        {
            force: true
        }
    );
    let project =  await  models['project'].create({
        projectname: 'abc',
        ppp: 'pppp'
    });
    let user = await  models['user'].create({
        username: 'uuuname',
        password: 'none'
    });

    let result = await project.setPuser(user);

    let find_by_name = await models['project'].findAll({
        where: {
            projectname: 'abc',
        },
        // include: [
        //     {
        //         model: models['user'],
        //         as: 'Puser'
        //     }
        // ]
    })

    console.log(find_by_name, 'find by name')


}

oneAdd();