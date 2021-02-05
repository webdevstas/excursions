const express = require('express')
const passport = require('passport')
const router = express.Router()
const { Users } = require('../models/users')
const utils = require('../lib/passportUtils')
const { Excursions } = require('../models/excursions')
const { Companies } = require('../models/companies')
const cors = require('cors')

router.post('/auth', cors(), (req, res) => {
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

router.get('/excursions', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    let excursions = await Excursions.find()
    res.json(excursions)
})

router.param('id', async function (req, res, next, id) {
    req.excursion = await Excursions.findOne({ _id: id })
    next()
})

router.get('/excursions/:id', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.json(req.excursion)
})

module.exports = router