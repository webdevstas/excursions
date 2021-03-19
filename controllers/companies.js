const {Companies} = require('../models/companies')
const {slugify} = require('transliteration')
const {unescapeString} = require('../lib/helpers')

/**
 * Сохраняет в БД нового оператора
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function addCompany(req, res) {
    let company = req.body
    await Companies.countDocuments({shortName: company.shortName}, (err, count) => {
        if (err) throw err

        if (count > 0) {
            company.slug = slugify(unescapeString(company.shortName) + '-' + count)
        } else {
            company.slug = slugify(unescapeString(company.shortName))
        }
    })

    await Companies.create(company, function (err) {
        if (err) throw err
    })
}

/**
 * Обновляет и сохраняет данные оператора
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function updateCompany(req, res) {
    const company = req.body

    if (company.slug) {
        company.slug = req.company.slug
    }

    if (!company.shortName) {
        try {
            company.slug = req.company.slug
        } catch (err) {
            throw new Error('Company not found')
        }
    } else if (unescapeString(req.company.shortName) !== unescapeString(company.shortName)) {
        company.slug = slugify(unescapeString(company.shortName))
    }

    await Companies.updateOne({slug: req.company.slug}, company, {}, function (err) {

        if (err) {
            throw err
        }

        if (req.baseUrl === '/api') {
            res.json({success: true})
        } else {
            res.redirect('/companies-list')
        }
    })
}

/**
 * Удаляет оператора
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function deleteCompany(req, res) {
    if (req.body.delete) {
        await Companies.deleteOne({slug: req.company.slug}, function (err, result) {
            if (err) throw err
            if (result.ok) {
                res.redirect('/companies-list')
            }
        })
    }
}

/**
 * Подсчитывает количество операторов
 */
function countCompanies() {
    let countAll = 0,
        countApproved = 0
    // eslint-disable-next-line no-async-promise-executor
    const countPromise = new Promise(async (resolve, reject) => {
        await Companies.countDocuments((err, count) => {
            if (err) throw err
            countAll = count
        })
            .then(async () => {
                await Companies.countDocuments({isApproved: true}, (err, count) => {
                    if (err) throw err
                    countApproved = count
                    resolve({all: countAll, approved: countApproved})
                })
            })
    })
    return countPromise
}

module.exports = {addCompany, updateCompany, deleteCompany, countCompanies}
