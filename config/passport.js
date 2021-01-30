const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    {Users} = require('../models/users')
    const validPassword = require('../lib/passportUtils').validPassword

passport.use(new LocalStrategy(
    function (username, password, done) {
        Users.findOne({ username: username }, function (err, user) {
            let isValid = validPassword(password, user.hash, user.salt)
            if (err) { return done(err) }
            if (!user) {
                return done(null, false, { message: 'Неверное имя пользователя.' })
            }
            if (!isValid) {
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