const {Excursions} = require('../models/excursions')
const {Tickets} = require('../models/tickets')
const {Companies} = require('../models/companies')
const {slugify} = require('transliteration')
const fs = require('fs')
const path = require('path')
const {unescapeString} = require('../lib/helpers')

/**
 * Сохраняет в БД новую экскурсию
 * @param {Object} body Тело запроса
 * @param {Array} files Массив картинок
 */
async function addExcursion(body, files) {
    let company = await Companies.findOne({_id: body.company}).select({_id: 1})
    // Сохраняем данные из формы
    let excursion = {
        company: company._id,
        title: body.title,
        description: body.description,
        price: body.price,
        isApproved: body.isApproved,
        tags: body.tags,
        informationPhone: body.informationPhone
    }

    // Получаем типы билетов
    let tickets = []
    if (body.tickets) {
        tickets = JSON.parse(body.tickets)
    }

    // Добавляем загруженные изображения
    let arrPictures = []
    files.forEach((file) => {
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

    let ticketsIds = []
    // Сохраняем билеты
    await Tickets.insertMany(tickets, (err, data) => {
        data.forEach(item => {
            ticketsIds.push(item._id)
        })
        excursion.tickets = ticketsIds
    })

    // Сохраняем экскурсию
    return Excursions.create(excursion)
}

/**
 * Обновляет данные экскурсии
 * @param {Object} body Тело запроса
 * @param {Object} oldExcursion Обновляемая экскурсия
 * @param {Array} pictures Массив добавляемых картинок
 */
async function updateExcursion(body, oldExcursion, pictures) {
    // Сохраняем данные из формы
    let excursion = body

    // Получаем типы билетов
    let tickets = []

    if (excursion.tickets) {
        tickets = JSON.parse(excursion.tickets)
    }

    if (oldExcursion.title !== excursion.title) {
        excursion.slug = slugify(unescapeString(excursion.title))

        // Проверяем дубли алиасов
       await Excursions.countDocuments({title: excursion.title}, (err, count) => {

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
    let pictFromBase = oldExcursion.picturesURLs

    pictures.forEach((file) => {
        arrPictures.push(file.filename)
    })

    if (pictFromBase) {
        excursion.picturesURLs = arrPictures.concat(pictFromBase)
    } else {
        excursion.picturesURLs = arrPictures
    }
    // Сохраняем билеты
    await Tickets.insertMany(tickets).then((data) => {
        let ids = oldExcursion.tickets
        if (data) {
            data.forEach(item => {
                ids.push(item._id)
            })
        }
        excursion.tickets = ids
    })
    // Вернём промис для сохранения данных
    return Excursions.updateOne({_id: oldExcursion._id}, excursion)
}

/**
 * Удаляет экскурсию
 * @param {Object} id Объект запроса
 */
function deleteExcursion(id) {
    return Excursions.deleteOne({_id: id})
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
 * Удаляет билет определённой экскурсии
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
            if (err) reject(err)
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

    try {
        if (excursion.slug) {
            excursion.slug = req.excursion.slug
        }
        if (!excursion.title) {
            excursion.slug = req.excursion.slug
        } else if (unescapeString(req.excursion.title) !== unescapeString(excursion.title)) {
            excursion.slug = slugify(unescapeString(excursion.title))
        }
    } catch (err) {
        throw new Error('Excursion not found')
    }

    if (excursion.picturesURLs) {
        excursion.picturesURLs = req.excursion.picturesURLs
    }

    if (excursion.tickets) {
        excursion.tickets = req.excursion.tickets
    }

    return  Excursions.updateOne({_id: req.excursion._id}, excursion)
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
