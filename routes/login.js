const express = require('express')
const router = express.Router()
const passport = require('passport')

router.route('/')
    .get(function (req, res) {
        res.render('loginForm', {username: '', password: '', title: 'Авторизация'})
    })

router.route('/')
    .post(passport.authenticate('local', {
        successRedirect: '/companies-list',
        failureRedirect: '/',
    }))


module.exports = router