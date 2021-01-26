const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator');
const { addExcursion } = require('../controllers/excursions')
const { Companies } = require('../models/companies')
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/upload')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname )
    }
  })
const upload = multer({ storage: storage })

let companies = {}

router.get('/', async function (req, res) {

    companies = await Companies.find().select({ shortName: 1 })

    res.render('excursionsForm', {
        action: '/new-excursion',
        title: 'Форма добавления экскурсии',
        data: { body: {}, companies: companies },
        errors: {},
        success: {
            isSuccess: false,
            msg: ''
        }
    })
})

router.post('/',
    upload.array('pictures'),
    body('title').notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
    body('price').notEmpty().withMessage('Стоимость обязательна к заполнению').isNumeric().withMessage('Стоимость должна быть числом'),

    function (req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.render('excursionsForm', {
                action: '/new-excursion',
                title: 'Форма добавления экскурсии',
                data: { body: req.body, companies: companies },
                errors: errors.array(),
                success: {
                    isSuccess: false,
                    msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                }
            })
            return
        }
        else {

            addExcursion(req, res)

            res.render('excursionsForm', {
                title: 'Форма добавления экскурсии',
                action: '/new-excursion',
                data: { body: req.body, companies: companies },
                errors: {},
                success: {
                    isSuccess: true,
                    msg: 'Экскурсия успешно добавлена'
                }
            })
        }
        return
    })

module.exports = router