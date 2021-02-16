const express = require('express')
const router = express.Router()
const passport = require('passport')

router.route('/')
    .get(function (req, res) {
        let message = req.flash().error;
        res.render('loginForm', { username: '', password: '', title: 'Авторизация', msg: message})
    })

router.route('/')
    .post(
        passport.authenticate('local',
            {
                successRedirect: '/',
                failureRedirect: '/login',
                failureFlash: 'Неверное имя пользователя или пароль'
            }
        )),


        module.exports = router