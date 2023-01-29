const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema({
    agentID: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
    }
})

module.exports = mongoose.model('Agent', agentSchema, 'agent')
