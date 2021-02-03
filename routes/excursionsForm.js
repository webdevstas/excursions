const express = require('express')
const router = express.Router()
const { body, validationResult, check } = require('express-validator');
const { addExcursion } = require('../controllers/excursions')
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
const upload = multer({ storage: storage, limits: {fileSize: 5242880} })

let companies = {}

router.get('/', async function (req, res) {
    if (req.isAuthenticated()) {
        companies = await Companies.find().select({ shortName: 1 })
        let username = req.user ? req.user.username : 'guest'
        res.render('excursionsForm', {
            action: '/new-excursion',
            title: 'Форма добавления экскурсии',
            data: { body: {}, companies: companies, pictures: [] },
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
    upload.array('pictures'),
    body('title').notEmpty().withMessage('Название экскурсии обязательно к заполнению'),
    body('price').notEmpty().withMessage('Стоимость обязательна к заполнению').isNumeric().withMessage('Стоимость должна быть числом'),
    body('isApproved').toBoolean(),
    
    function (req, res) {
        if (req.isAuthenticated()) {
            let username = req.user ? req.user.username : 'guest'
            const errors = validationResult(req)
            let arrPictures = []
            req.files.forEach(picture => {
                arrPictures.push(picture.filename)
            })
            if (!errors.isEmpty()) {
                res.render('excursionsForm', {
                    action: '/new-excursion',
                    title: 'Форма добавления экскурсии',
                    data: { body: req.body, companies: companies, pictures: arrPictures },
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
                    addExcursion(req, res)
                }
                catch (err) {
                    console.error(err);
                }
    
                res.render('excursionsForm', {
                    title: 'Форма добавления экскурсии',
                    action: '/new-excursion',
                    data: { body: {}, companies: companies, pictures: [] },
                    errors: {},
                    success: {
                        isSuccess: true,
                        msg: 'Экскурсия успешно добавлена'
                    },
                    user: username
                })
            }
            return
        }
        else {
            res.redirect('/login')
        }

    })

module.exports = router