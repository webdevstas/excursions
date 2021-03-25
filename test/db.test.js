/* eslint-disable no-undef */
const mongoose = require('mongoose')
const {Users} = require('../models/users')
require('dotenv').config()
const {genPassword} = require('../lib/passportUtils')

describe('User model test', () => {
    let db

    beforeAll(async () => {
        mongoose.connect(process.env.TEST_DB_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.TEST_DB_USER,
            pass: process.env.TEST_DB_PWD
        })
        db = mongoose.connection
        await Users.init()
    })

    afterAll(async () => {
        await db.dropDatabase()
        await db.close()
    })

    it('should insert user into collection Users', async () => {
        const passData = genPassword('test')
        const mockUser = {username: 'John', email: 'test@mail.ru', salt: passData.salt, hash: passData.hash}

        await Users.create(mockUser)
        const insertedUser = await Users.findOne(mockUser)

        expect(insertedUser._id).toBeDefined()
        expect(insertedUser.username).toEqual(mockUser.username)
        expect(insertedUser.email).toEqual(mockUser.email)
        expect(insertedUser.hash).toEqual(mockUser.hash)
        expect(insertedUser.salt).toEqual(mockUser.salt)
    })

    it('create user without required field should failed', async () => {
        const user = {username: 'Bill'}
        let err
        await Users.create(user).catch(error => {
            err = error
        })
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
    })

    it('insert user successfully, but the field does not defined in schema should be undefined', async () => {
        const passData = genPassword('test2')
        const mockUser = {username: 'Sasha', email: 'test@ya.ru', salt: passData.salt, hash: passData.hash, someField: 'some data'}

        const savedUserWithInvalidField = await Users.create(mockUser)

        expect(savedUserWithInvalidField._id).toBeDefined()
        expect(savedUserWithInvalidField.someField).toBeUndefined()
    });
})
