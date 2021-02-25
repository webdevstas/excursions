const crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    path = require('path'),
    fs = require('fs'),
    PRIV_KEY = fs.readFileSync(path.join(__dirname, '..', 'id_rsa_priv.pem'))

/**
 * Функция генерации соли и хеша из пароля
 * 
 * @param {String} password  Пароль
 * @returns {Object} {salt, hash} 
 */
function genPassword(password) {
    let salt = crypto.randomBytes(32).toString('hex')
    let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return {
        salt: salt,
        hash: genHash
    }
}

/**
 * Функция валидации пароля
 * 
 * @param {String} password
 * @param {String} hash
 * @param {String} salt
 * @returns {Boolean}
 */
function validPassword(password, hash, salt) {
    let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === hashVerify
}

/**
 * Функция валидации пароля
 * 
 * @param {Object} user
 * @returns {Object} {token, expires}
 */
function issueJWT(user) {
    const _id = user._id,
        expiresIn = '1d',
        payload = {
            sub: _id,
            iat: Date.now()
        },
        signetToken = jwt.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' })
    return {
        token: 'Bearer ' + signetToken,
        expires: expiresIn
    }
}

module.exports = { genPassword, validPassword, issueJWT }
