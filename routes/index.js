const express = require('express');
const router = express.Router();
const { Companies } = require('../models/companies')

/* GET home page. */
router.get('/', async function (req, res, next) {
  const companies = await Companies.find().select({shortName: 1})
  res.render('index', { title: 'Express', companies: companies });
});

module.exports = router;
