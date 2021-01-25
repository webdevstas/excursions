const { Excursions } = require('../models/excursions')
const { slugify } = require('transliteration')
const {Companies} = require('../models/companies')

async function addExcursion(req, res) {
    let excursion = req.body
    await Excursions.countDocuments({ title: excursion.title }, (err, count) => {
        if (err) console.log(err)

        if (count > 0) {
            excursion.slug = slugify(excursion.title + '-' + count)
        }
        else {
            excursion.slug = slugify(excursion.title)
        }
    })

    await Excursions.create(excursion, async function (err) {

        const companies = await Companies.find().select({shortName: 1})

        if (err) return console.error(err)

        res.render('excursionsForm', {
            title: 'Форма добавления экскурсии', 
            action: '/new-excursion',
            data: {companies: companies},
            errors: {},
            success: {
                isSuccess: true,
                msg: 'Экскурсия успешно добавлена'
            }
        })
    })
}

async function updateExcursion(req, res) {
    const excursion = req.body

    await Excursions.countDocuments({ title: excursion.title }, (err, count) => {
        if (err) console.log(err)

        if (count > 0) {
            excursion.slug = slugify(excursion.title + '-' + count)
        }
        else {
            excursion.slug = slugify(excursion.title)
        }
    })

    await Excursions.updateOne({ slug: req.excursion.slug }, excursion, {}, function (err) {

        if (err) return console.error(err)

        res.redirect('/excursions-list')

        // res.render('companiesForm', {
        //   action: '/companies-list/' + req.company.slug,
        //   data: company,
        //   errors: {},
        //   success: {
        //     isSuccess: true,
        //     msg: 'Компания успешно сохранена'
        //   }
        // })

    })
}

async function deleteExcursion(req, res) {
    if (req.body.delete) {
        Excursions.deleteOne({ slug: req.company.slug }, function (error, result) {
            if (error) console.log(error)
            if (result.ok) {
                res.redirect('/excursions-list')
            }
        })
    }
}

module.exports = { addExcursion, updateExcursion, deleteExcursion }