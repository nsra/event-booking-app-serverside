const { authResolver } = require('./auth') 
const { eventResolver } = require('./event') 
const { bookingResolver } = require('./booking') 
const { merge } = require('lodash') 

const resolvers = merge(authResolver, bookingResolver, eventResolver) 

module.exports = { resolvers } 


