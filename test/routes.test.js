const request = require("supertest")
const app = require("../app")

describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/")
        expect(response.statusCode).toBe(200)
    })
})

describe("Test the /login path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/login")
        expect(response.statusCode).toBe(200)
    })
})

describe("Test the /companies-list path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/companies-list")
        expect(response.statusCode).toBe(302)
    })
})

describe("Test the /excursions-list path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/excursions-list")
        expect(response.statusCode).toBe(302)
    })
})

describe("Test the /users path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/users")
        expect(response.statusCode).toBe(302)
    })
})
