var models = require('../index');


models.sequelize.sync(


    {
        force: true
    }


).then(async() => {
    // add

    var t = await models.sequelize.transaction();
    try {
        let student = await models['student'].create({
            name: 'student',
            desc: 'this is student desc'
        },{t});

        let lesson = await models['lesson'].create({
            name: 'lesson',
            desc: 'this is lesson desc'
        },{t});

        let lesson1 = await models['lesson'].create({
            name: 'lesson1',
            desc: 'this is lesson desc1'
        },{t});

        // belongsToMany
        let settle_student_lesson = await student.addLessons([lesson, lesson1], {t, through: models['studentLesson']});

        let students = await models['student'].findAll({
            include: [{
                model: models['lesson'],
                through: {

                }
            }],
            raw: true
        })

        await t.commit();
    }catch(err) {
        console.log(err);
        await t.rollback();
    }
});

