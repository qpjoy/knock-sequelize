var express = require('express');
var router = express.Router();
var models = require('../../../dbserver/models');
var Promise = require('bluebird');
var sequelize = require('sequelize');
var _ = require('lodash');
var moment = require('moment');
var Decimal = require('decimal.js');

var last_date = {};
var last_compasation_date = {};

function whereClause(req) {
    var body = req.body;
    var query_arr = [];
    if(body && body.querydata) {
        query_arr = body.querydata;
    }
    var whereObj = {};
    query_arr.forEach(function (dt) {
        if(dt.searchType) {
            whereObj = _.setWith(whereObj, dt.searchType.toUpperCase(), dt.searchValue ,whereObj);
        }
    })
    return whereObj;
}

function whereClauseLower(req) {
    var body = req.body;
    var query_arr = [];
    if(body && body.querydata) {
        query_arr = body.querydata;
    }
    var whereObj = {};
    query_arr.forEach(function (dt) {
        if(dt.searchType) {
            whereObj = _.setWith(whereObj, dt.searchType.toLowerCase(), dt.searchValue ,whereObj);
        }
    })
    return whereObj;
}

async function get_num_box(num,req, res, next) {
    var wc = whereClauseLower(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    var period =  moment().subtract(num, 'months').format('MMMM YYYY') + ' - 1';
    var wc_date = _.clone(wc);
    var increase_in_filled_or_open_positions_hris = 0;
    var increase_in_filled_or_open_positions_orgplus = 0;
    var reduction_in_filled_or_open_positions_hris = 0;
    var reduction_in_filled_or_open_positions_orgplus = 0;
    var internal_movements_hris = 0;
    var internal_movements_orgplus = 0;
    var number_box_pro_obj = {};

    if(wc.movement_date) {
        delete wc_date.movement_date;
        // delete last_wc_date.movement_date;
        wc_date["Movement Date"] = wc.movement_date + ' - 1';
        // last_wc_date["Movement Date"] = wc.movement_date + ' - 1';
    }else {
        // February 2018 - 1
        // var date_str = moment().format('MMMM YYYY') + ' - 1'
        wc_date["Movement Date"] = period;
    }

    var number_box_pro = await models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('movement_count')), 'movement_count'],
            'movement_rollup',
            ['Movement source', 'movement_source']
        ],
        where: wc_date,
        group: ['movement_rollup', 'Movement source'],
        raw: true
    })

    if(number_box_pro.length && (_.filter(number_box_pro, ['movement_source', 'HRIS']).length) > 0) {
        console.log(number_box_pro, 'nowadays')
        number_box_pro.forEach(function(dt) {
            if(dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
                increase_in_filled_or_open_positions_hris = dt.movement_count
            }else if (dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
                increase_in_filled_or_open_positions_orgplus = dt.movement_count
            }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
                reduction_in_filled_or_open_positions_hris = dt.movement_count
            }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
                reduction_in_filled_or_open_positions_orgplus = dt.movement_count
            }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'HRIS') {
                internal_movements_hris = dt.movement_count
            }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'ORGPLUS') {
                internal_movements_orgplus = dt.movement_count
            }
        })
        last_date = wc_date;

        return Promise.resolve({
            increase_in_filled_or_open_positions: {
                count: parseInt(increase_in_filled_or_open_positions_hris) + parseInt(increase_in_filled_or_open_positions_orgplus),
                hris: increase_in_filled_or_open_positions_hris,
                orgplus: increase_in_filled_or_open_positions_orgplus
            },
            reduction_in_filled_or_open_positions: {
                count: parseInt(reduction_in_filled_or_open_positions_hris) + parseInt(reduction_in_filled_or_open_positions_orgplus),
                hris: reduction_in_filled_or_open_positions_hris,
                orgplus: reduction_in_filled_or_open_positions_orgplus
            },
            internal_movements: {
                count: parseInt(internal_movements_hris) + parseInt(internal_movements_orgplus),
                hris: internal_movements_hris,
                orgplus: internal_movements_orgplus
            }
        })
    }else {
        num++;
        if(num == 12) {
            return Promise.resolve({
                increase_in_filled_or_open_positions: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                },
                reduction_in_filled_or_open_positions: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                },
                internal_movements: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                }
            })
        }
        return await get_num_box(num,req,res, next);
    }
}

async function get_anualized_num_box(num,req, res, next) {
    var wc = whereClauseLower(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    var period =  moment().subtract(num, 'months').format('MMMM YYYY') + ' - 1';
    var wc_date = _.clone(wc);
    var increase_in_filled_or_open_positions_hris = 0;
    var increase_in_filled_or_open_positions_orgplus = 0;
    var reduction_in_filled_or_open_positions_hris = 0;
    var reduction_in_filled_or_open_positions_orgplus = 0;
    var internal_movements_hris = 0;
    var internal_movements_orgplus = 0;
    var number_box_pro_obj = {};

    if(wc.movement_date) {
        delete wc_date.movement_date;
        // delete last_wc_date.movement_date;
        wc_date["Movement Date"] = wc.movement_date + ' - 1';
        // last_wc_date["Movement Date"] = wc.movement_date + ' - 1';
    }else {
        // February 2018 - 1
        // var date_str = moment().format('MMMM YYYY') + ' - 1'
        wc_date["Movement Date"] = period;
    }

    var number_box_pro = await models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('total_comp')), 'total_comp'],
            'movement_rollup',
            ['Movement source', 'movement_source']
        ],
        where: wc_date,
        group: ['movement_rollup', 'Movement source'],
        raw: true
    });

    if(number_box_pro.length && (_.filter(number_box_pro, ['movement_source', 'HRIS']).length) > 0) {
        number_box_pro.forEach(function(dt) {
            if(dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
                increase_in_filled_or_open_positions_hris = dt.total_comp
            }else if (dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
                increase_in_filled_or_open_positions_orgplus = dt.total_comp
            }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
                reduction_in_filled_or_open_positions_hris = dt.total_comp
            }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
                reduction_in_filled_or_open_positions_orgplus = dt.total_comp
            }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'HRIS') {
                internal_movements_hris = dt.total_comp
            }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'ORGPLUS') {
                internal_movements_orgplus = dt.total_comp
            }
        })

        last_compasation_date = wc_date;

        // number_box_pro_obj
        return Promise.resolve({
            increase_in_filled_or_open_positions: {
                count: parseInt(increase_in_filled_or_open_positions_hris) + parseInt(increase_in_filled_or_open_positions_orgplus),
                hris: increase_in_filled_or_open_positions_hris,
                orgplus: increase_in_filled_or_open_positions_orgplus
            },
            reduction_in_filled_or_open_positions: {
                count: parseInt(reduction_in_filled_or_open_positions_hris) + parseInt(reduction_in_filled_or_open_positions_orgplus),
                hris: reduction_in_filled_or_open_positions_hris,
                orgplus: reduction_in_filled_or_open_positions_orgplus
            },
            internal_movements: {
                count: parseInt(internal_movements_hris) + parseInt(internal_movements_orgplus),
                hris: internal_movements_hris,
                orgplus: internal_movements_orgplus
            }
        });
    }else {
        num++;
        if(num == 12) {
            return Promise.resolve({
                increase_in_filled_or_open_positions: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                },
                reduction_in_filled_or_open_positions: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                },
                internal_movements: {
                    count: 0,
                    hris: 0,
                    orgplus: 0
                }
            })
        }
        return await get_anualized_num_box(num,req,res, next);
    }
}


