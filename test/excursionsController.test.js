const mongoose = require('mongoose')
const {addExcursion, updateExcursion, deleteExcursion} = require('../controllers/excursions')
const {addCompany} = require('../controllers/companies')
require('dotenv').config()

describe('Test excursions controller', () => {
    let db

    beforeAll(async () => {
        await mongoose.connect(process.env.TEST_DB_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.TEST_DB_USER,
            pass: process.env.TEST_DB_PWD
        })
        db = mongoose.connection

        // if ("companies" in db.collections) {
        //     await db.dropCollection('companies')
        // }
    })

    afterAll(async () => {
        await db.dropCollection('excursions')
        await db.dropCollection('companies')
    })

    let addedExc

    it('should add new excursion', async () => {
        const company = {
            shortName: "ООО Василий",
            email: "gloria@mail.ru",
            inn: 111111,
            ogrn: 567567,
            kpp: 56756756,
            isApproved: true,
            slug: "ooo-vasiliy"
        }
        const addedCompany = await addCompany(company)

        const excursion = {
            company: addedCompany._id,
            informationPhone: 911,
            title: 'Экскурсия',
            description: 'Какое то описание'
        }
        addedExc = await addExcursion(excursion, [])
        expect(addedExc.title).toEqual(excursion.title)
    })

    it('should update excursion', async () => {
        let result = await updateExcursion({title: 'Новая экскурсия'}, addedExc, [])
        expect(result.nModified).toEqual(1)
    })

    it('should delete excursion', async () => {
        let result = await deleteExcursion(addedExc._id)
        console.log(result)
        expect(result.deletedCount).toEqual(1)
    })

})
