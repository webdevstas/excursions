const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator');
const { addExcursion } = require('../controllers/excursions')
const {Companies} = require('../models/companies')

router.get('/', async function (req, res) {

    const companies = await Companies.find().select({shortName: 1})

    res.render('excursionsForm', {
        action: '/new-excursion',
        title: 'Форма добавления экскурсии',
        data: {companies: companies},
        errors: {},
        success: {
            isSuccess: false,
            msg: ''
        }
    })
})

router.post('/',

    body('title').notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
    body('price').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Стоимость должна быть числом'),

    function (req, res) {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.render('excursionsForm', {
                action: '/new-excursion',
                title: 'Форма добавления экскурсии',
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
            addExcursion(req, res)
        }
        return
    })

module.exports = router