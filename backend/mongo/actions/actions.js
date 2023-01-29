const request = require('superagent')
const {
    Listing,
    Agent,
    Organisation,
} = require('../schemas')

class HttpError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode
    }
}

class Http {

    constructor() {
        this.baseUrl = `https://flow-living-staging.s3.eu-west-1.amazonaws.com/public/assessment`
    }

    async get(action) {
        const url = `${this.baseUrl}/${action}.json`
        return request.get(url)
            .send()
            .set('Content-Type', 'application/json')
            .then((response) => {
                return response.body
            })
            .catch((error) => {
                if (error.statusCode === 200) {
                    //TODO: Try and improve this validation part
                    const rawResponse = error.rawResponse
                    const response = rawResponse.replace('undefined', '""');
                    return JSON.parse(response)
                }
                throw error
            })
    }
}

const http = new Http()


async function organisationAgents(organisationID) {
    try {
        const match = {organisation: organisationID}
        const lookup = {
            from: "agent",
            localField: "agent",
            foreignField: "agentID",
            as: "agent_data"
        }
        const unwind = '$agent_data'

        const project = {
            _id: 0,
            'agent_data.agentID': 1,
            'agent_data.firstName': 1,
            'agent_data.lastName': 1,
            'agent_data.email': 1,
            'agent_data.contactNumber': 1,
            'agent_data.profileImageUrl': 1
        }

        const agentList = await Listing.aggregate([{
            $match: match
        }, {
            $lookup: lookup
        }, {
            $unwind: unwind
        }, {
            $project: project
        }])

        return {
            success: true,
            message: 'Organisation Agents',
            data: agentList.map(agent => agent.agent_data)
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}

async function agentProperties(agentID) {
    try {

        const match = {agentID: agentID}
        const lookup = {
            from: "listing",
            localField: "agentID",
            foreignField: "agent",
            as: "listing_data"
        }
        const unwind = '$listing_data'
        const project = {
            _id: 0,
            listing_data: 1
        }

        const listings = await Agent.aggregate([{
            $match: match
        }, {
            $lookup: lookup
        }, {
            $unwind: unwind
        }, {
            $project: project
        }])

        return {
            success: true,
            message: 'Agent Listings',
            data: listings.map(listing => listing.listing_data)
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}

async function organisationProperties(organisationID) {
    try {
        const query = { organisation: organisationID }
        const agentList = await Listing.find(query)
        return {
            success: true,
            message: 'Organisation Agents',
            data: agentList
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}


//
// Add Data To MongoDB
//

async function organisationsAdd(organisationList) {
    if (!organisationList) {
        return {
            success: false,
            message: 'No organisation list provided'
        }
    }

    try {
        const docs = await Organisation.insertMany(organisationList)
        return {
            success: true,
            message: `Organisations Saved: Successfully inserted ${docs.length} documents into the collection`
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to save Organisations'
        }
    }
}

async function agentsAdd(agentList) {
    if (!agentList) {
        return {
            success: false,
            message: 'No agent list provided'
        }
    }

    try {
        const docs = await Agent.insertMany(agentList)
        return {
            success: true,
            message: `Agents Saved: Successfully inserted ${docs.length} documents into the collection`
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to save Agents'
        }
    }
}

async function listingsAdd(listingList) {
    if (!listingList) {
        return {
            success: false,
            message: 'No listing list provided'
        }
    }

    try {
        const docs = await Listing.insertMany(listingList)
        return {
            success: true,
            message: `Listings Saved: Successfully inserted ${docs.length} documents into the collection`
        }
    } catch (error) {
        return {
            success: false,
            message: 'Failed to save Listings'
        }
    }
}

async function collectAllData() {
    try {
        const agents = await http.get('agents')
        const organisations = await http.get('organisations')
        const listings = await http.get('listings')

        Object.keys(agents).forEach(key => {
            const agent = agents[key]
            agent.agentID = agent._id
            delete agent._id
        })

        Object.keys(organisations).forEach(key => {
            const organisation = organisations[key]
            organisation.organisationID = organisation._id
            delete organisation._id
        })

        const organisationsAddedResponse = await organisationsAdd(organisations)
        const agentsAddedResponse = await agentsAdd(agents)
        const listingsAddedResponse = await listingsAdd(listings)

        return {
            organisationsAddedResponse,
            agentsAddedResponse,
            listingsAddedResponse
        }

    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    collectAllData,
    organisationAgents,
    agentProperties,
    organisationProperties
}
