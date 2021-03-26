const mongoose = require('mongoose')
const {addUser, getUsers, deleteUser, checkUserExists} = require('../controllers/users')
const {genPassword} = require('../lib/passportUtils')
require('dotenv').config()

describe('Test users controller', () => {
    let db

    beforeAll(async () => {
        await mongoose.connect(process.env.TEST_DB_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.TEST_DB_USER,
            pass: process.env.TEST_DB_PWD
        })
        db = mongoose.connection

        // if ("users" in db.collections) {
        //     await db.dropCollection('users')
        // }
    })

    afterAll(async () => {
        await db.dropCollection('users')
    })

    it('should add new user', async () => {
        const passData = genPassword('test')
        const mockUser = {username: 'John', email: 'test@yap.ru', salt: passData.salt, hash: passData.hash}

        let addedUser = await addUser(mockUser)
        expect(addedUser.username).toEqual(mockUser.username)
    })

    it('should get array of users != 0', async () => {
        let users = await getUsers()
        expect(users).not.toHaveLength(0)
    })

    it('should add a second user and then - delete him', async () => {
        const passData = genPassword('josh')
        const user = {username: 'Josh', email: 'josh@yap.ru', salt: passData.salt, hash: passData.hash}
        await addUser(user)
        await deleteUser(user.email)
        let exists = await checkUserExists(user.email)
        expect(exists).toBeFalsy()
    })
})
