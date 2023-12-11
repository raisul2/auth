import { ApolloError, UserInputError } from "apollo-server-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import { SECRET_KEY } from "../../config.js";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../../utils/validator.js";

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    {
      expiresIn: "2h",
    }
  );
}

const userResolvers = {
  Mutation: {
    async registerUser(
      _,
      { registerINput: { username, email, password, confirmPassword } }
    ) {
      // see if an old user exists email
      const { errors, valid } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      const oldUser = await User.findOne({ email });
      //throw error if that suer extis
      if (oldUser) {
        throw new UserInputError(
          `A user is already registerd with the email ${email}`,
          {
            errors: {
              email: "this email is taken",
            },
          }
        );
      }
      //encretpt password
      const encryptedPassword = await bcrypt.hash(password, 10);

      //buld mongsoe model
      const newUser = new User({
        email,
        username,
        password: encryptedPassword,
        createAt: new Date().toISOString(),
      });
      //create ouser jwt token
      const res = await newUser.save();
      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

    async loginUser(_, { loginInput: { email, password } }) {
      // see if a user exists with the email
      const { errors, valid } = validateLoginInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ email });
      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("user not found", { errors });
      }

      // check if the enterd passwored equalts to encrep password
      const matchPassword = await bcrypt.compare(password, user.password);
      if (!matchPassword) {
        errors.general = "Wrong crendtials";
        throw new UserInputError("Wrong crendtials", { errors });
      }

      //create a new token
      const token = generateToken(user);
      //atchech token to user model the we found avabe
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
 
  Query: {
    getUser: (_, { ID }) => {
      User.FindById(ID);
    },
  },
};

export default userResolvers;
