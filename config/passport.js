const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    Users = require('../models/users')

passport.use(new LocalStrategy(
    function (username, password, done) {
        Users.findOne({ username: username }, function (err, user) {
            if (err) { return done(err) }
            if (!user) {
                return done(null, false, { message: 'Неверное имя пользователя.' })
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Неверный пароль.' })
            }
            return done(null, user)
        })
    }
))

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((userId, done) => {
    Users.findById((userId))
        .then((user) => {
            done(null, user)
        })
        .catch(err => done(err))
})