router.all('/get_all_filter_columns', function(req, res) {
    console.log(req.cookies[jwt_name]);
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    // var dbName = 'TBL_TABLEAU_OUTPUT_ALIASED';
    var promiseArr = [];
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('COMPANY')), 'COMPANY']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('PAYROLL_COMPANY_COMB')), 'PAYROLL_COMPANY_COMB']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('DIVISION_COMB')), 'DIVISION_COMB']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('DEPARTMENT_COMB')), 'DEPARTMENT_COMB']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('BUSINESS_UNIT_COMB')), 'BUSINESS_UNIT_COMB']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('BAND')), 'BAND']], where: wc, raw: true}));
    promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('POSITION_STATE')), 'POSITION_STATE']], where: wc, raw: true}));
    Promise.all(promiseArr).then(function([company,payroll_company_comb,division_comb,department_comb,business_unit_comb,band,position_state]) {
        var filter_company = _.sortBy(company, [function(o) {
            return parseInt(o.COMPANY.split('-')[0]);
        }]).filter(function(o) {
            // return !(_.includes(['NO COMPANY NOTED','0 - CONTRACTOR COMPANY'], o.COMPANY));
            return !(_.includes([null], o.COMPANY));
            // return !(_.includes(['NO COMPANY NOTED','0 - CONTRACTOR COMPANY'], o.COMPANY));
        })

        var filter_payroll_company_comb = _.sortBy(payroll_company_comb, [function(o) {
            return parseInt(o.PAYROLL_COMPANY_COMB.split('-')[0]);
        }]);

        var filter_division_comb = _.sortBy(division_comb, [function(o) {
            return parseInt(o.DIVISION_COMB.split('-')[0]);
        }]);

        var filter_department_comb = _.sortBy(department_comb, [function(o) {
            return parseInt(o.DEPARTMENT_COMB.split('-')[0]);
        }]);

        var filter_business_unit_comb = _.sortBy(business_unit_comb, [function(o) {
            return parseInt(o.BUSINESS_UNIT_COMB.split('-')[0]);
        }]);

        var filter_band = _.sortBy(band, [function(o) {
            return parseInt(o.BAND.split('-')[0]);
        }]);

        var sort_position_state = _.sortBy(position_state, [function(o) {
            return o.POSITION_STATE;
        }]);

        var resDT = {
            company: filter_company,
            payroll_company_comb: filter_payroll_company_comb,
            division_comb: filter_division_comb,
            department_comb: filter_department_comb,
            business_unit_comb: filter_business_unit_comb,
            band: filter_band,
            position_state: sort_position_state
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/get_all_filter_columns_employee_transactions', function(req, res) {
    // var wc = whereClause(req);
    // if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
    //     wc['$and'] = [
    //         {
    //             'USER ACCESS': {
    //                 $like: '%' + req.jwt.email + '%'
    //             }
    //         }
    //     ];
    // }

    var wc = whereClauseLower(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    console.log(wc, 'this is wc');
    var wc_date = _.clone(wc);
    var wc_orion = _.clone(wc);
    delete wc_orion.movement_date;
    if(wc.movement_date) {
        delete wc_date.movement_date;
        wc_date["Movement Date"] = wc.movement_date + ' - 1';
    }else {
        // February 2018 - 1
        // var date_str = moment().format('MMMM YYYY') + ' - 1'
        // wc_date["Movement Date"] = date_str;
        console.log('default filter do nothing ...');
    }
    console.log(wc_date, wc);

    // var dbName = 'TBL_MOVEMENT_OUTPUT';
    var promiseArr = [];

    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('company')), 'COMPANY']], where: wc_date, raw: true}));
    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('payroll_company_comb')), 'PAYROLL_COMPANY_COMB']], where: wc_date, raw: true}));
    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('division_comb')), 'DIVISION_COMB']], where: wc_date, raw: true}));
    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('department_comb')), 'DEPARTMENT_COMB']], where: wc_date, raw: true}));
    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('business_unit_comb')), 'BUSINESS_UNIT_COMB']], where: wc_date, raw: true}));
    promiseArr.push(models['tbl_movement_output'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('band')), 'BAND']], where: wc_date, raw: true}));
    // promiseArr.push(models['tbl_tableau_output_aliased'].findAll({ attributes: [[sequelize.fn('DISTINCT', sequelize.col('POSITION_STATE'))], 'POSITION_STATE'], where: wc, raw: true}));

    // promiseArr.push(models.sequelize.query('SELECT distinct "company" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('SELECT distinct "payroll_company_comb" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('SELECT distinct "division_comb" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('select distinct "department_comb" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('select distinct "business_unit_comb" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('select distinct "band" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    // promiseArr.push(models.sequelize.query('select distinct "POSITION_STATE" FROM ' + dbName, { type: sequelize.QueryTypes.SELECT}));
    Promise.all(promiseArr).then(function([company,payroll_company_comb,division_comb,department_comb,business_unit_comb,band]) {
        var filter_company_1 = _.filter(company, function(o) {
            return !(_.includes([null], o.COMPANY));
        })
        var filter_company = _.sortBy(filter_company_1, [function(o) {
            return parseInt(o.COMPANY.split('-')[0]);
        }])


        var filter_payroll_company_comb = _.sortBy(payroll_company_comb, [function(o) {
            return parseInt(o.PAYROLL_COMPANY_COMB.split('-')[0]);
        }]);

        var filter_division_comb = _.sortBy(division_comb, [function(o) {
            return parseInt(o.DIVISION_COMB.split('-')[0]);
        }]);

        var filter_department_comb = _.sortBy(department_comb, [function(o) {
            return parseInt(o.DEPARTMENT_COMB.split('-')[0]);
        }]);

        var filter_business_unit_comb = _.sortBy(business_unit_comb, [function(o) {
            return parseInt(o.BUSINESS_UNIT_COMB.split('-')[0]);
        }]);

        var filter_band = _.sortBy(band, [function(o) {
            return parseInt(o.BAND.split('-')[0]);
        }]);

        var resDT = {
            company: filter_company,
            payroll_company_comb: filter_payroll_company_comb,
            division_comb: filter_division_comb,
            department_comb: filter_department_comb,
            business_unit_comb: filter_business_unit_comb,
            band: filter_band,
            position_state: "Not Applicable"
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/spans_and_layers_by_band', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var span_of_control_by_band_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('VISION_DIRECT_REPORTS')), 'vision_direct_reports'],
            [sequelize.fn('sum', sequelize.col('VISION_MANAGER')), 'vision_manager'],
            [sequelize.fn('sum', sequelize.col('DIRECTION_DIRECT_REPORTS')), 'direction_direct_reports'],
            [sequelize.fn('sum', sequelize.col('DIRECTION_MANAGER')), 'direction_manager'],
            [sequelize.fn('sum', sequelize.col('EXECUTION_DIRECT_REPORTS')), 'execution_direct_reports'],
            [sequelize.fn('sum', sequelize.col('EXECUTION_MANAGER')), 'execution_manager'],
            [sequelize.fn('sum', sequelize.col('FACILITATION_DIRECT_REPORTS')), 'facilitation_direct_reports'],
            [sequelize.fn('sum', sequelize.col('FACILITATION_MANAGER')), 'facilitation_manager'],
            [sequelize.fn('sum', sequelize.col('ANALYSIS_DIRECT_REPORTS')), 'analysis_direct_reports'],
            [sequelize.fn('sum', sequelize.col('ANALYSIS_MANAGER')), 'analysis_manager'],
            [sequelize.fn('sum', sequelize.col('COORDINATION_DIRECT_REPORTS')), 'coordination_direct_reports'],
            [sequelize.fn('sum', sequelize.col('COORDINATION_MANAGER')), 'coordination_manager'],
            [sequelize.fn('sum', sequelize.col('UN_BANDED_DIRECT_REPORTS')), 'un_banded_direct_reports'],
            [sequelize.fn('sum', sequelize.col('UN_BANDED_MANAGER')), 'un_banded_manager'],
            ['BAND','band']
        ],
        where: wc,
        group: ['BAND'],
        order: [['BAND','desc']],
        raw: true
    });

    var number_of_direct_reports_per_manager_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_MANAGERS')), 'NUMBER_OF_MANAGERS'],
            ['DIRECT_REPORT_RANGE_S', 'vision_manager']
        ],
        where: wc,
        group: ['tbl_tableau_output_aliased.DIRECT_REPORT_RANGE_S'],
        raw: true
    });

    var span_of_control_planning_pro = span_of_control_by_band_pro;

    var number_of_employees_by_band_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'NUMBER_OF_MANAGERS'],
            'BAND'
        ],
        where: wc,
        group: ['BAND'],
        order: [['BAND','desc']],
        raw: true
    });

    promiseArr.push(span_of_control_by_band_pro);
    promiseArr.push(number_of_direct_reports_per_manager_pro);
    promiseArr.push(span_of_control_planning_pro);
    promiseArr.push(number_of_employees_by_band_pro);
    Promise.all(promiseArr).then(function([span_of_control_by_band,number_of_direct_reports_per_manager,span_of_control_planning,number_of_employees_by_band]) {

        var mapedResult_span_of_control_by_band = span_of_control_by_band.filter(function(o) {
            return !(_.includes(['10 - SUPPORT'], o.band));
        }).map(re => {
            // direct_reports, managers, band
            switch (re['band']){
                case '70 - VISION':
                    return {
                        direct_reports: re.vision_direct_reports,
                        managers: re.vision_manager,
                        band: '70 - VISION'
                    }
                    break;
                case '60 - DIRECTION':
                    return {
                        direct_reports: re.direction_direct_reports,
                        managers: re.direction_manager,
                        band: '60 - DIRECTION'
                    }
                    break;
                case '50 - EXECUTION':
                    return {
                        direct_reports: re.execution_direct_reports,
                        managers: re.execution_manager,
                        band: '50 - EXECUTION'
                    }
                    break;
                case '40 - FACILITATION':
                    return {
                        direct_reports: re.facilitation_direct_reports,
                        managers: re.facilitation_manager,
                        band: '40 - FACILITATION'
                    }
                    break;
                case '30 - ANALYSIS':
                    return {
                        direct_reports: re.analysis_direct_reports,
                        managers: re.analysis_manager,
                        band: '30 - ANALYSIS'
                    }
                    break;
                case '20 - COORDINATION':
                    return {
                        direct_reports: re.coordination_direct_reports,
                        managers: re.coordination_manager,
                        band: '20 - COORDINATION'
                    }
                    break;
                case '10 - SUPPORT':
                    return {
                        direct_reports: re.un_banded_direct_reports,
                        managers: re.un_banded_manager,
                        band: '10 - SUPPORT'
                    }
                    break;
                case 'UN-BANDED':
                    return {
                        direct_reports: re.un_banded_direct_reports,
                        managers: re.un_banded_manager,
                        band: 'UN-BANDED'
                    }
                    break;
                default:
                    return {}
            }
        })
        var shift_item = mapedResult_span_of_control_by_band.shift();
        if(shift_item.band != 'UN-BANDED') {
            mapedResult_span_of_control_by_band.unshift(shift_item);
        }else {
            mapedResult_span_of_control_by_band.push(shift_item)
        }

        var filter_number_of_direct_reports_per_manager = _.sortBy(number_of_direct_reports_per_manager.filter(function(o) {
            return !(_.includes([null], o.vision_manager));
        }), [function(o) {
            return parseInt(o.vision_manager.split('-')[0]);
        }])

        var maped_span_of_control_planning = span_of_control_planning.filter(function(o) {
            return !(_.includes(['10 - SUPPORT'], o.band));
        }).map(re => {
            // direct_reports, managers, band
            switch (re['band']){
                case '70 - VISION':
                    return {
                        band: '70 - VISION',
                        of_manager: re.vision_manager,
                        span_of_control: re.vision_direct_reports/(re.vision_manager||1),
                        target_managers: Math.round(re.vision_direct_reports/7),
                        charge_in_managers: Math.round(re.vision_direct_reports/7)-re.vision_manager,
                        target_soc: 7,
                        direct_reports: re.vision_direct_reports
                    }
                    break;
                case '60 - DIRECTION':
                    return {
                        band: '60 - DIRECTION',
                        of_manager: re.direction_manager,
                        span_of_control: re.direction_direct_reports/(re.direction_manager||1),
                        target_managers: Math.round(re.direction_direct_reports/7),
                        charge_in_managers: Math.round(re.direction_direct_reports/7)-re.direction_manager,
                        target_soc: 7,
                        direct_reports: re.direction_direct_reports
                    }
                    break;
                case '50 - EXECUTION':
                    return {
                        band: '50 - EXECUTION',
                        of_manager: re.execution_manager,
                        span_of_control: re.execution_direct_reports/(re.execution_manager||1),
                        target_managers: Math.round(re.execution_direct_reports/7),
                        charge_in_managers: Math.round(re.execution_direct_reports/7)-re.execution_manager,
                        target_soc: 7,
                        direct_reports: re.execution_direct_reports
                    }
                    break;
                case '40 - FACILITATION':
                    return {
                        band: '40 - FACILITATION',
                        of_manager: re.facilitation_manager,
                        span_of_control: re.facilitation_direct_reports/(re.facilitation_manager||1),
                        target_managers: Math.round(re.facilitation_direct_reports/7),
                        charge_in_managers: Math.round(re.facilitation_direct_reports/7)-re.facilitation_manager,
                        target_soc: 7,
                        direct_reports: re.facilitation_direct_reports
                    }
                    break;
                case '30 - ANALYSIS':
                    return {
                        band: '30 - ANALYSIS',
                        of_manager: re.analysis_manager,
                        span_of_control: re.analysis_direct_reports/(re.analysis_manager||1),
                        target_managers: Math.round(re.analysis_direct_reports/7),
                        charge_in_managers: Math.round(re.analysis_direct_reports/7)-re.analysis_manager,
                        target_soc: 7,
                        direct_reports: re.analysis_direct_reports
                    }
                    break;
                case '20 - COORDINATION':
                    return {
                        band: '20 - COORDINATION',
                        of_manager: re.coordination_manager,
                        span_of_control: re.coordination_direct_reports/(re.coordination_manager||1),
                        target_managers: Math.round(re.coordination_direct_reports/7),
                        charge_in_managers: Math.round(re.coordination_direct_reports/7)-re.coordination_manager,
                        target_soc: 7,
                        direct_reports: re.coordination_direct_reports
                    }
                    break;
                case '10 - SUPPORT':
                    return {
                        band: '10 - SUPPORT',
                        of_manager: re.un_banded_manager,
                        span_of_control: re.un_banded_direct_reports/(re.un_banded_manager||1),
                        target_managers: Math.round(re.un_banded_direct_reports/7),
                        charge_in_managers: Math.round(re.un_banded_direct_reports/7)-re.un_banded_manager,
                        target_soc: 7,
                        direct_reports: re.un_banded_direct_reports
                    }
                    break;
                case 'UN-BANDED':
                    return {
                        band: 'UN-BANDED',
                        of_manager: re.un_banded_manager,
                        span_of_control: re.un_banded_direct_reports/(re.un_banded_manager||1),
                        target_managers: Math.round(re.un_banded_direct_reports/7),
                        charge_in_managers: Math.round(re.un_banded_direct_reports/7)-re.un_banded_manager,
                        target_soc: 7,
                        direct_reports: re.un_banded_direct_reports
                    }
                    break;
                default:
                    console.log('noting');
                    return {};
            }
        })

        var shift_item_planning = maped_span_of_control_planning.shift();
        if(shift_item_planning.band != 'UN-BANDED') {
            maped_span_of_control_planning.unshift(shift_item_planning);
        }else {
            maped_span_of_control_planning.push(shift_item_planning)
        }

        // maped_span_of_control_planning.push(maped_span_of_control_planning.shift());
        var shift_item_band = number_of_employees_by_band.shift();
        if(shift_item_band['BAND'] != 'UN-BANDED') {
            number_of_employees_by_band.unshift(shift_item_band);
        }else {
            number_of_employees_by_band.push(shift_item_band)
        }

        var resDT = {
            span_of_control_by_band: mapedResult_span_of_control_by_band,
            number_of_direct_reports_per_manager: filter_number_of_direct_reports_per_manager,
            span_of_control_planning: maped_span_of_control_planning,
            number_of_employees_by_band: number_of_employees_by_band
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
});

router.all('/spans_and_layers_by_level', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var span_of_control_by_level_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('N01_DIRECT_REPORTS')), 'n01_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N01_MANAGER_COUNT')), 'n01_manager_count'],
            [sequelize.fn('sum', sequelize.col('N02_DIRECT_REPORTS')), 'n02_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N02_MANAGER_COUNT')), 'n02_manager_count'],
            [sequelize.fn('sum', sequelize.col('N03_DIRECT_REPORTS')), 'n03_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N03_MANAGER_COUNT')), 'n03_manager_count'],
            [sequelize.fn('sum', sequelize.col('N04_DIRECT_REPORTS')), 'n04_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N04_MANAGER_COUNT')), 'n04_manager_count'],
            [sequelize.fn('sum', sequelize.col('N05_DIRECT_REPORTS')), 'n05_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N05_MANAGER_COUNT')), 'n05_manager_count'],
            [sequelize.fn('sum', sequelize.col('N06_DIRECT_REPORTS')), 'n06_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N06_MANAGER_COUNT')), 'n06_manager_count'],
            [sequelize.fn('sum', sequelize.col('N07_DIRECT_REPORTS')), 'n07_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N07_MANAGER_COUNT')), 'n07_manager_count'],
            [sequelize.fn('sum', sequelize.col('N08_DIRECT_REPORTS')), 'n08_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N08_MANAGER_COUNT')), 'n08_manager_count'],
            [sequelize.fn('sum', sequelize.col('N09_DIRECT_REPORTS')), 'n09_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N09_MANAGER_COUNT')), 'n09_manager_count'],
            [sequelize.fn('sum', sequelize.col('N10_DIRECT_REPORTS')), 'n10_direct_reports'],
            [sequelize.fn('sum', sequelize.col('N10_MANAGER_COUNT')), 'n10_manager_count'],
            ['EMPLOYEE_LEVEL','employee_level']
        ],
        where: wc,
        group: ['EMPLOYEE_LEVEL'],
        order: ['EMPLOYEE_LEVEL'],
        raw: true
    });

    var number_of_direct_reports_per_manager_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_MANAGERS')), 'NUMBER_OF_MANAGERS'],
            ['DIRECT_REPORT_RANGE_S', 'vision_manager']
        ],
        where: wc,
        group: ['tbl_tableau_output_aliased.DIRECT_REPORT_RANGE_S'],
        raw: true
    });

    var span_of_control_planning_pro = span_of_control_by_level_pro;

    var number_of_employees_by_level_pro = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'number_of_positions'],
            ['EMPLOYEE_LEVEL','employee_level']
        ],
        where: wc,
        group: ['EMPLOYEE_LEVEL'],
        order: ['EMPLOYEE_LEVEL'],
        raw: true
    });

    promiseArr.push(span_of_control_by_level_pro);
    promiseArr.push(number_of_direct_reports_per_manager_pro);
    promiseArr.push(span_of_control_planning_pro);
    promiseArr.push(number_of_employees_by_level_pro);
    Promise.all(promiseArr).then(function([span_of_control_by_level,number_of_direct_reports_per_manager,span_of_control_planning,number_of_employees_by_level]) {
        var mapedResult_span_of_control_by_band = span_of_control_by_level.filter(function(o) {
            return !(_.includes(['N - 11'], o.employee_level));
        }).map(re => {
            // direct_reports, managers, band
            switch (re['employee_level']){
                case 'N - 10':
                    return {
                        direct_reports: re.n10_direct_reports,
                        managers: re.n10_manager_count,
                        employee_level: 'N - 10'
                    }
                    break;
                case 'N - 09':
                    return {
                        direct_reports: re.n09_direct_reports,
                        managers: re.n09_manager_count,
                        employee_level: 'N - 09'
                    }
                    break;
                case 'N - 08':
                    return {
                        direct_reports: re.n08_direct_reports,
                        managers: re.n08_manager_count,
                        employee_level: 'N - 08'
                    }
                    break;
                case 'N - 07':
                    return {
                        direct_reports: re.n07_direct_reports,
                        managers: re.n07_manager_count,
                        employee_level: 'N - 07'
                    }
                    break;
                case 'N - 06':
                    return {
                        direct_reports: re.n06_direct_reports,
                        managers: re.n06_manager_count,
                        employee_level: 'N - 06'
                    }
                    break;
                case 'N - 05':
                    return {
                        direct_reports: re.n05_direct_reports,
                        managers: re.n05_manager_count,
                        employee_level: 'N - 05'
                    }
                    break;
                case 'N - 04':
                    return {
                        direct_reports: re.n04_direct_reports,
                        managers: re.n04_manager_count,
                        employee_level: 'N - 04'
                    }
                    break;
                case 'N - 03':
                    return {
                        direct_reports: re.n03_direct_reports,
                        managers: re.n03_manager_count,
                        employee_level: 'N - 03'
                    }
                    break;
                case 'N - 02':
                    return {
                        direct_reports: re.n02_direct_reports,
                        managers: re.n02_manager_count,
                        employee_level: 'N - 02'
                    }
                    break;
                case 'N - 01':
                    return {
                        direct_reports: re.n01_direct_reports,
                        managers: re.n01_manager_count,
                        employee_level: 'N - 01'
                    }
                    break;
                default:
                    return {}
            }
        })

        var filter_number_of_direct_reports_per_manager = _.sortBy(number_of_direct_reports_per_manager.filter(function(o) {
            return !(_.includes([null], o.vision_manager));
        }), [function(o) {
            return parseInt(o.vision_manager.split('-')[0]);
        }])


        var maped_span_of_control_planning = span_of_control_planning.filter(function(o) {
            return o && o.employee_level && !(_.includes(['N - 11'], o.employee_level));
        }).map(re => {
            // direct_reports, managers, band
            switch (re['employee_level']){
                case 'N - 10':
                    return {
                        band: 'N - 10',
                        of_manager: re.n10_manager_count,
                        span_of_control: re.n10_direct_reports/(re.n10_manager_count||1),
                        target_managers: Math.round(re.n10_direct_reports/7),
                        charge_in_managers: Math.round(re.n10_direct_reports/7)-re.n10_manager_count,
                        target_soc: 7,
                        direct_reports: re.n10_direct_reports
                    }
                    break;
                case 'N - 09':
                    return {
                        band: 'N - 09',
                        of_manager: re.n09_manager_count,
                        span_of_control: re.n09_direct_reports/(re.n09_manager_count||1),
                        target_managers: Math.round(re.n09_direct_reports/7),
                        charge_in_managers: Math.round(re.n09_direct_reports/7)-re.n09_manager_count,
                        target_soc: 7,
                        direct_reports: re.n09_direct_reports
                    }
                    break;
                case 'N - 08':
                    return {
                        band: 'N - 08',
                        of_manager: re.n08_manager_count,
                        span_of_control: re.n08_direct_reports/(re.n08_manager_count||1),
                        target_managers: Math.round(re.n08_direct_reports/7),
                        charge_in_managers: Math.round(re.n08_direct_reports/7)-re.n08_manager_count,
                        target_soc: 7,
                        direct_reports: re.n08_direct_reports
                    }
                    break;
                case 'N - 07':
                    return {
                        band: 'N - 07',
                        of_manager: re.n07_manager_count,
                        span_of_control: re.n07_direct_reports/(re.n07_manager_count||1),
                        target_managers: Math.round(re.n07_direct_reports/7),
                        charge_in_managers: Math.round(re.n07_direct_reports/7)-re.n07_manager_count,
                        target_soc: 7,
                        direct_reports: re.n07_direct_reports
                    }
                    break;
                case 'N - 06':
                    return {
                        band: 'N - 06',
                        of_manager: re.n06_manager_count,
                        span_of_control: re.n06_direct_reports/(re.n06_manager_count||1),
                        target_managers: Math.round(re.n06_direct_reports/7),
                        charge_in_managers: Math.round(re.n06_direct_reports/7)-re.n06_manager_count,
                        target_soc: 7,
                        direct_reports: re.n06_direct_reports
                    }
                    break;
                case 'N - 05':
                    return {
                        band: 'N - 05',
                        of_manager: re.n05_manager_count,
                        span_of_control: re.n05_direct_reports/(re.n05_manager_count||1),
                        target_managers: Math.round(re.n05_direct_reports/7),
                        charge_in_managers: Math.round(re.n05_direct_reports/7)-re.n05_manager_count,
                        target_soc: 7,
                        direct_reports: re.n05_direct_reports
                    }
                    break;
                case 'N - 04':
                    return {
                        band: 'N - 04',
                        of_manager: re.n04_manager_count,
                        span_of_control: re.n04_direct_reports/(re.n04_manager_count||1),
                        target_managers: Math.round(re.n04_direct_reports/7),
                        charge_in_managers: Math.round(re.n04_direct_reports/7)-re.n04_manager_count,
                        target_soc: 7,
                        direct_reports: re.n04_direct_reports
                    }
                    break;
                case 'N - 03':
                    return {
                        band: 'N - 03',
                        of_manager: re.n03_manager_count,
                        span_of_control: re.n03_direct_reports/(re.n03_manager_count||1),
                        target_managers: Math.round(re.n03_direct_reports/7),
                        charge_in_managers: Math.round(re.n03_direct_reports/7)-re.n03_manager_count,
                        target_soc: 7,
                        direct_reports: re.n03_direct_reports
                    }
                    break;
                case 'N - 02':
                    return {
                        band: 'N - 02',
                        of_manager: re.n02_manager_count,
                        span_of_control: re.n02_direct_reports/(re.n02_manager_count||1),
                        target_managers: Math.round(re.n02_direct_reports/7),
                        charge_in_managers: Math.round(re.n02_direct_reports/7)-re.n02_manager_count,
                        target_soc: 7,
                        direct_reports: re.n02_direct_reports
                    }
                    break;
                case 'N - 01':
                    return {
                        band: 'N - 01',
                        of_manager: re.n01_manager_count,
                        span_of_control: re.n01_direct_reports/(re.n01_manager_count||1),
                        target_managers: Math.round(re.n01_direct_reports/7),
                        charge_in_managers: Math.round(re.n01_direct_reports/7)-re.n01_manager_count,
                        target_soc: 7,
                        direct_reports: re.n01_direct_reports
                    }
                    break;
                default:
                    console.log('noting');
                    return {};
            }
        })

        // var filer_number_of_employees_by_band = number_of_employees_by_level.filter(function(o) {
        //     return !(_.includes(['N - 11'], o.employee_level));
        // });
        var filer_number_of_employees_by_band = number_of_employees_by_level;
        var resDT = {
            span_of_control_by_band: mapedResult_span_of_control_by_band,
            number_of_direct_reports_per_manager: filter_number_of_direct_reports_per_manager,
            span_of_control_planning: maped_span_of_control_planning,
            number_of_employees_by_band: filer_number_of_employees_by_band
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/direct_reports', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var total_direct_reports = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('TOTAL_DIRECT_REPORTS')), 'total_direct_reports'],
            [sequelize.fn('sum', sequelize.col('DIRECT_REPORTS')), 'support_office_in'],
            [sequelize.fn('sum', sequelize.col('FIELD_DIRECT_REPORTS')), 'field'],
            [sequelize.fn('sum', sequelize.col('SO_N_DIRECT_REPORTS')), 'support_office_out'],
        ],
        where: wc,
        raw: true
    });


    // { total_direct_reports: '0',
    //     number_of_managers: '0',
    //     band: '10 - SUPPORT' }
    var span_of_control = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('TOTAL_DIRECT_REPORTS')), 'total_direct_reports'],
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_MANAGERS')), 'number_of_managers'],
            ['BAND', 'band']
        ],
        where: wc,
        group: ['BAND'],
        order: ['BAND'],
        raw: true
    });

    var number_of_direct_reports_per_manager = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_MANAGERS')), 'NUMBER_OF_MANAGERS'],
            ['DIRECT_REPORT_RANGE_T', 'vision_manager']
        ],
        where: wc,
        group: ['DIRECT_REPORT_RANGE_T'],
        raw: true
    });

    var direct_reports_by_band = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('DIRECT_REPORTS')), 'support_office_in'],
            [sequelize.fn('sum', sequelize.col('FIELD_DIRECT_REPORTS')), 'field'],
            [sequelize.fn('sum', sequelize.col('SO_N_DIRECT_REPORTS')), 'support_office_out'],
            ['BAND', 'band']
        ],
        where: wc,
        group: ['BAND'],
        order: ['BAND'],
        raw: true
    });

    promiseArr.push(total_direct_reports);
    promiseArr.push(span_of_control);
    promiseArr.push(number_of_direct_reports_per_manager);
    promiseArr.push(direct_reports_by_band);
    Promise.all(promiseArr).then(function([total_direct_reports_pro, span_of_control_pro, number_of_direct_reports_per_manager_pro,direct_reports_by_band_pro]) {
        var span_of_control_pro_res = span_of_control_pro.map(function(data) {
            return {
                total_direct_reports: data.total_direct_reports,
                number_of_managers: data.number_of_managers,
                band: data.band,
                y_axis: data.total_direct_reports/(parseInt(data.number_of_managers) || 1)
            }
        });

        var filter_number_of_direct_reports_per_manager_pro = _.sortBy(number_of_direct_reports_per_manager_pro.filter(function(o) {
            return !(_.includes([null], o.vision_manager));
        }), [function(o) {
            return parseInt(o.vision_manager.split('-')[0]);
        }])
        var resDT = {
            total_direct_reports: total_direct_reports_pro,
            span_of_control: span_of_control_pro_res,
            number_of_direct_reports_per_manager: filter_number_of_direct_reports_per_manager_pro,
            direct_reports_by_band: direct_reports_by_band_pro,
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/position_metrics', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var number_box = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('SPECIAL_ASSIGNMENT_COUNT')), 'special_assignment_count'],
            [sequelize.fn('sum', sequelize.col('PROJECT_COUNT')), 'project_count'],
            [sequelize.fn('sum', sequelize.col('CONTRACTOR_COUNT')), 'contractor_count'],
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'number_of_positions'],
        ],
        where: wc,
        // group: ['BAND'],
        // order: [['BAND', 'desc']],
        raw: true
    });

    var staff_to_managers_headcount_ratio = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('STAFF_COUNT')), 'staff_count'],
            [sequelize.fn('sum', sequelize.col('MANAGER_COUNT')), 'manager_count'],
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'number_of_positions'],
            ['MANAGER_FLAG', 'manager_flag']
        ],
        where: wc,
        group: ['MANAGER_FLAG'],
        order: ['MANAGER_FLAG'],
        raw: true
    });

    var filled_positions = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'number_of_positions'],
            [sequelize.fn('sum', sequelize.col('FILLED_COUNT')), 'filled_count'],
            ['OPEN_FILLED', 'open_filled']
        ],
        where: wc,
        group: ['OPEN_FILLED'],
        order: ['OPEN_FILLED'],
        raw: true
    });

    promiseArr.push(number_box);
    promiseArr.push(staff_to_managers_headcount_ratio);
    promiseArr.push(filled_positions);
    Promise.all(promiseArr).then(function([number_box_pro, staff_to_managers_headcount_ratio_pro, filled_positions_pro]) {

        var resDT = {
            number_box: number_box_pro,
            staff_to_managers_headcount_ratio: staff_to_managers_headcount_ratio_pro,
            filled_positions: filled_positions_pro
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
});

router.all('/compensation_snapshot', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var number_box = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('SPECIAL_ASSIGNMENT_COMP')), 'SPECIAL_ASSIGNMENT_COMP'],
            [sequelize.fn('sum', sequelize.col('PROJECT_COMP')), 'PROJECT_COMP'],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'],
            [sequelize.fn('sum', sequelize.col('NUMBER_OF_POSITIONS')), 'NUMBER_OF_POSITIONS'],
        ],
        where: wc,
        // group: ['BAND'],
        // order: [['BAND', 'desc']],
        raw: true
    });

    var staff_to_managers_compensation_ratio = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('STAFF_COMP')), 'STAFF_COMP'],
            [sequelize.fn('sum', sequelize.col('MANAGER_COMP')), 'MANAGER_COMP'],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'],
            ['MANAGER_FLAG', 'manager_flag']
        ],
        where: wc,
        group: ['MANAGER_FLAG'],
        order: ['MANAGER_FLAG'],
        raw: true
    });

    var filled_positions = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('FILLED_COMP')), 'FILLED_COMP'],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'],
            [sequelize.fn('sum', sequelize.col('OPEN_COMP')), 'OPEN_COMP'],
            [sequelize.fn('sum', sequelize.col('BUDGETED_COMP')), 'BUDGETED_COMP'],
            ['OPEN_FILLED', 'open_filled']
        ],
        where: wc,
        group: ['OPEN_FILLED'],
        order: ['OPEN_FILLED'],
        raw: true
    });
    var total_cost_by_band = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'.toLowerCase()],
            ['BAND','band']
        ],
        where: wc,
        group: ['BAND'],
        order: [['BAND','desc']],
        raw: true
    });

    promiseArr.push(number_box);
    promiseArr.push(staff_to_managers_compensation_ratio);
    promiseArr.push(filled_positions);
    promiseArr.push(total_cost_by_band);
    Promise.all(promiseArr).then(function([number_box, staff_to_managers_compensation_ratio, filled_positions,total_cost_by_band]) {
        number_box = number_box.map(function (item) {
            return {
                "special_assignments":item.SPECIAL_ASSIGNMENT_COMP,
                "project_comp":item.PROJECT_COMP,
                "total_cost":item.CURRENT_REFRESH_COMP,
                "average_cost_per_position":item.CURRENT_REFRESH_COMP/(parseInt(item.NUMBER_OF_POSITIONS)||1),
            }
        })
        filled_positions = filled_positions.map(function (item) {
            return{
                "percentage":item.FILLED_COMP/(parseInt(item.CURRENT_REFRESH_COMP)||1),
                "circle":item.CURRENT_REFRESH_COMP,
                "filled":item.FILLED_COMP,
                "open":item.OPEN_COMP,
                "budgeted":item.BUDGETED_COMP,
                "open_filled":item.open_filled
            }
        })

        staff_to_managers_compensation_ratio = staff_to_managers_compensation_ratio.map(function (item) {
            return {
                "ratio_data":Math.round(item.STAFF_COMP/(parseInt(item.MANAGER_COMP)||1))+":1",
                "circle_chart_data":item.CURRENT_REFRESH_COMP,
                "staff":item.STAFF_COMP,
                "manager":item.MANAGER_COMP,
                "manager_flag":item.manager_flag
            }
        });
        total_cost_by_band = total_cost_by_band.map(re => {
            // direct_reports, managers, band
            switch (re['band']){
                case '70 - VISION':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '70 - VISION'
                    }
                    break;
                case '60 - DIRECTION':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '60 - DIRECTION'
                    }
                    break;
                case '50 - EXECUTION':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '50 - EXECUTION'
                    }
                    break;
                case '40 - FACILITATION':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '40 - FACILITATION'
                    }
                    break;
                case '30 - ANALYSIS':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '30 - ANALYSIS'
                    }
                    break;
                case '20 - COORDINATION':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '20 - COORDINATION'
                    }
                    break;
                case '10 - SUPPORT':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: '10 - SUPPORT'
                    }
                    break;
                case 'UN-BANDED':
                    return {
                        current_refresh_comp: re.current_refresh_comp,
                        band: 'UN-BANDED'
                    }
                    break;
                default:
                    return {}
            }
        });
        // total_cost_by_band.push(total_cost_by_band.shift());
        var total_cost_by_band_shift_item = total_cost_by_band.shift();
        if(total_cost_by_band_shift_item.band != 'UN-BANDED') {
            total_cost_by_band.unshift(total_cost_by_band_shift_item);
        }else {
            total_cost_by_band.push(total_cost_by_band_shift_item)
        }

        var resDT = {
            number_box: number_box,
            staff_to_managers_compensation_ratio: staff_to_managers_compensation_ratio,
            filled_positions:filled_positions,
            total_cost_by_band:total_cost_by_band
        }

        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
});

