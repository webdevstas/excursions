const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  res.render('index', { title: 'Вход в панель управления'});
});

module.exports = router;
