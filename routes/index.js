const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  let username = req.user ? req.user.username : 'guest'
  res.render('index', { title: 'Главная', user: username});
});

module.exports = router;
