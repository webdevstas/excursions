const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator')
const { addExcursion } = require('../controllers/excursions')
const { Companies } = require('../models/companies')
const { Tickets } = require('../models/tickets')
const multer = require('multer')
const mongoose = require('mongoose')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage, limits: { fileSize: 5242880 } })
const { unescapeString } = require('../lib/helpers')

let companies = {}

router.get('/', async function (req, res) {
    if (req.isAuthenticated()) {
        companies = await Companies.find().select({ shortName: 1, _id: 1 })
        let username = req.user ? req.user.username : 'guest'
        res.render('excursionsForm', {
            action: '/new-excursion',
            title: 'Форма добавления экскурсии',
            data: { body: {}, companies: companies, pictures: [] },
            errors: {},
            success: {
                isSuccess: false,
                msg: ''
            },
            user: username,
            unescapeString: unescapeString
        })
    }
    else {
        res.redirect('/login')
    }
})

router.post('/',
    upload.array('pictures'),
    body('title').trim().escape().notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
    body('description').trim().escape().notEmpty().withMessage('Описание экскурсиии обязательно к заполнению'),
    body('isApproved').toBoolean(),
    body('informationPhone').trim().escape().notEmpty().withMessage('Телефон для справок обязателен к заполнению'),
    // body('tickets').trim().escape().notEmpty().withMessage('Добавьте по крайней мере один билет'),

    async function (req, res) {
        if (req.isAuthenticated()) {
            companies = await Companies.find().select({ shortName: 1 })
            let username = req.user ? req.user.username : 'guest'
            const errors = validationResult(req)
            let arrPictures = []
            req.files.forEach(picture => {
                arrPictures.push(picture.filename)
            })
            if (!errors.isEmpty()) {
                res.render('excursionsForm', {
                    action: '/new-excursion',
                    title: 'Форма добавления экскурсии',
                    data: { body: req.body, companies: companies, pictures: arrPictures },
                    errors: errors.array(),
                    success: {
                        isSuccess: false,
                        msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                    },
                    user: username
                })
                return
            }
            else {
                try {
                    addExcursion(req, res)
                }
                catch (err) {
                    console.error(err);
                }
                res.redirect('/excursions-list')
            }
            return
        }
        else {
            res.redirect('/login')
        }
    })


module.exports = router