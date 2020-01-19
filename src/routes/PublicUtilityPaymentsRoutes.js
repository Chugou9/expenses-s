const express = require('express');
const router = express.Router();
const PublicUtilityPayments = require('../Models/PublicUtilityPayments');

router.post('/', async (req, res) => {
    const newPublicUtilityPayments = new PublicUtilityPayments({...req.body});

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
        const {year, month} = req.body;
        const publicUtilityPayments = await PublicUtilityPayments.find();

        res.json(publicUtilityPayments);
    } catch (err) {
        res.status(500).json({message})
    }
});

module.exports = router;