const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { updateExcursion, deleteExcursion, deletePicture, deleteTicket } = require('../controllers/excursions')
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
        let username = req.user ? req.user.username : 'guest'
        if (req.isAuthenticated()) {
            let excursions = {}
            companies = await Companies.find().select({ shortName: 1, isApproved: 1 })

            // Фильтр по наименованю компании
            if (req.query.companyFilter) {
                excursions = await Excursions.find({ company: req.query.companyFilter }).select({ title: 1, company: 1, price: 1, slug: 1, isApproved: 1 })
            } else {
                excursions = await Excursions.find().select({ title: 1, company: 1, price: 1, slug: 1, isApproved: 1, isPublished: 1 })
            }

            // Вывод
            res.render('excursionsList', {
                title: 'Список экскурсий',
                data: { excursions: excursions, companies: companies },
                user: username
            })
        }
        else {
            res.redirect('/login')
        }
    });

// Установим алиас для каждой экскурсии
router.param('slug', async function (req, res, next, slug) {
    req.excursion = await Excursions.findOne({ slug: slug }).populate('tickets')
    next()
})



// GET роут для отдачи формы редактирования экскурсии
router.route('/:slug')
    .get(async function (req, res) {
        let username = req.user ? req.user.username : 'guest'
        if (req.isAuthenticated()) {
            companies = await Companies.find().select({ shortName: 1 })
            res.render('excursionsForm', {
                action: '/excursions-list/' + req.excursion.slug,
                title: 'Редактирование экскурсии: ' + req.excursion.title,
                data: { body: req.excursion, companies: companies, selected: req.excursion.company, pictures: req.excursion.picturesURLs, tags: req.excursion.tags, tickets: req.excursion.tickets },
                success: {
                    isSuccess: false,
                    msg: ''
                },
                errors: {},
                user: username
            })
        }
        else {
            res.redirect('/login')
        }
    })

// POST роут для получения обновлённых данных с валидаторами
router.route('/:slug')
    .post(upload.array('pictures'),
        body('title').notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
        body('description').notEmpty().withMessage('Описание обязательно к заполнению').isLength({ min: 5, max: 50 }).withMessage('Количество символов должно быть от 5 до 50'),
        body('isApproved').toBoolean(),
        body('tickets').notEmpty().withMessage('Добавьте по крайней мере один билет'),

        function (req, res) {
            let username = req.user ? req.user.username : 'guest'
            if (req.isAuthenticated()) {
                const errors = validationResult(req)

                if (!errors.isEmpty()) {
                    res.render('excursionsForm', {
                        action: '/excursions-list/' + req.excursion.slug,
                        title: 'Редактирование ' + req.excursion.title,
                        data: { body: req.body, companies: companies, selected: req.excursion.company, tickets: req.excursion.tickets },
                        errors: errors.array(),
                        success: {
                            isSuccess: false,
                            msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                        },
                        user: username
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
            }
            else {
                res.redirect('/login')
            }
        })

// Удаление экскурсии
router.route('/:slug/delete')
    .post(body('delete').toBoolean(),
        function (req, res) {

            if (req.isAuthenticated()) {
                try {
                    deleteExcursion(req, res)
                }
                catch (err) {
                    console.error(err)
                }
            }
            else {
                res.redirect('/login')
            }
        })


router.route('/:slug')
    .delete(async function (req, res) {

        if (req.isAuthenticated()) {
            let result = {}

            // Удаления изображения
            if (req.body.action === 'deleteImg') {
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
            }
            if (req.body.action === 'deleteTicket') {
                try {
                    result = await deleteTicket(req.body.id)
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
            }
        }
        else {
            res.redirect('/login')
        }
    })
module.exports = router