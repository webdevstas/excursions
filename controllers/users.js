const {Users} = require('../models/users')

/**
 * Проверка дублей по email
 * @param {String} email
 */
async function checkUserExists(email) {
    let duplicateUser = await Users.find({email: email})
    return duplicateUser.length !== 0
}

/**
 * Сохранение нового пользователя
 * @param {Object} user Объект со всеми необходимыми полями
 */
function addUser(user) {
    return Users.create(user)
}

/**
 * Получение списка пользователей
 */
function getUsers() {
    return Users.find().select({username: 1, email: 1})
}

/**
 * Удаляет пользователя если он не последний в базе
 * @param {String} email
 */
async function deleteUser(email) {
    await Users.countDocuments((err, count) => {
        if (err) throw err
        return count
    }).then(count => {
        if (count <= 1) {
            throw new Error('Нельзя удалить последнего пользователя')
        } else {
            Users.deleteOne({email: email}, err => {
                if (err) throw err
            })
        }
    })
}

module.exports = {checkUserExists, addUser, getUsers, deleteUser}
