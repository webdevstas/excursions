const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { genPassword } = require('../lib/passportUtils')
const { checkUserExists, addUser } = require('../controllers/users')

router.route('/').get((req, res) => {
    if (req.isAuthenticated()) {
        let username = req.user ? req.user.username : 'guest'
        res.render('registerForm', {
            errors: {},
            data: { body: {} },
            user: username,
        })
    }
    else {
        // res.redirect('/login')
        res.end(req)
    }
})

router.route('/').post(
    body('email').trim().escape().notEmpty().withMessage('Электронная почта обязательны для заполнения').isEmail().withMessage('Введите корректный email'),
    body('pass').trim().notEmpty().withMessage('Пароль обязателен к заполнению').isLength({ min: 6, max: 12 }).withMessage('Введите пароль длиной от 6 до 12 символов'),
    (req, res, next) => {
        if (req.isAuthenticated()) {
            const errors = validationResult(req)
            let username = req.user ? req.user.username : 'guest'
            if (!errors.isEmpty()) {
                res.render('registerForm', {
                    errors: errors.array(),
                    data: { body: req.body },
                    user: username,
                })
            }
            else {
                let body = req.body

                checkUserExists(body.email)
                    .then(result => {
                        if (!result) {
                            console.log(checkUserExists(body.email));
                            let error = {
                                param: 'Duplicate user',
                                msg: 'Пользователь с таким email уже существует, войдите или зарегистрируйте нового'
                            }
                            res.render('registerForm', {
                                errors: [error],
                                data: { body: {} },
                                user: username,
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
                            addUser(user)
                            res.redirect('/')
                        }
                    })

            }
        }
        else {
            res.redirect('/login')
        }
    })


module.exports = router