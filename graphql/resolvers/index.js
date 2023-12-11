import { commentResolvers } from "./comments.js";
import { postResolvers } from "./posts.js";
import userResolvers from "./users.js";
const resolvers = {
  Post: {
    likeCount(parent) {
      return parent.likes.length;
    },
    commentCount(parent) {
      return parent.comments.length;
    },
  },
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...commentResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
  // Subscription:{
  //   ...postResolvers.Subscription,

  // }
};

export default resolvers;
