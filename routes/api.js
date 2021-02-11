const express = require('express')
const passport = require('passport')
const router = express.Router()
const { Users } = require('../models/users')
const utils = require('../lib/passportUtils')
const { Excursions } = require('../models/excursions')
const { Companies } = require('../models/companies')
const cors = require('cors')

/**
 * Authentication
 */
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


/**
 * Companies
 */
router.get('/companies', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    let companies = []
    if (req.query.status === 'approved') {
        companies = await Companies.find({isApproved: true})
    }
    else if (req.query.status === 'rejected') {
        companies = await Companies.find({isApproved: false})
    }
    else {
        companies = await Companies.find()
    }
    res.json(companies)
})


router.param('id', async function (req, res, next, id) {
    req.company = await Companies.findOne({ _id: id })
    next()
})

router.get('/companies/:id', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.json(req.company)
})


/**
 * Excursions
 */
router.get('/excursions', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    let excursions
    if (req.query.company) {
        excursions = await Excursions.find({company: req.query.company})
    } 
    else if (req.query.status === 'approved') {
        excursions = await Excursions.find({isApproved: true})
    }
    else if (req.query.status === 'rejected') {
        excursions = await Excursions.find({isApproved: false})
    }
    else {
        excursions = await Excursions.find()
    }   
    res.json(excursions)
})

router.param('id', async function (req, res, next, id) {
    req.excursion = await Excursions.findOne({ _id: id })
    next()
})

router.get('/excursions/:id', cors(), passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.json(req.excursion)
})


/**
 * Exports
 */
module.exports = router