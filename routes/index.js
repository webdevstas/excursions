const express = require('express');
const router = express.Router();
const {countCompanies} = require('../controllers/companies')
const {countExcursions} = require('../controllers/excursions')


/* GET home page. */
router.get('/', function (req, res, next) {
    let username = req.user ? req.user.username : 'guest'
  // eslint-disable-next-line no-async-promise-executor
    let countPromise = new Promise(async (resolve, reject) => {
        let countComp = await countCompanies()
        let countExc = await countExcursions()
        resolve({countComp, countExc})
    })
    countPromise.then((data) => {
        res.render('index', {
            title: 'Главная',
            user: username,
            countCompanies: data.countComp,
            countExcursions: data.countExc
        })
    })
});

module.exports = router;
