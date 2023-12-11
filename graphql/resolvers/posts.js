import { AuthenticationError, UserInputError } from "apollo-server-errors";
import Post from "../../models/Post.js";
import { authContext } from "../../utils/check_auth.js";

export const postResolvers = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (error) {
        throw new Error(error);
      }
    },

    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },

  Mutation: {
    async createPost(_, { body }, context) {
      const user = authContext(context);
      //   console.log(user);
      if (body.trim() === "") {
        throw new Error("Post body must not be empty");
      }
      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });
      const post = newPost.save();
      return post;
    },
    async deletePost(_, { postId }, context) {
      const user = authContext(context);
      //   console.log(user);

      try {
        const post = await Post.findById(postId);
        // console.log(post);
        if (user.username === post.username) {
          await post.deleteOne();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (error) {
        throw new Error(error);
      }
    },

    async likePost(_, { postId }, context) {
      const { username } = authContext(context);
      //   console.log(user);

      try {
        const post = await Post.findById(postId);

        if (post) {
          const presentLike = post.likes.find(
            (like) => like.username === username
          );
          if (presentLike) {
            post.likes = post.likes.filter(
              (like) => like.username !== username
            );
          } else {
            post.likes.push({
              username,
              createdAt: new Date().toISOString(),
            });
          }
          await post.save();
          return post;
        } else {
          throw new UserInputError("Post not found");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  // Subscription: {
  //   // newPost: {
  //   //   subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(["NEW_POST"]),
  //   // },
  // },
};
