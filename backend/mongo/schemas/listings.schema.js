const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
	agent: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	status: {
		type: String,
		required: true
	},
	organisation: {
		type: String,
		required: true
	},
	listingType: {
		type: String,
		required: true
	},
	listingSector: {
		type: String,
		required: true
	},
	unit: {
		bedrooms: {
			type: Number,
			required: true
		},
		bathrooms: {
			type: Number,
			required: true
		},
		parking: {
			type: Number,
			required: true
		},
		price: {
			type: Number,
			required: true
		},
	},
	images: [{
		type: String
	}],
})

module.exports = mongoose.model('Listing', listingSchema, 'listing')
