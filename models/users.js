const mongoose = require('mongoose')

const usersSchema = new mongoose.Schema({
    username: String,
    hash: String, 
    salt: String
})

module.exports.Users = mongoose.model('Users', usersSchema)