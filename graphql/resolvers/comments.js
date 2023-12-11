import { AuthenticationError, UserInputError } from "apollo-server-errors";
import Post from "../../models/Post.js";
import { authContext } from "../../utils/check_auth.js";
import { connect } from "mongoose";

export const commentResolvers = {
  Query: {},
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = authContext(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not empty",
          },
        });
      }
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },

    deleteComment: async (_, { postId, commentId }, context) => {
      try {
        const { username } = authContext(context);
        const post = await Post.findById(postId);
        if (post) {
          const commentIndex = await post.comments.findIndex(
            (c) => c.id === commentId
          );

          if (post.comments[commentIndex].username === username) { 
            post.comments.splice(commentIndex, 1);
            await post.save();
            return post;
          } else {
            throw new AuthenticationError("Action not allowed");
          }
        } else {
          throw new UserInputError("Post not found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
 

  }, 
};
