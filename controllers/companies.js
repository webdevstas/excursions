const {Companies} = require('../models/companies')
const {slugify} = require('transliteration')
const {unescapeString} = require('../lib/helpers')

/**
 * Сохраняет в БД нового оператора
 * @param {Object} bodyCompany Данные компании полученные из формы
 */
async function addCompany(bodyCompany) {
    await Companies.countDocuments({shortName: bodyCompany.shortName}, (err, count) => {
        if (err) throw err

        if (count > 0) {
            bodyCompany.slug = slugify(unescapeString(bodyCompany.shortName) + '-' + count)
        } else {
            bodyCompany.slug = slugify(unescapeString(bodyCompany.shortName))
        }
    })
    return Companies.create(bodyCompany)
}

/**
 * Обновляет и сохраняет данные оператора
 * @param {Object} bodyCompany Данные из фориы
 * @param reqCompany {Object} reqCompany Данные компании из объекта запроса
 */
async function updateCompany(bodyCompany, reqCompany) {
    let newData = bodyCompany

    if (newData.slug) {
        newData.slug = reqCompany.slug
    }

    if (!newData.shortName) {
        try {
            newData.slug = reqCompany.slug
        } catch (err) {
            throw new Error(`Company not found! ${err.message}: ${err.stack}`)
        }
    } else if (unescapeString(reqCompany.shortName) !== unescapeString(newData.shortName)) {
        newData.slug = slugify(unescapeString(newData.shortName))
    }
    return Companies.updateOne({slug: reqCompany.slug}, newData)
}

/**
 * Удаляет оператора
 * @param {Object} body Объект запроса
 * @param {String} slug Алиас
 */
function deleteCompany(body, slug) {
    if (body.delete) {
        return Companies.deleteOne({slug: slug})
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

function apiUpdateCompany() {
    //TODO:implement
}

module.exports = {addCompany, updateCompany, deleteCompany, countCompanies, apiUpdateCompany}
