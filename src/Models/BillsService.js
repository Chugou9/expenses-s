const mongoose = require('mongoose');

const billsServiceSchema = new mongoose.Schema({
    serviceId: {
        type: String,
        required: true,
    },
    publicUtilityPayments: {
        type: Object,
    }
});

module.exports = mongoose.model('BillsService', billsServiceSchema);