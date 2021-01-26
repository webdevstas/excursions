const { Excursions } = require('../models/excursions')
const { slugify } = require('transliteration')


async function addExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body

    // Добавляем загруженные изображения
    let arrPictures = []
    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })
    excursion.picturesURLs = arrPictures

    // Проверяем дубли алиасов
    await Excursions.countDocuments({ title: excursion.title }, (err, count) => {
        if (err) console.log(err) // TODO: Обработать возможные ошибки

        if (count > 0) {
            excursion.slug = slugify(excursion.title + '-' + (count + 1))
        }
        else {
            excursion.slug = slugify(excursion.title)
        }
    })

    // Сохраняем в базу
    await Excursions.create(excursion, function (err) {

        if (err) return console.error(err) // TODO: Обработать возможные ошибки

    })

}

async function updateExcursion(req, res) {
    // Сохраняем данные из формы
    let excursion = req.body

    // Проверяем дубли алиасов
    await Excursions.countDocuments({ title: excursion.title }, (err, count) => {

        if (err) console.log(err) // TODO: Обработать возможные ошибки

        if (count > 0) {
            excursion.slug = slugify(excursion.title + '-' + (count + 1))
        }
        else {
            excursion.slug = slugify(excursion.title)
        }
    })

    // Добавляем загруженные изображения к существующим в базе
    let arrPictures = []
    let pictFromBase = await Excursions.findOne({ slug: excursion.slug }).select({ picturesURLs: 1 })
    req.files.forEach((file) => {
        arrPictures.push(file.filename)
    })
    let concArr = arrPictures.concat(pictFromBase.picturesURLs) // TODO: Поймать ошибку
    excursion.picturesURLs = concArr

    // Обновляем данные в базе
    await Excursions.updateOne({ slug: req.excursion.slug }, excursion, {}, function (err) {

        if (err) return console.error(err) // TODO: Обработать возможные ошибки

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
        Excursions.deleteOne({ slug: req.excursion.slug }, function (error, result) {
            if (error) console.log(error) // TODO: Обработать возможные ошибки
            if (result.ok) {
                res.redirect('/excursions-list')
            }
        })
    }
}

module.exports = { addExcursion, updateExcursion, deleteExcursion }