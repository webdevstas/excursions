const express = require('express')
const router = express.Router()
const { Companies } = require('../models/companies')
const { body, validationResult, check } = require('express-validator');
const { tr, slugify } = require('transliteration')


router.get('/', function (req, res) {

    res.render('form', {
        action: '/form',
        title: 'Форма добавления компании',
        data: {},
        errors: {},
        success: {
            isSuccess: false,
            msg: ''
        }
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
    check('inn').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение ИНН'),
    check('ogrn').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение ОГРН'),
    check('kpp').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение КПП'),
    body('okved').trim().escape(),
    body('registrationInformation').trim().escape(),
    body('bankInformation').trim().escape(),
    body('isApproved').toBoolean(),

    function (req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.render('form', {
                action: '/form',
                title: 'Форма добавления компании',
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

            addData(req, res)
        }
        return
    })
async function addData(req, res) {
    let company = req.body
    await Companies.countDocuments({ shortName: company.shortName }, (err, count) => {
        if (err) console.log(err)

        if (count > 0) {
            company.slug = slugify(company.shortName + '-' + count)
        }
        else {
            company.slug = slugify(company.shortName)
        }
    })

    await Companies.create(company, function (err) {
        if (err) return console.error(err)
        res.render('form', {
            action: '/form',
            data: {},
            errors: {},
            success: {
                isSuccess: true,
                msg: 'Компания успешно добавлена'
            }
        })
    })
}
module.exports = router