router.all('/annualized_run_rate_savings', function(req, res) {
    var wc = whereClause(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'USER ACCESS': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }
    var promiseArr = [];
    var number_box = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('BASELINE_COMP')), 'BASELINE_COMP'],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP']
        ],
        where: wc,
        // group: ['BAND'],
        // order: [['BAND', 'desc']],
        raw: true
    });

    var table = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('BASELINE_COMP')), 'BASELINE_COMP'],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'],
            ['DIVISION', 'division']
        ],
        where: wc,
        group: ['DIVISION'],
        order: ['DIVISION'],
        raw: true
    });

    var bar_char = models['tbl_tableau_output_aliased'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('BASELINE_COMP')), 'BASELINE_COMP'.toLowerCase()],
            [sequelize.fn('sum', sequelize.col('CURRENT_REFRESH_COMP')), 'CURRENT_REFRESH_COMP'.toLowerCase()],
            ['BAND', 'band']
        ],
        where: wc,
        group: ['BAND'],
        order: ['BAND'],
        raw: true
    });

    promiseArr.push(number_box);
    promiseArr.push(table);
    promiseArr.push(bar_char);
    Promise.all(promiseArr).then(function([number_box, table, bar_char]) {
        var number_box_pro = number_box.map(function (item) {
            return {
                "total_baseline_annualized_cost":item.BASELINE_COMP,
                "total_current_annualized_cost":item.CURRENT_REFRESH_COMP,
                "annualized_run_rate_savings":item.BASELINE_COMP - item.CURRENT_REFRESH_COMP,
                "average_cost_savings":(item.CURRENT_REFRESH_COMP==0||item.BASELINE_COMP==0||!item.CURRENT_REFRESH_COMP || !item.BASELINE_COMP)?0:((item.CURRENT_REFRESH_COMP/(parseInt(item.BASELINE_COMP)||1))-1)
            }
        })
        console.log(number_box_pro, 'this is numberbox');
        var table_pro = table.map(function (item) {
            return {
                "baseline_comp":Decimal(item.BASELINE_COMP).valueOf(),
                "current_refresh_comp":Decimal(item.CURRENT_REFRESH_COMP).valueOf(),
                "actual_cost_savings":Decimal(item.BASELINE_COMP).sub(Decimal(item.CURRENT_REFRESH_COMP)).valueOf(),
                "percentage":(item.CURRENT_REFRESH_COMP==0||item.BASELINE_COMP==0 || !item.CURRENT_REFRESH_COMP || !item.BASELINE_COMP)?0:(Decimal(item.CURRENT_REFRESH_COMP).div(parseInt(item.BASELINE_COMP) || 1).sub(1).valueOf()),
                "division":item.division
            }
        })
        var resDT = {
            number_box: number_box_pro,
            table_data: table_pro,
            bar_char: bar_char
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
});

router.all('/employee_transactions', async function(req, res,next) {
    var wc = whereClauseLower(req);

    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    var period = moment().format('MMMM YYYY') + ' - 1';
    var last_period = moment().subtract(1, 'months').format('MMMM YYYY') + ' - 1';

    console.log(wc, 'this is wc');
    var wc_date = _.clone(wc);
    var last_wc_date = _.clone(wc);
    var wc_orion = _.clone(wc);
    delete wc_orion.movement_date;
    if(wc.movement_date) {
        delete wc_date.movement_date;
        delete last_wc_date.movement_date;
        wc_date["Movement Date"] = wc.movement_date + ' - 1';
        last_wc_date["Movement Date"] = wc.movement_date + ' - 1';
    }else {
        // February 2018 - 1
        // var date_str = moment().format('MMMM YYYY') + ' - 1'
        wc_date["Movement Date"] = period;
        last_wc_date["Movement Date"] = last_period;
    }
    console.log(wc_date, wc);

    var promiseArr = [];

    var numberget_anualized_num_box = await get_num_box(0,req,res,next);
    console.log(numberget_anualized_num_box);

    // var current_count = models['tbl_movement_output'].findAll({
    //     attributes: [[sequelize.fn('COUNT', sequelize.col('Movement Date')), 'movement_date_count']],
    //     where: {
    //         "Movement Date": 'April 2018 – 2'
    //     },
    //     raw: true
    // });
    // .then(function (data) {
    // console.log(data[0].movement_date_count);
    // })

    // var number_box = models['tbl_movement_output'].findAll({
    //     attributes: [
    //         [sequelize.fn('sum', sequelize.col('movement_count')), 'movement_count'],
    //         'movement_rollup',
    //         ['Movement source', 'movement_source']
    //     ],
    //     where: wc_date,
    //     group: ['movement_rollup', 'Movement source'],
    //     raw: true
    // });
    // var last_number_box = models['tbl_movement_output'].findAll({
    //     attributes: [
    //         [sequelize.fn('sum', sequelize.col('movement_count')), 'movement_count'],
    //         'movement_rollup',
    //         ['Movement source', 'movement_source']
    //     ],
    //     where: last_wc_date,
    //     group: ['movement_rollup', 'Movement source'],
    //     raw: true
    // });

    var movement_time_series = models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('movement_count')), 'movement_count'],
            'movement_rollup',
            ['Movement Date', 'movement_date']
        ],
        where: wc_orion,
        group: ['movement_rollup', "Movement Date"],
        raw: true
    });

    var movement_drill_down = models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('movement_count')), 'movement_count'],
            'movement_rollup',
            'movement_type',
            'movement'
        ],
        where: last_date,
        group: ['movement_rollup', "movement_type","movement"],
        order: ['movement_rollup', "movement_type","movement"],
        raw: true
    });

    // promiseArr.push(number_box);
    // promiseArr.push(last_number_box);
    promiseArr.push(movement_time_series);
    promiseArr.push(movement_drill_down);
    Promise.all(promiseArr).then(function([movement_time_series_pro,movement_drill_down_pro]) {
        // var increase_in_filled_or_open_positions_hris = 0;
        // var increase_in_filled_or_open_positions_orgplus = 0;
        // var reduction_in_filled_or_open_positions_hris = 0;
        // var reduction_in_filled_or_open_positions_orgplus = 0;
        // var internal_movements_hris = 0;
        // var internal_movements_orgplus = 0;
        // var number_box_pro_obj;
        // if(number_box_pro.length && (_.filter(number_box_pro, ['movement_source', 'HRIS']).length) > 0) {
        //     console.log(number_box_pro, 'nowadays')
        //     number_box_pro.forEach(function(dt) {
        //         if(dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
        //             increase_in_filled_or_open_positions_hris = dt.movement_count
        //         }else if (dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
        //             increase_in_filled_or_open_positions_orgplus = dt.movement_count
        //         }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
        //             reduction_in_filled_or_open_positions_hris = dt.movement_count
        //         }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
        //             reduction_in_filled_or_open_positions_orgplus = dt.movement_count
        //         }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'HRIS') {
        //             internal_movements_hris = dt.movement_count
        //         }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'ORGPLUS') {
        //             internal_movements_orgplus = dt.movement_count
        //         }
        //     })
        //
        //     number_box_pro_obj = {
        //         increase_in_filled_or_open_positions: {
        //             count: parseInt(increase_in_filled_or_open_positions_hris) + parseInt(increase_in_filled_or_open_positions_orgplus),
        //             hris: increase_in_filled_or_open_positions_hris,
        //             orgplus: increase_in_filled_or_open_positions_orgplus
        //         },
        //         reduction_in_filled_or_open_positions: {
        //             count: parseInt(reduction_in_filled_or_open_positions_hris) + parseInt(reduction_in_filled_or_open_positions_orgplus),
        //             hris: reduction_in_filled_or_open_positions_hris,
        //             orgplus: reduction_in_filled_or_open_positions_orgplus
        //         },
        //         internal_movements: {
        //             count: parseInt(internal_movements_hris) + parseInt(internal_movements_orgplus),
        //             hris: internal_movements_hris,
        //             orgplus: internal_movements_orgplus
        //         }
        //     }
        // }else {
        //     console.log(last_number_box_pro, 'last nowadays')
        //     last_number_box_pro.forEach(function(dt) {
        //         if(dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
        //             increase_in_filled_or_open_positions_hris = dt.movement_count
        //         }else if (dt.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
        //             increase_in_filled_or_open_positions_orgplus = dt.movement_count
        //         }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'HRIS') {
        //             reduction_in_filled_or_open_positions_hris = dt.movement_count
        //         }else if(dt.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'&& dt.movement_source == 'ORGPLUS') {
        //             reduction_in_filled_or_open_positions_orgplus = dt.movement_count
        //         }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'HRIS') {
        //             internal_movements_hris = dt.movement_count
        //         }else if(dt.movement_rollup == 'INTERNAL MOVEMENTS'&& dt.movement_source == 'ORGPLUS') {
        //             internal_movements_orgplus = dt.movement_count
        //         }
        //     })
        //
        //     number_box_pro_obj = {
        //         increase_in_filled_or_open_positions: {
        //             count: parseInt(increase_in_filled_or_open_positions_hris) + parseInt(increase_in_filled_or_open_positions_orgplus),
        //             hris: increase_in_filled_or_open_positions_hris,
        //             orgplus: increase_in_filled_or_open_positions_orgplus
        //         },
        //         reduction_in_filled_or_open_positions: {
        //             count: parseInt(reduction_in_filled_or_open_positions_hris) + parseInt(reduction_in_filled_or_open_positions_orgplus),
        //             hris: reduction_in_filled_or_open_positions_hris,
        //             orgplus: reduction_in_filled_or_open_positions_orgplus
        //         },
        //         internal_movements: {
        //             count: parseInt(internal_movements_hris) + parseInt(internal_movements_orgplus),
        //             hris: internal_movements_hris,
        //             orgplus: internal_movements_orgplus
        //         }
        //     }
        // }


        var reduce_movement_time_series_pro = _.sortBy(movement_time_series_pro, [function(o) {
            var tmp_arr = o.movement_date.split(' ');

            return moment().set({
                'year': tmp_arr[1],
                'month': tmp_arr[0],
                'date': tmp_arr[3]
            }).format('YYYY-MM')
        }]).reduce(function(m,n,o) {
            var tmp_arr = n.movement_date.split(' ');
            n.movement_date =  moment().set({
                'year': tmp_arr[1],
                'month': tmp_arr[0],
                'date': tmp_arr[3]
            }).format('MMMM YYYY')

            var filter_obj = _.find(m, {movement_rollup: n.movement_rollup, movement_date: n.movement_date});
            var filter_obj_index = _.findIndex(m, filter_obj);
            if(filter_obj_index > 0) {
                console.log('before - - -', filter_obj_index,' - - -',m[filter_obj_index].movement_count, ' -- -plus - - -', n.movement_count);
                m[filter_obj_index].movement_count = parseInt(m[filter_obj_index].movement_count) + parseInt(n.movement_count);
                console.log( '  - - -- ', m[filter_obj_index].movement_count)
            }else {
                m.push(n);
            }
            return m;
        }, [])
        var increase_in_filled_or_open_positions = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'
        });
        var internal_movements = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'INTERNAL MOVEMENTS'
        });
        var reduction_in_filled_or_open_positions = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'
        });

        var resDT = {
            number_box: numberget_anualized_num_box,
            movement_time_series: {
                increase_in_filled_or_open_positions: increase_in_filled_or_open_positions,
                internal_movements: internal_movements,
                reduction_in_filled_or_open_positions: reduction_in_filled_or_open_positions
            },
            movement_drill_down: movement_drill_down_pro
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/employee_transactions_compensation', async function(req, res, next) {
    var wc = whereClauseLower(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    var period = moment().format('MMMM YYYY') + ' - 1';
    var last_period = moment().subtract(1, 'months').format('MMMM YYYY') + ' - 1';

    console.log(wc, 'this is wc');
    var wc_date = _.clone(wc);
    var last_wc_date = _.clone(wc);
    var wc_orion = _.clone(wc);
    delete wc_orion.movement_date;
    if(wc.movement_date) {
        delete wc_date.movement_date;
        delete last_wc_date.movement_date;
        wc_date["Movement Date"] = wc.movement_date + ' - 1';
        last_wc_date["Movement Date"] = wc.movement_date + ' - 1';
    }else {
        // February 2018 - 1
        // var date_str = moment().format('MMMM YYYY') + ' - 1'
        wc_date["Movement Date"] = period;
        last_wc_date["Movement Date"] = last_period;
    }
    console.log(wc_date, wc);


    var promiseArr = [];
    // var number_box = models['tbl_movement_output'].findAll({
    //     attributes: [
    //         [sequelize.fn('sum', sequelize.col('total_comp')), 'total_comp'],
    //         'movement_rollup',
    //         ['Movement source', 'movement_source']
    //     ],
    //     where: wc_date,
    //     group: ['movement_rollup', 'Movement source'],
    //     raw: true
    // });
    //
    // var last_number_box = models['tbl_movement_output'].findAll({
    //     attributes: [
    //         [sequelize.fn('sum', sequelize.col('total_comp')), 'total_comp'],
    //         'movement_rollup',
    //         ['Movement source', 'movement_source']
    //     ],
    //     where: last_wc_date,
    //     group: ['movement_rollup', 'Movement source'],
    //     raw: true
    // });
    var numberget_anualized_num_box = await get_anualized_num_box(0,req,res,next);
    console.log(numberget_anualized_num_box);



    var movement_incremental_cost_or_savings_time_series = models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('total_comp')), 'total_comp'],
            'movement_rollup',
            ['Movement Date', 'movement_date']
        ],
        where: wc_orion,
        group: ['movement_rollup', "Movement Date"],
        raw: true
    });

    var movement_drill_down = models['tbl_movement_output'].findAll({
        attributes: [
            [sequelize.fn('sum', sequelize.col('total_comp')), 'total_comp'],
            'movement_rollup',
            'movement_type',
            'movement'
        ],
        where: last_compasation_date,
        group: ['movement_rollup', "movement_type","movement"],
        order: ['movement_rollup', "movement_type","movement"],
        raw: true
    });

    // promiseArr.push(number_box);
    // promiseArr.push(last_number_box);
    promiseArr.push(movement_incremental_cost_or_savings_time_series);
    promiseArr.push(movement_drill_down);
    Promise.all(promiseArr).then(function([movement_time_series_pro,movement_drill_down_pro]) {
        var reduce_movement_time_series_pro = _.sortBy(movement_time_series_pro, [function(o) {
            var tmp_arr = o.movement_date.split(' ');

            return moment().set({
                'year': tmp_arr[1],
                'month': tmp_arr[0],
                'date': tmp_arr[3]
            }).format('YYYY-MM')
        }]).reduce(function(m,n,o) {
            var tmp_arr = n.movement_date.split(' ');
            n.movement_date =  moment().set({
                'year': tmp_arr[1],
                'month': tmp_arr[0],
                'date': tmp_arr[3]
            }).format('MMMM YYYY')

            var filter_obj = _.find(m, {movement_rollup: n.movement_rollup, movement_date: n.movement_date});
            var filter_obj_index = _.findIndex(m, filter_obj);
            if(filter_obj_index > 0) {
                // console.log('before - - -', filter_obj_index,' - - -',m[filter_obj_index].movement_count, ' -- -plus - - -', n.movement_count);
                m[filter_obj_index].total_comp = parseInt(m[filter_obj_index].total_comp) + parseInt(n.total_comp);
                // console.log( '  - - -- ', m[filter_obj_index].movement_count)
            }else {
                m.push(n);
            }
            return m;
        }, [])
        var increase_in_filled_or_open_positions = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'INCREASE IN FILLED OR OPEN POSITIONS'
        });
        var internal_movements = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'INTERNAL MOVEMENTS'
        });
        var reduction_in_filled_or_open_positions = reduce_movement_time_series_pro.filter(function(o) {
            return o.movement_rollup == 'REDUCTION IN FILLED OR OPEN POSITIONS'
        });


        console.log(movement_drill_down_pro);
        var resDT = {
            number_box: numberget_anualized_num_box,
            movement_time_series: {
                increase_in_filled_or_open_positions: increase_in_filled_or_open_positions,
                internal_movements: internal_movements,
                reduction_in_filled_or_open_positions: reduction_in_filled_or_open_positions
            },
            movement_drill_down: movement_drill_down_pro
        }
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
})

