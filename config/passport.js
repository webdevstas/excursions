const passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt,
    { Users } = require('../models/users'),
    validPassword = require('../lib/passportUtils').validPassword,
    fs = require('fs'),
    path = require('path'),
    pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem'),
    PUB_KEY = fs.readFileSync(pathToKey, 'utf-8')

//local strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
    function (username, password, done) {
        Users.findOne({ email: username }, function (err, user) {
            let isValid = false
            if (user) {
                isValid = validPassword(password, user.hash, user.salt)
            }
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

//jwt strategy
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
}

passport.use(new JwtStrategy(options, (payload, done) => {
    Users.findOne({ _id: payload.sub })
        .then((user) => {
            if (user) {
                done(null, user)
            }
            else {
                done(null, false)
            }
        })
        .catch(err => done(err, null))
}))


//serialize and deserialize
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