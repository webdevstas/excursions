const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { addExcursion } = require('../controllers/excursions')
const { Companies } = require('../models/companies')
const multer = require('multer')
const { unescapeString } = require('../lib/helpers')

/**
 * Создаём хранилище для загруженных изображений
 */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage, limits: { fileSize: 5242880 } })
let companies = {}

/**
 * Рендерим форму, если юзер авторизован, иначе редирект на страницу входа
 */
router.get('/', async function (req, res, next) {

    if (req.isAuthenticated()) {

        companies = await Companies.find().select({ shortName: 1, _id: 1 }).catch(err => {
            next(err, req, res)
        })

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

/**
 * POST роут для получения данных формы
 */
router.post('/',
    upload.array('pictures'), // Загружаем изображения

    /**
     * Валидация входных данных
     */
    body('title').trim().escape().notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
    body('description').trim().escape().notEmpty().withMessage('Описание экскурсиии обязательно к заполнению'),
    body('isApproved').toBoolean(),
    body('informationPhone').trim().escape().notEmpty().withMessage('Телефон для справок обязателен к заполнению').isNumeric().withMessage('Введите числовое значение номера телефона'),

    async function (req, res, next) {

        if (req.isAuthenticated()) {

            companies = await Companies.find().select({ shortName: 1 }).catch(err => {
                next(err, req, res)
            })

            let username = req.user ? req.user.username : 'guest'
            const errors = validationResult(req)
            let arrPictures = []
            req.files.forEach(picture => {
                arrPictures.push(picture.filename)
            })

            /**
             * Если есть ошибки валидации - возвращаем форму со списком ошибок
             */
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
                    user: username,
                    unescapeString: unescapeString
                })
            }
            else {
                /**
                 * Иначе сохраняем экскурсию и редирект на список
                 */
                addExcursion(req.body, req.files).catch(err => {
                    next(err, req, res)
                })
                res.redirect('/excursions-list')
            }
        }
        else {
            res.redirect('/login')
        }
    })


module.exports = router
