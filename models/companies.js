const mongoose = require('mongoose')

const companiesSchema = new mongoose.Schema({
    fullName: String,
    shortName: String,
    formOfOwnership: String,
    kindOfActivity: String,
    legalAddress: String,
    actualAddress: String,
    head: String,
    phoneNumber: String,
    faxNumber: String,
    email: String,
    inn: Number,
    ogrn: Number,
    kpp: Number,
    okved: String,
    registrationInformation: String,
    bankInformation: String,
    isApproved: Boolean, 
    slug: String
})

module.exports.Companies = mongoose.model('Companies', companiesSchema)