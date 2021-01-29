const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator')
const { updateExcursion, deleteExcursion, deletePicture } = require('../controllers/excursions')
const { Excursions } = require('../models/excursions')
const { Companies } = require('../models/companies')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage: storage })


let companies = {}

// Ответ на запрос списка экскурсий
router.get('/',
    async function (req, res) {
        let excursions = {}
        companies = await Companies.find().select({ shortName: 1 })
        if (req.query.companyFilter) {
            excursions = await Excursions.find({ company: req.query.companyFilter }).select({ title: 1, slug: 1, company: 1, price: 1 })
        } else {
            excursions = await Excursions.find().select({ title: 1, slug: 1, company: 1, price: 1 })
        }

        res.render('excursionsList', {
            title: 'Список экскурсий',
            data: { excursions: excursions, companies: companies }
        })

    });

// Установим алиас для каждой экскурсии
router.param('slug', async function (req, res, next, slug) {
    req.excursion = await Excursions.findOne({ slug: slug })
    next()
})



// GET роут для отдачи формы редактирования экскурсии
router.route('/:slug')
    .get(async function (req, res) {
        companies = await Companies.find().select({ shortName: 1 })
        res.render('excursionsForm', {
            action: '/excursions-list/' + req.excursion.slug,
            title: 'Редактирование экскурсии: ' + req.excursion.title,
            data: { body: req.excursion, companies: companies, selected: req.excursion.company, pictures: req.excursion.picturesURLs },
            success: {
                isSuccess: false,
                msg: ''
            }, errors: {}
        })
    })

// POST роут для получения обновлённых данных с валидаторами
router.route('/:slug')
    .post(upload.array('pictures'),
        body('title').notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
        body('price').notEmpty().withMessage('Стоимость обязательна к заполнению').isNumeric().withMessage('Стоимость должна быть числом'),

        function (req, res) {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                console.log(req);
                res.render('excursionsForm', {
                    action: '/excursions-list/' + req.excursion.slug,
                    title: 'Редактирование ' + req.excursion.title,
                    data: { body: req.body, companies: companies, selected: req.excursion.company },
                    errors: errors.array(),
                    success: {
                        isSuccess: false,
                        msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                    }
                })
            }
            else {
                try {
                    updateExcursion(req, res)
                }
                catch (err) {
                    console.error(err)
                }
                res.redirect('/excursions-list')
            }
        })

// Удаление экскурсии
router.route('/:slug/delete')
    .post(body('delete').toBoolean(),
        function (req, res) {
            try {
                deleteExcursion(req, res)
            }
            catch (err) {
                console.error(err)
            }
        })


// Удаления изображения
router.route('/:slug')
    .delete(async function (req, res) {
        let result = {}

        try {
            result = await deletePicture(req.body.index, req.excursion.slug)
        }
        catch (err) {
            console.error(err)
        }
        
        if (result.success) {
            res.status(200).json({ success: true, error: {} })
        }
        else {
            res.status(200).json({ success: false, error: result.error })
        }
    })
module.exports = router