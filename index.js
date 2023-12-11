import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { printSchema } from "graphql";
import resolvers from "./graphql/resolvers/index.js";
import mongoose from "mongoose";
import { MONGODB } from "./config.js";
// import { PubSub } from "graphql-subscriptions";
// const pubsub = new PubSub();
const PORT = process.env.PORT || 4000
const typeDefs = loadSchemaSync("./graphql/typeDefs.graphql", {
  loaders: [new GraphQLFileLoader()],
});

// console.log(printSchema(typeDefs));
// Create an Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose.connect(MONGODB).then(async () => {
  console.log("MongoDB Connected!");
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT },
    context: ({ req }) => ({
      authScope: req.headers.authorization, 
      // pubsub: PubSub,
    }),
  });
  console.log(`server ready at post ${url}`);
});
