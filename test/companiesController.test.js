const mongoose = require('mongoose')
const {addCompany, updateCompany, deleteCompany} = require('../controllers/companies')
require('dotenv').config()

describe('Test companies controller', () => {
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
        await db.dropCollection('companies')
    })

    let addedCompany

    it('should add a new company', async () => {
        const company = {
            fullName: "",
            shortName: "ООО Василий Великий",
            formOfOwnership: "",
            kindOfActivity: "",
            legalAddress: "",
            actualAddress: "",
            head: "",
            phoneNumber: null,
            faxNumber: null,
            email: "gloria@mail.ru",
            inn: 111111,
            ogrn: 567567,
            kpp: 56756756,
            okved: "",
            isApproved: true,
            slug: "ooo-vasiliy-velikiy"
        }
        addedCompany = await addCompany(company)
        expect(addedCompany.shortName).toEqual(company.shortName)
    })

    it('should update the company', async () => {
        const company = {
            slug: "ooo-vasiliy-velikiy",
            shortName: "ООО Василий Великий"
        }
        let res = await updateCompany({ isApproved: false }, company)
        expect(res.nModified).toEqual(1)
    })

    it('should delete the company', async () => {
        let res = await deleteCompany({delete: true}, 'ooo-vasiliy-velikiy')
        expect(res.deletedCount).toEqual(1)
    })

})
