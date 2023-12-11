import jwt from "jsonwebtoken";
import { ApolloError } from "apollo-server-errors";

const authContext = (context) => {
  const authHeader = context.req.headers.authrozizaton;

  if (authHeader) {
    const token = authHeader.split("Bearer")[1];
    if (token) {
      try {
        const user = jwt.verify(token, "UNSAFE_STRING");
        return user;
      } catch (error) {
        throw new ApolloError("Invalid/expried token");
      }
    }

    throw new Error("Authentication token musebe Bearer [token]");
  }
  throw new Error("Authentication header must be provided");
};

export default authContext