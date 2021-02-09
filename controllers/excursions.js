const { Excursions } = require('../models/excursions')
const { slugify } = require('transliteration')
const fs = require('fs')
const path = require('path')


async function addExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body
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

    

    // Сохраняем в базу
    await Excursions.create(excursion, function (err, data) {
        if (err) throw err
        if (!data.slug) {
            Excursions.updateOne({_id: data._id}, {slug: data._id})
        }

    })
}

async function updateExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body

    if (req.excursion.title !== excursion.title) {
        excursion.slug = slugify(excursion.title)
    }

    // Добавляем загруженные изображения к существующим в базе
    let arrPictures = []
    let pictFromBase = await Excursions.findOne({ slug: excursion.slug }).select({ picturesURLs: 1 })

    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })

    if (pictFromBase) {
        excursion.picturesURLs = arrPictures.concat(pictFromBase.picturesURLs)
    }


    //Обновляем данные в базе
    await Excursions.updateOne({ slug: req.excursion.slug }, excursion, function (err) {

        if (err) throw err

    })
}

// Удаление экскурсии
async function deleteExcursion(req, res) {
    if (req.body.delete) {
        Excursions.deleteOne({ slug: req.excursion.slug }, function (err, result) {
            if (err) throw err

            if (result.ok) {
                res.redirect('/excursions-list')
            }
        })
    }
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

module.exports = { addExcursion, updateExcursion, deleteExcursion, deletePicture, countExcursions }