router.all('/support_center_headcount_scorecard', function(req, res) {
    var wc = whereClauseLower(req);
    if(req.get('Host') && req.get('Host').indexOf('.hosting.pwc.com')>=0) {
        wc['$and'] = [
            {
                'user_access': {
                    $like: '%' + req.jwt.email + '%'
                }
            }
        ];
    }

    var promiseArr = [];
    var table = models['tbl_support_center_budgeted_div'].findAll({
        attributes: [
            [sequelize.fn('count', sequelize.col('position_status')), 'count'],
            ['position_status','position_status'],
            ['year','year'],
            ['period','period'],
            ['report_division','report_division']
        ],
        group: ['position_status','year','period','report_division'],
        order: ['report_division'],
        where: wc,
        raw: true
    });

    promiseArr.push(table);
    Promise.all(promiseArr).then(function([data]) {
        // responseHandler(res, null, data);
        var obj={};

        data.forEach(function (item) {
            if(!obj[item.report_division]){
                obj[item.report_division] ={};
            }
            if(!obj[item.report_division][item.year]){
                obj[item.report_division][item.year] ={};
            }
            if(!obj[item.report_division][item.year][item.period]){
                obj[item.report_division][item.year][item.period] ={};
                obj[item.report_division][item.year][item.period].open = 0;
                obj[item.report_division][item.year][item.period].filled = 0;
            }

            if(item.position_status == 'OPEN'){
                obj[item.report_division][item.year][item.period].open = parseInt(item.count);
            }else if(item.position_status == 'FILLED'){
                obj[item.report_division][item.year][item.period].filled = parseInt(item.count);
            }
            obj[item.report_division][item.year][item.period].total = obj[item.report_division][item.year][item.period].open+obj[item.report_division][item.year][item.period].filled;
        })

        var resDT = {
            table_data: obj,
        }
        // console.log(resDT);
        responseHandler(res, null, resDT);
    }).catch(function(error) {
        console.log("ERROR:", error);
        responseHandler(res, error);
    })
});

module.exports = router;
