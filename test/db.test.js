const mongoose = require('mongoose')
const {Users} = require('../models/users')
const {Companies} = require('../models/companies')
require('dotenv').config()

jest.setTimeout(5000);
describe('insert', () => {
    let connection
    let db

    beforeAll(async () => {
        mongoose.connect(process.env.TEST_DB_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.TEST_DB_USER,
            pass: process.env.TEST_DB_PWD
        })
        db = mongoose.connection
    })

    afterAll(async () => {
        await db.dropDatabase()
        await db.close()
    })

    it('should insert user into collection Users', async () => {

        const mockUser = {username: 'John'}
        await Users.create(mockUser)

        const insertedUser = await Users.findOne(mockUser)
        expect(insertedUser.username).toEqual(mockUser.username)
    })
})
