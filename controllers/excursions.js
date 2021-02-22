const { Excursions } = require('../models/excursions')
const { slugify } = require('transliteration')
const fs = require('fs')
const path = require('path')
const { Tickets } = require('../models/tickets')
const { Companies } = require('../models/companies')


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
    await Excursions.countDocuments({ title: excursion.title }, (err, count) => {

        if (err) throw err

        if (count > 0) {
            excursion.slug = slugify(excursion.title + '-' + (count + 1))
        }
        else {
            excursion.slug = slugify(excursion.title)
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
                Excursions.updateOne({ _id: data._id }, { slug: data._id })
            }
        })
    })
}

async function updateExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body

    // Получаем типы билетов
    let tickets = []
    if (req.body.tickets) {
        tickets = JSON.parse(req.body.tickets)
    }

    if (req.excursion.title !== excursion.title) {
        excursion.slug = slugify(excursion.title)
    }

    // Добавляем загруженные изображения к существующим в базе
    let arrPictures = []
    let pictFromBase = req.excursion.picturesURLs

    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })

    if (pictFromBase) {
        excursion.picturesURLs = arrPictures.concat(pictFromBase)
    }
    else {
        excursion.picturesURLs = arrPictures
    }

    // Сохраняем билеты
    await Tickets.insertMany(tickets, async (err, data) => {
        let ids = req.excursion.tickets
        if (data) {
            data.forEach(item => {
                ids.push(item._id)
            })
        }
        excursion.tickets = ids
        // Обновляем данные в базе
        Excursions.updateOne({ slug: req.excursion.slug }, excursion, function (err) {

            if (err) throw err

        })
    })
}

// Удаление экскурсии
async function deleteExcursion(req, res) {
    Excursions.deleteOne({ slug: req.excursion.slug }, function (err, result) {
        if (err) throw err

        if (result.ok) {
            res.redirect('/excursions-list')
        }
    })
}

// Удаление изображения
async function deletePicture(index, slug) {

    let pictFromBase = await Excursions.findOne({ slug: slug }).select({ picturesURLs: 1 })

    let newPictArr = pictFromBase.picturesURLs.filter((el, i) => {
        return i !== index
    })

    await Excursions.updateOne({ slug: slug }, { picturesURLs: newPictArr })

    let filePath = ''

    filePath = path.resolve('./public/images/upload', pictFromBase.picturesURLs[index])

    await fs.unlink(filePath, err => {
        if (err) throw err
    })
    return { success: true, error: {} }
}

async function deleteTicket(id) {
    await Tickets.deleteOne({ _id: id }, (err) => {
        if (err) throw err
    })
    return { success: true, error: {} }
}

async function countExcursions() {
    let countAll = 0,
        countApproved = 0,
        countPublished = 0
    await Excursions.countDocuments((err, count) => {
        if (err) throw err
        countAll = count
    })
    await Excursions.countDocuments({ isApproved: true }, (err, count) => {
        if (err) throw err
        countApproved = count
    })
    await Excursions.countDocuments({ isPublished: true }, (err, count) => {
        if (err) throw err
        countPublished = count
    })
    return { all: countAll, approved: countApproved, published: countPublished }
}

module.exports = { addExcursion, updateExcursion, deleteExcursion, deletePicture, countExcursions, deleteTicket }