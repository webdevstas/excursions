const express = require('express');
const router = express.Router();
const {countCompanies} = require('../controllers/companies')
const {countExcursions} = require('../controllers/excursions')



/* GET home page. */
router.get('/', async function (req, res, next) {
  let countComp = await countCompanies()
  let countExc = await countExcursions()
  let username = req.user ? req.user.username : 'guest'
  res.render('index', { title: 'Главная', user: username, countCompanies: countComp, countExcursions: countExc});
});

module.exports = router;
