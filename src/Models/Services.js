const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    servicesIds: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('Services', servicesSchema);