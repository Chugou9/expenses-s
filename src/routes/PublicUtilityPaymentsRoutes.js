const express = require('express');
const router = express.Router();
const PublicUtilityPayments = require('../Models/PublicUtilityPayments');

/**
 * Добавление новых данных по коммунальным платежам.
 */
router.post('/', async (req, res) => {
    const {rent, hus, gas, electricity} = req.body;
    const electricityActualSum = electricity.actualSum;
    const gasActualSum = gas.actualSum;
    const electricityCountedSum = electricity ? electricity.data : 0;
    const gasCountedSum = gas ? gas.data : 0;

    const newPublicUtilityPayments = new PublicUtilityPayments({
        ...req.body,
        sum: {
            actualSum: rent + ((hus + gasActualSum + electricityActualSum)* 1.01),
            countedSum: rent + ((hus + gasCountedSum + electricityCountedSum)* 1.01)
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
        console.log('year', year);
        const publicUtilityPayments = await PublicUtilityPayments.find({year});

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
        
        await res.publicUtilityPayment.remove();
        
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
        const previousPayment = res.previousPublicUtilityPayment;

        for (var key in req.body) {
            if (req.body[key]) {
                res.publicUtilityPayment[key] = req.body[key];
            }
        }

        const {rent, hus, gas, electricity, year} = res.publicUtilityPayment;
        const electricityActualSum = electricity.actualSum ? +electricity.actualSum : 0;
        const gasActualSum = gas.actualSum ? +gas.actualSum : 0;
        let electricityCountedSum = 0;
        let gasCountedSum = 0;

        if (previousPayment) {
            const {electricity:lastElectricity, gas:lastGas} = previousPayment;

            electricityCountedSum = electricity.data && lastElectricity.data ? Math.round(((+electricity.data - +lastElectricity.data) * +electricity.rate) * 100) / 100 : 0;
            gasCountedSum = gas.data && lastGas.data ? Math.round(((gas.data - lastGas.data) * gas.rate) * 100) / 100 : 0;
        }

        res.publicUtilityPayment.sum = {
            ...res.publicUtilityPayment.sum,
            actualSum: Math.round((rent + (hus + gasActualSum + electricityActualSum) * 1.01) * 100) / 100
        };
        const nextMonth = res.publicUtilityPayment.month === 11 ? 0 : res.publicUtilityPayment.month + 1;

        const nextPaymentFull = await PublicUtilityPayments.findOne({month: nextMonth});
        const nextPayment = await PublicUtilityPayments.findOneAndUpdate(
            {month: nextMonth},
            {
                month: nextMonth,
                gas: {
                    actualSum: nextPaymentFull && nextPaymentFull.gas.actualSum ? nextPaymentFull.gas.actualSum : 0,
                    countedSum: gasCountedSum,
                    rate: gas.rate,
                    data: nextPaymentFull && nextPaymentFull.gas.data ? nextPaymentFull.gas.data : 0,
                },
                electricity: {
                    actualSum: nextPaymentFull && nextPaymentFull.electricity.actualSum ? nextPaymentFull.electricity.actualSum : 0,
                    countedSum: electricityCountedSum,
                    rate: electricity.rate,
                    data: nextPaymentFull && nextPaymentFull.electricity.data ? nextPaymentFull.electricity.data : 0,
                },
                sum: {
                    countedSum: Math.round((rent + (hus + gasCountedSum + electricityCountedSum) * 1.01) * 100) / 100
                },
                rent,
                year: nextPaymentFull?.year ? nexPaymentFull.year : nextMonth === 0 ? year + 1 : year 
            },
            {upsert: true}
        );
        nextPayment.save();

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
        const previousPublicUtilityPayment = await PublicUtilityPayments.findOne({month: publicUtilityPayment.month - 1});
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

module.exports = router;