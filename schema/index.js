const { gql } = require('apollo-server-express') 

const typeDefs = gql`
    type Query {
        events: [Event!]
        bookings: [Booking!] #authenticated user bookings
        # greeting: String!
    }

    type AuthData {
        userId: ID!
        token: String!
        username: String!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        createdEvents: [Event!]
    }

    input UserInput {
        username: String!
        email: String!
        password: String!
    }

    type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
        creator: User!
    }

    type Booking {
        _id: ID!
        event: Event!
        user: User!
        createdAt: String!
        updatedAt: String!
    }

    type Mutation {
        createEvent(eventInput: EventInput!): Event
        createUser(userInput: UserInput!): AuthData
        bookEvent(eventId: ID!): Booking!
        cancelBooking(bookingId: ID!): Event!
        login(email: String!, password: String!): AuthData!
    }

    input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
    }

    type Subscription {
        eventAdded: Event!
    } 
` 

module.exports = { typeDefs } 