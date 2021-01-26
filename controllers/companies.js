const { Companies } = require('../models/companies')
const { slugify } = require('transliteration')


async function addCompany(req, res) {
    let company = req.body
    await Companies.countDocuments({ shortName: company.shortName }, (err, count) => {
        if (err) console.log(err)

        if (count > 0) {
            company.slug = slugify(company.shortName + '-' + count)
        }
        else {
            company.slug = slugify(company.shortName)
        }
    })

    await Companies.create(company, function (err) {

        if (err) return console.error(err)

    })
}

async function updateCompany(req, res) {
    const company = req.body

    await Companies.countDocuments({ shortName: company.shortName }, (err, count) => {
        if (err) console.log(err)

        if (count > 0) {
            company.slug = slugify(company.shortName + '-' + count)
        }
        else {
            company.slug = slugify(company.shortName)
        }
    })

    await Companies.updateOne({ slug: req.company.slug }, company, {}, function (err) {

        if (err) return console.error(err)

        res.redirect('/companies-list')

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

async function deleteCompany(req, res) {
    if (req.body.delete) {
        await Companies.deleteOne({ slug: req.company.slug }, function (error, result) {
            if (error) console.log(error)
            if (result.ok) {
                res.redirect('/companies-list')
            }
        })
    }
}

module.exports = { addCompany, updateCompany, deleteCompany }