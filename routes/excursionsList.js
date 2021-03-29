const express = require('express')
const router = express.Router()
const {body, validationResult} = require('express-validator')
const {updateExcursion, deleteExcursion, deletePicture, deleteTicket} = require('../controllers/excursions')
const {Excursions} = require('../models/excursions')
const {Companies} = require('../models/companies')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/upload')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({storage: storage})
const {unescapeString} = require('../lib/helpers')


let companies = {}

/**
 * GET роут для вывода списка экскурсий с проверкой авторизации пользователя
 */
router.get('/',
    async function (req, res, next) {
        let username = req.user ? req.user.username : 'guest'
        if (req.isAuthenticated()) {
            companies = await Companies.find().select({shortName: 1}).catch(err => {
                next(err, req, res)
            })
            let excursionsList = await Excursions.find().select({title: 1}).catch(err => {
                    next(err, req, res)
                }),
                filteredExcursionsList = [],
                excursions = await Excursions.find().select({
                    title: 1,
                    slug: 1,
                    company: 1,
                    isApproved: 1,
                    isPublished: 1
                }).sort({title: 'asc'}).populate('company').catch(err => {
                    next(err, req, res)
                })
            excursionsList.forEach(item => {
                if (!filteredExcursionsList.includes(item.title, 0)) {
                    filteredExcursionsList.push(item.title)
                }
            })
            // Рендер списка
            res.render('excursionsList', {
                title: 'Список экскурсий',
                data: {companies, excursionsFilterList: filteredExcursionsList, excursions: excursions},
                user: username,
                unescapeString: unescapeString
            })
        } else {
            res.redirect('/login')
        }
    });

/**
 * Роут для фильтрации по оператору и/или названию экскурсии.
 * Запрос с фронта приходит асинхронно методом fetch()
 * В ответ отправляем json с данными
 */
router.get('/filter', async function (req, res, next) {
    if (req.isAuthenticated()) {
        let excursions = {}

        if (req.query.companyFilter || req.query.excursionFilter) {
            let match = {} // В этот объект собираем строки из полей фильтров

            if (req.query.companyFilter) {
                match.company = req.query.companyFilter
            }

            if (req.query.excursionFilter) {
                match.title = req.query.excursionFilter
            }

            excursions = await Excursions.find(match).select({
                title: 1,
                company: 1,
                slug: 1,
                isApproved: 1,
                isPublished: 1
            }).sort({title: 'asc'}).populate({path: 'company', select: {_id: 1, shortName: 1}}).catch(err => {
                next(err, req, res)
            })

            res.status(200).json(excursions)

        } else {
            excursions = await Excursions.find().select({
                title: 1,
                company: 1,
                slug: 1,
                isApproved: 1,
                isPublished: 1
            }).sort({title: 'asc'}).populate({path: 'company', select: {_id: 1, shortName: 1}}).catch(err => {
                next(err, req, res)
            })
            res.status(200).json(excursions)
        }
    }
})

/**
 * Получаем алиас экскурсии, ищем в БД и сохраняем результат в объект запроса req
 */
router.param('slug', async function (req, res, next, slug) {
    req.excursion = await Excursions.findOne({slug: slug}).populate('tickets').populate('company').catch(err => {
        next(err, req, res)
    })
    next()
})

/**
 * GET роут для вывода формы редактирования экскурсии
 */
router.route('/:slug')
    .get(async function (req, res, next) {

        let username = req.user ? req.user.username : 'guest'

        if (req.isAuthenticated()) {
            companies = await Companies.find().select({shortName: 1}).catch(err => {
                next(err, req, res)
            })

            res.render('excursionsForm', {
                action: '/excursions-list/' + req.excursion.slug,
                title: 'Редактирование экскурсии: ' + req.excursion.title,
                data: {
                    body: req.excursion,
                    companies: companies,
                    selected: req.excursion.company ? req.excursion.company.shortName : null,
                    pictures: req.excursion.picturesURLs,
                    tags: req.excursion.tags,
                    tickets: req.excursion.tickets,
                    hasTickets: req.excursion.hasTickets,
                },
                unescapeString: unescapeString,
                success: {
                    isSuccess: false,
                    msg: ''
                },
                errors: {},
                user: username
            })
        } else {
            res.redirect('/login')
        }
    })

/**
 * Получаем отредактированные данные, валидируем, сохраняем
 */
router.route('/:slug')
    .post(upload.array('pictures'),
        body('title').trim().escape().notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
        body('description').trim().escape().notEmpty().withMessage('Описание обязательно к заполнению'),
        body('isApproved').toBoolean(),
        body('informationPhone').trim().escape().notEmpty().withMessage('Телефон для справок обязателен к заполнению').isNumeric().withMessage('Введите числовое значение номера телефона'),

        async function (req, res, next) {

            let username = req.user ? req.user.username : 'guest'

            if (req.isAuthenticated()) {
                const errors = validationResult(req)

                if (!errors.isEmpty()) {
                    res.render('excursionsForm', {
                        action: '/excursions-list/' + req.excursion.slug,
                        title: 'Редактирование ' + req.excursion.title,
                        data: {
                            body: req.body,
                            companies: companies,
                            selected: req.excursion.company,
                            tickets: req.excursion.tickets,
                            tags: req.excursion.tags
                        },
                        errors: errors.array(),
                        success: {
                            isSuccess: false,
                            msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
                        },
                        user: username
                    })
                } else {
                    await updateExcursion(req.body, req.excursion, req.files).catch(err => {
                        next(err, req, res)
                    })
                    res.redirect('/excursions-list')
                }
            } else {
                res.redirect('/login')
            }
        })

/**
 * Удаление экскурсии
 */
router.route('/:slug/delete')
    .post(async function (req, res, next) {

        if (req.isAuthenticated()) {
            let resulst = await deleteExcursion(req.excursion._id).catch(err => {
                next(err, req, res)
            })
        } else {
            res.redirect('/login')
        }
    })


router.route('/:slug')
    .delete(async function (req, res, next) {

        if (req.isAuthenticated()) {
            let result = {}

            // Удаления изображения
            if (req.body.action === 'deleteImg') {
                result = await deletePicture(req.body.index, req.excursion.slug).catch(err => {
                    next(err, req, res)
                })

                if (result.success) {
                    res.status(200).json({success: true, error: {}})
                } else {
                    res.status(200).json({success: false, error: result.error})
                }
            }

            // Удаление билета
            if (req.body.action === 'deleteTicket') {
                result = await deleteTicket(req.body.id).catch(err => {
                    next(err, req, res)
                })

                if (result.success) {
                    res.status(200).json({success: true, error: {}})
                } else {
                    res.status(200).json({success: false, error: result.error})
                }
            }
        } else {
            res.redirect('/login')
        }
    })
module.exports = router
