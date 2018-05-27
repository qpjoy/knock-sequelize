const models = require('../index');
const sequelize = models.sequelize;
const Sequelize = models.Sequelize;
const Payment = sequelize.define('payment');
const Payments = sequelize.define('sub_payment', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'group_id',
        references: {
            model: Payment,
            key: 'id'
        }
    }
});

Payment.hasMany(Payments, { foreignKey: 'groupId' });
Payments.hasMany(Payments, { foreignKey: 'groupId', sourceKey: 'groupId', as: 'relatedPayments' });

sequelize.sync({ force: true}).then(() => {
    return Payment.bulkCreate([
        {},
        {}
    ]);
}).then(() => {
    return Payments.bulkCreate([
        { groupId: 1 },
        { groupId: 2 },
        { groupId: 1 },
        { groupId: 2 }
    ]);
}).then(() => {
    return Payments.findAll({
        include: [
            {
                model: Payments,
                as: 'relatedPayments'
            }
        ]
    });
}).then(payments => {
    console.log(payments[0].toJSON());
    console.log(payments[1].toJSON());
}).catch(e => {
    console.error(e);
});