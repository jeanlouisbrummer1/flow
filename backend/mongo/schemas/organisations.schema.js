const mongoose = require('mongoose')

const organisationSchema = new mongoose.Schema({
    organisationID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String,
    },
    address: {
        type: String,
    },
    description: {
        type: String,
    }
})

module.exports = mongoose.model('Organisation', organisationSchema, 'organisation')
