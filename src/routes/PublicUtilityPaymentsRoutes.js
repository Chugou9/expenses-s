const express = require('express');
const router = express.Router();
const PublicUtilityPayments = require('../Models/PublicUtilityPayments');
const isEmpty = require('lodash.isempty');
const isVerified = require('./VerifyToken');

/**
 * Добавление новых данных по коммунальным платежам.
 */
router.post('/', isVerified,  async (req, res) => {
    const {rent, hus, gas, electricity, water} = req.body;
    const electricityActualSum = electricity.actualSum;
    const gasActualSum = gas.actualSum;
    const waterActualSum = water.actualSum;

    const waterCountedSum = water?.data ?? 0;
    const electricityCountedSum = electricity?.data ?? 0;
    const gasCountedSum = gas?.data ?? 0;

    const newPublicUtilityPayments = new PublicUtilityPayments({
        ...req.body,
        sum: {
            actualSum: rent + ((hus + gasActualSum + electricityActualSum + waterActualSum)* 1.01),
            countedSum: rent + ((hus + gasCountedSum + electricityCountedSum + waterCountedSum)* 1.01)
        }
    });

    console.log(req.body);
    try {
        const PublicUtilityPayments = await newPublicUtilityPayments.save();
        res.status(201).json({data: PublicUtilityPayments});
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

/**
 * Получение всех записей коммунальных платежей.
 */
router.get('/', async (req, res) => {
    try {
        const {year, month} = req.query;
        const publicUtilityPayments = await PublicUtilityPayments.find({year});
        console.log('All payments for year', publicUtilityPayments);

        res.json(publicUtilityPayments);
    } catch (err) {
        res.status(500).json({message: err.message})
    }
});

/**
 * Получение данных выбранного месяца.
 */
router.get('/:id', getPublicUtilityPayment, (req, res) => {
    res.json(res.publicUtilityPayment);
});

/**
 * Удаление записи коммунальных платежей.
 */
router.delete('/:id', getPublicUtilityPayment, async (request, res) => {
    try {
        const {month, year} = res.publicUtilityPayment;
        
        await res.publicUtilityPayment.deleteOne();
        
        res.json({message: `Коммунальные платежи за ${month} ${year} года удалены.`})
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

/**
 * Обновление данных выбранного месяца.
 */
router.put('/:id', getPublicUtilityPayment, async (req, res) => {
    try {
        const [previousPayment] = res.previousPublicUtilityPayment;

        for (var key in req.body) {
            if (req.body[key]) {
                res.publicUtilityPayment[key] = req.body[key];
            }
        }

        const {rent, hus = previousPayment.hus, gas, electricity, year, water} = res.publicUtilityPayment;
        console.log('current', rent, hus, gas, electricity, water, year);
        console.log('previous', previousPayment);
        const electricityActualSum = +electricity?.actualSum || 0;
        const gasActualSum = +gas?.actualSum || 0;
        const waterActualSum = +water?.actualSum || 0;
        let electricityCountedSum = 0;
        let gasCountedSum = 0;
        let waterCountedSum = 0;

        if (previousPayment) {
            electricityCountedSum = getResourceCountedSum(electricity, previousPayment?.electricity);
            gasCountedSum = getResourceCountedSum(gas, previousPayment?.gas);
            waterCountedSum = getResourceCountedSum(water, previousPayment?.water);
        }
        console.log('*** ----------------------------------------------------------------------------------------------- ***');
        res.publicUtilityPayment.sum = {
            ...res.publicUtilityPayment.sum,
            actualSum: Math.round((rent + (hus + gasActualSum + electricityActualSum + waterActualSum) * 1.01) * 100) / 100
        };
        const nextMonth = getNextMonthValue(res.publicUtilityPayment);
        const [nextPaymentFull] = await getFullNextPayment(year, nextMonth);
        console.log('next', nextPaymentFull);
        const nextYear = getNextYear(nextPaymentFull, nextMonth, year);

        const query = {month: {'$eq': nextMonth}, year: {'$eq': nextYear}};
        const updatedNextPayment = {
            month: nextMonth,
            gas: getNextMontResourceData(nextPaymentFull?.gas, gasCountedSum, gas.rate),
            electricity: getNextMontResourceData(nextPaymentFull?.electricity, electricityCountedSum, electricity.rate),
            water: getNextMontResourceData(nextPaymentFull?.water, waterCountedSum, water.rate),
            sum: {
                countedSum: Math.round((rent + (hus + gasCountedSum + electricityCountedSum + waterCountedSum) * 1.01) * 100) / 100
            },
            rent,
            year: nextYear,
            hus,
        };
        console.log('nextpayment', updatedNextPayment);
        const nextPayment = await PublicUtilityPayments.findOneAndUpdate(
            query,
            {
                '$set': updatedNextPayment
            },
            {upsert: true}
        );

        nextPayment && nextPayment.save();

        const updatedPublicUtilityPayment = await res.publicUtilityPayment.save();
        res.json(updatedPublicUtilityPayment);
    } catch (err) {
        res.status(400).json({message: err.message})
    }
});

/**
 * Функция получения коммунального платежа при его наличии из базы.
 *
 * @param {*} request Запрос.
 * @param {*} response Ответ.
 * @param {*} next Следующая функция.
 */
async function getPublicUtilityPayment(request, response, next) {
    try {
        const publicUtilityPayment = await PublicUtilityPayments.findById(request.params.id);
        const query = {
            month: publicUtilityPayment.month === 0 ? 11 : publicUtilityPayment.month - 1,
            year: publicUtilityPayment.month === 0 ? publicUtilityPayment.year - 1 : publicUtilityPayment.year
        };
        const previousPublicUtilityPayment = await PublicUtilityPayments.find(query);
        console.log('previous ' + previousPublicUtilityPayment);

        if (!publicUtilityPayment) {
            return response.status(404).json({message: "Can't find publicUtilityPayment"});
        }

        response.publicUtilityPayment = publicUtilityPayment;
        response.previousPublicUtilityPayment = previousPublicUtilityPayment ? previousPublicUtilityPayment : null;

        next();
    } catch (err) {
        return response.status(500).json({message: err.message});
    }
}

function getResourceCountedSum(currentResource, previousMonthData) {
    console.log('current data', currentResource?.data);
    console.log('previous data', previousMonthData?.data);
    console.log('current rate', currentResource?.rate);

    return currentResource?.data && previousMonthData?.data && currentResource?.rate
        ? Math.round(((currentResource.data - previousMonthData.data) * currentResource.rate) * 100) / 100
        : 0;
}

function getNextMonthValue(publicUtilityPayment) {
    return publicUtilityPayment.month == 11 ? 0 : publicUtilityPayment.month + 1;
}

async function getFullNextPayment(year, nextMonth) {
    try {
        return await PublicUtilityPayments.find({year: {'$eq': nextMonth == 0 ? year + 1 : year}, month: {'$eq': nextMonth}});
    } catch(error) {
        console.error('[*** Error ***] Не удалось найти платеж следующего месяца', year, nextMonth);
    }
}
function getNextYear(nextPaymentFull, nextMonth, year) {
    return !isEmpty(nextPaymentFull?.year)
        ? nexPaymentFull.year
        : nextMonth == 0
            ? year + 1
            : year;
}

function getNextMontResourceData(resource, countedSum, rate) {
    return {
        actualSum: resource?.actualSum ?? 0,
        countedSum,
        rate: rate ?? 0,
        data: resource?.data ?? 0,
    };
}

module.exports = router;