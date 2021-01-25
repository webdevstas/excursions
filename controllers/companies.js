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
        res.render('companiesForm', {
            title: 'Форма добавления компании', 
            action: '/register-company',
            data: {},
            errors: {},
            success: {
                isSuccess: true,
                msg: 'Компания успешно добавлена'
            }
        })
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

    await Companies.updateOne({ slug: req.company.slug }, {
        fullName: company.fullName,
        shortName: company.shortName,
        formOfOwnership: company.formOfOwnership,
        kindOfActivity: company.kindOfActivity,
        legalAddress: company.legalAddress,
        actualAddress: company.actualAddress,
        head: company.head,
        phoneNumber: company.phoneNumber,
        faxNumber: company.faxNumber,
        email: company.email,
        inn: company.inn,
        ogrn: company.ogrn,
        kpp: company.kpp,
        okved: company.okved,
        registrationInformation: company.registrationInformation,
        bankInformation: company.bankInformation,
        isApproved: company.isApproved,
        slug: company.slug
    }, {}, function (err) {

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
        Companies.deleteOne({ slug: req.company.slug }, function (error, result) {
            if (error) console.log(error)
            if (result.ok) {
                res.redirect('/companies-list')
            }
        })
    }
}

module.exports = { addCompany, updateCompany, deleteCompany }