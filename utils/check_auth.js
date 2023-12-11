import jwt from "jsonwebtoken";
import { AuthenticationError } from "apollo-server-errors";
import { SECRET_KEY } from "../config.js";

export const authContext = (context) => {
  const authHeader = context.authScope;
//   console.log(authHeader);
  if (authHeader) {
    // bearer...
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token] ");
  }
  throw new Error("Authorization header must be provided ");
};
