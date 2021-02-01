const express = require('express')
const passport = require('passport')
const router = express.Router()
const { Users } = require('../models/users')
const utils = require('../lib/passportUtils')
const { Excursions } = require('../models/excursions')
const { Companies } = require('../models/companies')

router.post('/auth', (req, res) => {
    Users.findOne({ username: req.body.username })
        .then(user => {
            if (!user) {
                res.status(401).json({ success: false, msg: 'Пользователь не найден' })
            }

            const isValid = utils.validPassword(req.body.password, user.hash, user.salt)

            if (isValid) {
                const tokenObject = utils.issueJWT(user)

                res.status(200).json({ success: true, token: tokenObject.token, expires: tokenObject.expires })
            }
            else {
                res.status(401).json({ success: false, msg: 'Неверный пароль' })
            }
        })

})

router.get('/excursions', passport.authenticate('jwt', { session: false }), async (req, res) => {
    let exc = await Excursions.find()
    res.json(exc)
})

module.exports = router