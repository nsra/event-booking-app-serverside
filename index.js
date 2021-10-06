require('dotenv').config();
const express = require('express');
const { ApolloServer } = require("apollo-server-express");
const { typeDefs } = require('./schema/index');
const { resolvers } = require('./resolvers/index');
const mongoose = require('mongoose');
const User = require('./models/user');
const jwt = require('jsonwebtoken');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const { createServer } = require('http');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { execute, subscribe } = require('graphql');
const port = process.env.PORT || 4000;
async function startApolloServer(typeDefs, resolvers) {
    const app = express();
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', "https://amazing-kalam-68e6c5.netlify.app/");
        next();
    });

    const httpServer = createServer(app);
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const auth = req ? req.headers.authorization : null;
            if (auth) {
                const decodedToken = jwt.verify(
                    auth.split(' ')[1], "f1BtnWgD3VKY09"
                );
                const user = await User.findById(decodedToken.id);
                return { user };
            }
        },
        plugins: [{
            async serverWillStart() {
                return {
                    async drainServer() {
                        subscriptionServer.close();
                    }
                };
            }
        }],
    });

    SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe
        },
        {
            server: httpServer,
            path: server.graphqlPath
        }
    );

    await server.start();
    server.applyMiddleware({ path: "/graphql", app });

    await new Promise(resolve => httpServer.listen({ port: port }, resolve));
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
    mongoose.connect("mongodb+srv://HsoubAcademyGraphQLCourse:654321abc@cluster0.yy3al.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        // , { useNewUrlParser: true, useUnifiedTopology: true },
        err => {
            if (err) throw err;
            console.log('DB Connected successfully');
        }
    );
    return { server, app };
}
startApolloServer(typeDefs, resolvers);
