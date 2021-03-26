const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { genPassword } = require('../lib/passportUtils')
const { checkUserExists, addUser, getUsers, deleteUser } = require('../controllers/users')

/**
 * Список пользователей
 */
router.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        let username = req.user ? req.user.username : 'guest',
            allUsers = await getUsers()

        res.render('users', {
            user: username,
            title: 'Список пользователей',
            data: { users: allUsers }
        })
    }
    else {
        res.redirect('/login')
    }
})

/**
 * Форма регистрации
 */
router.route('/register').get((req, res) => {
    if (req.isAuthenticated()) {
        let username = req.user ? req.user.username : 'guest'
        res.render('registerForm', {
            errors: {},
            data: { body: {} },
            user: username,
            title: 'Регистрация пользователя'
        })
    }
    else {
        res.redirect('/login')
    }
})

/**
 * Получение данных из формы и сохранение нового пользователя
 */
router.route('/register').post(
    body('email').trim().escape().notEmpty().withMessage('Электронная почта обязательна для заполнения').isEmail().withMessage('Введите корректный email'),
    body('pass').trim().notEmpty().withMessage('Пароль обязателен к заполнению').isLength({ min: 6, max: 20 }).withMessage('Введите пароль длиной от 6 до 20 символов'),
    (req, res, next) => {
        if (req.isAuthenticated()) {
            const errors = validationResult(req)
            let username = req.user ? req.user.username : 'guest'
            if (!errors.isEmpty()) {
                res.render('registerForm', {
                    errors: errors.array(),
                    data: { body: req.body },
                    user: username,
                    title: 'Регистрация пользователя'
                })
            }
            else {
                let body = req.body
                checkUserExists(body.email)
                    .then(result => {
                        if (result) {
                            let error = {
                                param: 'Duplicate user',
                                msg: 'Пользователь с таким email уже существует, войдите или зарегистрируйте нового'
                            }
                            res.render('registerForm', {
                                errors: [error],
                                data: { body: {} },
                                user: username,
                                title: 'Регистрация пользователя'
                            })
                        }
                        else {
                            let passData = genPassword(body.pass)
                            let user = {
                                username: body.username,
                                email: body.email,
                                salt: passData.salt,
                                hash: passData.hash
                            }
                            addUser(user).catch(err => {
                                next(err, req, res)
                            })
                            res.redirect('/users')
                        }
                    })

            }
        }
        else {
            res.redirect('/login')
        }
    })

/**
 * Удаление пользователя
 */
router.delete('/', (req, res) => {
    if (req.isAuthenticated()) {
        deleteUser(req.body.user)
        .then(() => {
            res.json({ success: true, msg: 'Пользователь успешно удалён' })
        })
        .catch(err => {
            res.json({ success: false, msg: err.message })
        })
    }
})

module.exports = router
