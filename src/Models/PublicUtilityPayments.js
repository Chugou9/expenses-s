const mongoose = require('mongoose');

const AbstractResource = {
    data: {
        type: Number,
        required: false
    },
    actualSum: {
        type: Number,
        required: false
    },
    countedSum: {
        type: Number,
        required: false
    },
    rate: {
        type: Number,
        required: false
    }
};

// Схема для записи коммунальынх расходов за один месяц.
const publicUtilityPaymentsSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    },
    month: {
        type: Number,
        required: true,
        default: new Date().getMonth()
    },
    electricity: AbstractResource,
    gas: AbstractResource,
    water: AbstractResource,
    hus: {
        type: Number,
        required: false,
        default: 0
    },
    rent: {
        type: Number,
        required: true
    },
    sum: {
        actualSum: {
            type: Number,
            required: false
        },
        countedSum: {
            type: Number,
            required: false
        }
    }
});

module.exports = mongoose.model('PublicUtilityPaymentsSchema', publicUtilityPaymentsSchema);