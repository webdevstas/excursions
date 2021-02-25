const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const { render } = require('jade');
const { updateCompany, deleteCompany } = require('../controllers/companies')
const { Companies } = require('../models/companies')
const { unescapeString } = require('../lib/helpers')

/**  
 * Ответ на запрос списка компаний 
 */
router.get('/', async function (req, res) {
    if (req.isAuthenticated()) {
        let username = req.user ? req.user.username : 'guest'
        const companies = await Companies.find().select({ shortName: 1, slug: 1, isApproved: 1 })
        res.render('companiesList', { title: 'Список операторов', companies: companies, user: username, unescapeString: unescapeString });
    }
    else {
        res.redirect('/login')
    }
});

/** 
* Получим алиас компании
*/
router.param('slug', async function (req, res, next, slug) {
    req.company = await Companies.findOne({ slug: slug }) // Сохраняем компанию в объект запроса
    next()
})

/**
 * GET роут для отдачи формы редактирования компании
 */
router.route('/:slug')
    .get(
        function (req, res) {
            if (req.isAuthenticated()) {
                let username = req.user ? req.user.username : 'guest'
                res.render('companiesForm', {
                    action: '/companies-list/' + req.company.slug,
                    title: 'Редактирование оператора: ' + req.company.shortName, data: req.company, success: {
                        isSuccess: false,
                        msg: ''
                    },
                    errors: {},
                    user: username,
                    unescapeString: unescapeString
                })
            }
        })

/**
 * POST роут для получения обновлённых данных с валидаторами
 */
router.route('/:slug')
    .post(
        /**
         * Валидация полученных данных
         */
        body('fullName').trim().escape(),
        body('shortName').trim().escape().notEmpty().withMessage('Краткое наименование компании обязательно к заполнению'),
        body('formOfOwnership').trim().escape(),
        body('kindOfActivity').trim().escape(),
        body('legalAddress').trim().escape(),
        body('actualAddress').trim().escape(),
        body('head').trim().escape(),
        body('phoneNumber').trim().escape().optional({ nullabale: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение номера телефона'),
        body('faxNumber').trim().escape().optional({ nullabale: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение номера факса'),
        body('email').trim().escape().notEmpty().withMessage('Электронная почта обязательна к заполнению').isEmail().withMessage('Введите корректный email'),
        check('inn').escape().notEmpty().withMessage('Инн обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение ИНН'),
        check('ogrn').escape().notEmpty().withMessage('ОГРН обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение ОГРН'),
        check('kpp').escape().notEmpty().withMessage('КПП обязятелен к заполнению').isNumeric().withMessage('Введите числовое значение КПП'),
        body('okved').trim().escape(),
        body('registrationInformation').trim().escape(),
        body('bankInformation').trim().escape(),
        body('isApproved').toBoolean(),

        function (req, res) {
            if (req.isAuthenticated()) {
                const errors = validationResult(req)

                /**
                * Если есть ошибки валидации - рендерим форму с указанием ошибок
                */
                if (!errors.isEmpty()) {
                    let username = req.user ? req.user.username : 'guest'
                    res.render('companiesForm', {
                        action: '/companies-list/' + req.company.slug,
                        title: 'Редактирование оператора: ' + req.company.shortName,
                        data: req.body,
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
                    *  Иначе сохраняем компанию и редирект на список
                    */
                    updateCompany(req, res).catch(err => {
                        console.log('Update company error: ', err);
                    })
                }
            }
        })

/**
 * Удаление компании
 */
router.route('/:slug/delete')
    .post(body('delete').toBoolean(),
        function (req, res) {
            if (req.isAuthenticated()) {
                deleteCompany(req, res).catch(err => {
                    console.log('Delete company error: ', err);
                })
            }
        })


module.exports = router;