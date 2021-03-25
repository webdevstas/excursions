const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    username: String,
    hash: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    }
})

module.exports.Users = mongoose.model('Users', usersSchema)
