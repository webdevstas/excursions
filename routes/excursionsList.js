const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator')
const { updateExcursion, deleteExcursion } = require('../controllers/excursions')
const { Excursions } = require('../models/excursions')


// Ответ на запрос списка экскурсий
router.get('/', async function (req, res) {
	const excursions = await Excursions.find().select({title: 1, slug: 1})
	res.render('excursionsList', { title: 'Список экскурсий', excursions: excursions });
});

// Установим алиас для каждой экскурсии
router.param('slug', async function (req, res, next, slug) {
	req.excursion = await Excursions.findOne({ slug: slug })
	next()
})

router.route('/:slug')
	.get(function (req, res) {
		const errors = validationResult(req)

			if (!errors.isEmpty()) {
				res.render('excursionsForm', {
					action: '/excursions-list/' + req.excursion.slug,
					title: 'Редактирование ' + req.excursion.title,
					data: req.body,
					errors: errors.array(),
					success: {
						isSuccess: false,
						msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
					}
				})
			}
			else {
				updateExcursion(req, res)
			}
	})

	router.route('/:slug/delete')
	.post(body('delete').toBoolean(),
		function (req, res) {
			deleteExcursion(req, res)
		})

module.exports = router;