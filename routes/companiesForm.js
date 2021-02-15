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

    body('fullName').trim(),
    body('shortName').trim().notEmpty().withMessage('Краткое наименование компании обязательно к заполнению'),
    body('formOfOwnership').trim(),
    body('kindOfActivity').trim(),
    body('legalAddress').trim(),
    body('actualAddress').trim(),
    body('head').trim(),
    body('phoneNumber').trim(),
    body('faxNumber').trim(),
    body('email').trim().notEmpty().withMessage('Электронная почта обязательна к заполнению').isEmail().withMessage('Введите корректный email'),
    check('inn').notEmpty().withMessage('Инн обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение ИНН'),
    check('ogrn').notEmpty().withMessage('ОГРН обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение ОГРН'),
    check('kpp').notEmpty().withMessage('КПП обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение КПП'),
    body('okved').trim(),
    body('registrationInformation').trim(),
    body('bankInformation').trim(),
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

            res.redirect('/companies-list')

            // res.render('companiesForm', {
            //     title: 'Форма добавления компании',
            //     action: '/register-company',
            //     data: {},
            //     errors: {},
            //     success: {
            //         isSuccess: true,
            //         msg: 'Компания успешно добавлена'
            //     },
            //     user: username
            // })
        }
        return
    })

module.exports = router