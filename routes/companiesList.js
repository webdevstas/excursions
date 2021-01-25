const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator')
const { updateCompany, deleteCompany } = require('../controllers/companies')
const { Companies } = require('../models/companies')

// Ответ на запрос списка компаний
router.get('/', async function (req, res) {
	const companies = await Companies.find().select({ shortName: 1, slug: 1, isApproved: 1 })
	res.render('companiesList', { title: 'Список операторов', companies: companies });
});

// Установим алиас для каждой компании
router.param('slug', async function (req, res, next, slug) {
	req.company = await Companies.findOne({ slug: slug })
	next()
})

// GET роут для отдачи формы редактирования компании
router.route('/:slug')
	.get(function (req, res) {
		res.render('companiesForm', {
			action: '/companies-list/' + req.company.slug,
			title: 'Редактирование ' + req.company.shortName, data: req.company, success: {
				isSuccess: false,
				msg: ''
			}, errors: {}
		})
	})

// POST роут для получения обновлённых данных с валидаторами
router.route('/:slug')
	.post(
		body('fullName').trim().escape(),
		body('shortName').trim().escape().notEmpty().withMessage('Краткое наименование компании обязательно к заполнению'),
		body('formOfOwnership').trim().escape(),
		body('kindOfActivity').trim().escape(),
		body('legalAddress').trim().escape(),
		body('actualAddress').trim().escape(),
		body('head').trim().escape(),
		body('phoneNumber').trim().escape(),
		body('faxNumber').trim().escape(),
		body('email').trim().escape(),
		check('inn').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение ИНН'),
		check('ogrn').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение ОГРН'),
		check('kpp').optional({ nullable: true, checkFalsy: true }).isNumeric().withMessage('Введите числовое значение КПП'),
		body('okved').trim().escape(),
		body('registrationInformation').trim().escape(),
		body('bankInformation').trim().escape(),
		body('isApproved').toBoolean(),

		function (req, res) {
			const errors = validationResult(req)

			if (!errors.isEmpty()) {
				res.render('companiesForm', {
					action: '/companies-list/' + req.company.slug,
					title: 'Редактирование ' + req.company.shortName,
					data: req.body,
					errors: errors.array(),
					success: {
						isSuccess: false,
						msg: 'Ошибка сохранения, проверьте правильность заполнения формы'
					}
				})
			}
			else {
				updateCompany(req, res)
			}
		})

router.route('/:slug/delete')
	.post(body('delete').toBoolean(),
		function (req, res) {
			deleteCompany(req, res)
		})


module.exports = router;