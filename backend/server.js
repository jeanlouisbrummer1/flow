const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const {
    collectAllData,
    organisationAgents,
    agentProperties,
    organisationProperties
} = require('./mongo/actions/actions')

require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    next()
})

const port = process.env.PORT || 8000

// MongoDB
const username = encodeURIComponent(process.env.MONGO_USERNAME)
const password = encodeURIComponent(process.env.MONGO_PASSWORD)

const uri = `mongodb+srv://${username}:${password}@cluster0.j4dg168.mongodb.net/flow?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(uri, {
    useNewUrlParser: true
}, (err) => {
    if (err) {
        console.error('FAILED TO CONNECT TO MONGODB')
        console.error(err)
    }
})

const connection = mongoose.connection
connection.once('open', () => {
    console.log('CONNECTED TO MONGODB!!')
    app.listen(port)
    console.log('Server started on port ' + port)
})

app.get('/collect', async (req, res) => {
    const result = await collectAllData()
    res.send(result)
})

//http://localhost:3000/agents?organisationID=123
app.get('/agents', async (req, res) => {
    const organisationID = req.query.organisationID
    const result = await organisationAgents(organisationID)
    res.send(result)
})

//TODO:
// //http://localhost:3000/listings?agentID=123
// //http://localhost:3000/listings?organisationID=123
app.get('/listings', async (req, res) => {
    const {agentID, organisationID} = req.query
    let result

    if (agentID) {
        result = await agentProperties(agentID)
        res.send(result)
    } else if (organisationID) {
        result = await organisationProperties(organisationID)
        res.send(result)
    } else {
        res.status(400).send({successful: false, message: 'Please provide either the agent ID or the organisation ID'})
    }
})

