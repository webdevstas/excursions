const express = require('express')
const router = express.Router()

router.route('/').get((req, res) => {
    req.logout()
    res.redirect('/login')
})

module.exports = router