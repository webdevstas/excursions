const { Users } = require('../models/users')

async function checkUserExists(email) {
    let duplicateUser = await Users.find({ email: email })
    return duplicateUser.length === 0
}

async function addUser(user) {
    
}

module.exports = {checkUserExists, addUser}