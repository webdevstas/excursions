const {Excursions} = require('../models/excursions')
const {slugify} = require('transliteration')
const fs = require('fs')
const path = require('path')
const {Tickets} = require('../models/tickets')
const {Companies} = require('../models/companies')
const {unescapeOne, unescapeMany, unescapeString} = require('../lib/helpers')

/**
 * Сохраняет в БД новую экскурсию
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function addExcursion(req, res) {
    let company = await Companies.findOne({_id: req.body.company}).select({_id: 1})
    // Сохраняем данные из формы
    let excursion = {
        company: company._id,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        isApproved: req.body.isApproved,
        tags: req.body.tags,
        informationPhone: req.body.informationPhone
    }

    // Получаем типы билетов
    let tickets = []
    if (req.body.tickets) {
        tickets = JSON.parse(req.body.tickets)
    }

    // Добавляем загруженные изображения
    let arrPictures = []
    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })
    excursion.picturesURLs = arrPictures
    excursion.isPublished = false

    // Проверяем дубли алиасов
    await Excursions.countDocuments({title: excursion.title}, (err, count) => {

        if (err) throw err

        if (count > 0) {
            excursion.slug = slugify(unescapeString(excursion.title) + '-' + (count + 1))
        } else {
            excursion.slug = slugify(unescapeString(excursion.title))
        }
    })

    // Сохраняем билеты
    await Tickets.insertMany(tickets, (err, data) => {
        let ids = []
        data.forEach(item => {
            ids.push(item._id)
        })
        excursion.tickets = ids

        // Сохраняем экскурсию
        Excursions.create(excursion, function (err, data) {
            if (err) throw err
            if (!data.slug) {
                Excursions.updateOne({_id: data._id}, {slug: data._id})
            }
        })
    })
}

/**
 * Сохраняет данные экскурсии
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function updateExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body

    // Получаем типы билетов
    let tickets = []
    if (req.body.tickets) {
        tickets = JSON.parse(req.body.tickets)
    }

    if (req.excursion.title !== excursion.title) {
        excursion.slug = slugify(unescapeString(excursion.title))

        // Проверяем дубли алиасов
        Excursions.countDocuments({title: excursion.title}, (err, count) => {

            if (err) throw err

            if (count > 0) {
                excursion.slug = slugify(unescapeString(excursion.title) + '-' + (count + 1))
            } else {
                excursion.slug = slugify(unescapeString(excursion.title))
            }
        })
    }

    // Добавляем загруженные изображения к существующим в базе
    let arrPictures = []
    let pictFromBase = req.excursion.picturesURLs

    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })

    if (pictFromBase) {
        excursion.picturesURLs = arrPictures.concat(pictFromBase)
    } else {
        excursion.picturesURLs = arrPictures
    }

    // Сохраняем билеты
    await Tickets.insertMany(tickets, async (err, data) => {
        if (err) throw err

        let ids = req.excursion.tickets

        if (data) {
            data.forEach(item => {
                ids.push(item._id)
            })
        }
        excursion.tickets = ids
        // Обновляем данные в базе
        Excursions.updateOne({_id: req.excursion._id}, excursion, function (err) {

            if (err) throw err

        })
    })
}

/**
 * Удаляет экскурсию
 * @param {Object} req Объект запроса
 * @param {Object} res Объект ответа
 */
async function deleteExcursion(req, res) {
    Excursions.deleteOne({_id: req.excursion._id}, function (err, result) {
        if (err) throw err

        if (result.ok) {
            res.redirect('/excursions-list')
        }
    })
}

/**
 * Удаляет изображение определённой экскурсии
 * @param {Number} index Порядковый номер картинки в БД
 * @param {String} slug Алиас экскурсии
 */
async function deletePicture(index, slug) {

    let pictFromBase = await Excursions.findOne({slug: slug}).select({picturesURLs: 1})

    let newPictArr = pictFromBase.picturesURLs.filter((el, i) => {
        return i !== index
    })

    await Excursions.updateOne({slug: slug}, {picturesURLs: newPictArr})

    let filePath = ''

    filePath = path.resolve('./public/images/upload', pictFromBase.picturesURLs[index])

    await fs.unlink(filePath, err => {
        if (err) throw err
    })
    return {success: true, error: {}}
}

/**
 * Удаляет изображение определённой экскурсии
 * @param {Number} id Id билета
 */
async function deleteTicket(id) {
    await Tickets.deleteOne({_id: id}, (err) => {
        if (err) throw err
    })

    return {success: true, error: {}}
}

/**
 * Подсчитывает количество экскурсий
 */
function countExcursions() {
    let countAll = 0,
        countApproved = 0,
        countPublished = 0
    // eslint-disable-next-line no-async-promise-executor
    const countPromise = new Promise(async (resolve, reject) => {
        await Excursions.countDocuments((err, count) => {
            if (err) throw err
            countAll = count
        })
            .then(async () => {
                await Excursions.countDocuments({isApproved: true}, (err, count) => {
                    if (err) throw err
                    countApproved = count
                })
                    .then(async () => {
                        await Excursions.countDocuments({isPublished: true}, (err, count) => {
                            if (err) throw err
                            countPublished = count
                            resolve({all: countAll, approved: countApproved, published: countPublished})
                        })
                    })
            })
    })
    return countPromise
}

async function apiUpdateExcursion(req, res) {
    const excursion = req.body

    if (excursion.slug) {
        excursion.slug = req.excursion.slug
    }
    if (!excursion.title) {
        excursion.slug = req.excursion.slug
    } else if (unescapeString(req.excursion.title) !== unescapeString(excursion.title)) {
        excursion.slug = slugify(unescapeString(excursion.title))
    }

    if (excursion.picturesURLs) {
        excursion.picturesURLs = req.excursion.picturesURLs
    }

    if (excursion.tickets) {
        excursion.tickets = req.excursion.tickets
    }

    await Excursions.updateOne({_id: req.excursion._id}, excursion, {}, err => {
        if (err) {
            res.json({success: false, msg: err})
        } else {
            res.json({success: true})
        }
    })
}

module.exports = {
    addExcursion,
    updateExcursion,
    deleteExcursion,
    deletePicture,
    countExcursions,
    deleteTicket,
    apiUpdateExcursion
}
