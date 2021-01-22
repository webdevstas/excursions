const express = require('express')
const router = express.Router()
const { Companies } = require('../models/companies')
const { body, validationResult } = require('express-validator');



router.get('/', function (req, res, next) {

    res.render('form', {
        data: {},
        errors: {},
        success: {}
    })
})

router.post('/',

    body('fullName').trim().escape(),
    body('shortName').trim().escape().notEmpty().withMessage('Краткое наименование компании обязательно к заполнению'),
    body('formOfOwnership').trim().escape(),
    body('kindOfActivity').trim().escape(),
    body('legalAddress').trim().escape(),
    body('actualAddress').trim().escape(),
    body('head').trim().escape(),
    body('phoneNumber').trim().escape(),
    body('faxNumber').trim().escape(),
    body('email').trim().escape(),
    body('inn').trim().escape().toInt(),
    body('ogrn').trim().escape().toInt(),
    body('kpp').trim().escape().toInt(),
    body('okved').trim().escape(),
    body('registrationInformation').trim().escape(),
    body('bankInformation').trim().escape(),

    function (req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.render('form', {
                data: req.body,
                errors: errors.array(),
                success: {
                    isSuccess: false,
                    msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                }
            })
            return
        }
        else {
            Companies.create(req.body, function (err) {
                if (err) return console.error(err)
                res.render('form', {
                    data: {},
                    errors: {},
                    success: {
                        isSuccess: true,
                        msg: 'Компания успешно добавлена'
                    }
                })
            })
        }
        return
    })

module.exports = router