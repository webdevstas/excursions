const express = require('express');
const router = express.Router();
const {countCompanies} = require('../controllers/companies')
const {countExcursions} = require('../controllers/excursions')


/* GET home page. */
router.get('/', async function (req, res, next) {
    let username = req.user ? req.user.username : 'guest'
    countExcursions().then(countExc => {
        countCompanies().then(countComp => {
            res.render('index', {title: 'Главная', user: username, countCompanies: countComp, countExcursions: countExc});
        }).catch(err => {
            next(err, req, res)
        })
    })
});

module.exports = router;
