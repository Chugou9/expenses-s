const mongoose = require('mongoose');

// Схема для авторизации
const AuthSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('AuthSchema', AuthSchema);