const { Companies } = require('../models/companies')
const { slugify } = require('transliteration')


async function addCompany(req, res) {
    let company = req.body
    await Companies.countDocuments({ shortName: company.shortName }, (err, count) => {
        if (err) throw err

        if (count > 0) {
            company.slug = slugify(company.shortName + '-' + count)
        }
        else {
            company.slug = slugify(company.shortName)
        }
    })

    await Companies.create(company, function (err) {

        if (err) throw err

    })
}

async function updateCompany(req, res) {
    const company = req.body
    
    if (req.company.shortName !== company.shortName) {
        company.slug = slugify(company.shortName)
    }

    await Companies.updateOne({ slug: req.company.slug }, company, {}, function (err) {

        if (err) throw err

        res.redirect('/companies-list')

    })
}

async function deleteCompany(req, res) {
    if (req.body.delete) {
        await Companies.deleteOne({ slug: req.company.slug }, function (err, result) {
            if (err) throw err
            if (result.ok) {
                res.redirect('/companies-list')
            }
        })
    }
}

async function countCompanies() {
    let countAll = 0,
        countApproved = 0
    await Companies.countDocuments((err, count) => {
        if (err) throw err
        countAll = count
    })
    await Companies.countDocuments({isApproved: true}, (err, count) => {
        if (err) throw err
        countApproved = count
    })
    return {all: countAll, approved: countApproved}
}

module.exports = { addCompany, updateCompany, deleteCompany, countCompanies }