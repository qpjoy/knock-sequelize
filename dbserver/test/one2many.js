var models = require('../models');
var co = require('co');

co(function *(){
    console.log(' 1  - - - - - -- -- -')
    yield models.sequelize.sync();
    console.log(' 2  - - - - - -- -- -')
    var transaction = yield models.sequelize.transaction();
    try {
        console.log(' 3 - - - - - -- -- -')
        var survey = yield models['coreSurveyResponses'].create({}, {transaction});
        console.log(' 4  - - - - - -- -- -')
        var answer = yield models['coreSurveyAnswerDetails'].create({
            page_name: 'page1',
            case_guid: '1',
            survey_guid: '2'
        }, {transaction});
        console.log(' 5  - - - - - -- -- -')
        yield survey.addAnswer(answer,{transaction});
        console.log(' 6  - - - - - -- -- -')
        yield transaction.commit();
    }catch (err) {
        console.log(err)
        console.log(' 7  - - - - - -- -- -')
        yield transaction.rollback();
    }
})