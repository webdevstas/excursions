const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator');
const { addCompany } = require('../controllers/companies')


router.get('/', function (req, res) {

    if (req.isAuthenticated()) {
        let username = req.user ? req.user.username : 'guest'
        res.render('companiesForm', {
            action: '/register-company',
            title: 'Форма добавления оператора',
            data: {},
            errors: {},
            success: {
                isSuccess: false,
                msg: ''
            },
            user: username
        })
    }
    else {
        res.redirect('/login')
    }
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
        let username = req.user ? req.user.username : 'guest'
        if (!errors.isEmpty()) {
            res.render('companiesForm', {
                action: '/register-company',
                title: 'Форма добавления опреатора',
                data: req.body,
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
                addCompany(req, res)
            }
            catch (err) {
                console.error(err);
            }
            res.render('companiesForm', {
                title: 'Форма добавления компании',
                action: '/register-company',
                data: {},
                errors: {},
                success: {
                    isSuccess: true,
                    msg: 'Компания успешно добавлена'
                },
                user: username
            })
        }
        return
    })

module.exports = router