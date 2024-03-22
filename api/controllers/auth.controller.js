import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";

import { check, validationResult } from 'express-validator';

export const validateSignup = [
  check('username')
    .notEmpty()
    .withMessage('Username is required'),
  check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const validateSignin = [
  check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required'),
];




export const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get the name, email, role and password from the request body
  const { username, email, role, password } = req.body;

  // add hashpassword to the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // create a new user with the details
  const newUser = new User({
    name: username,
    email,
    role,
    password: hashedPassword,
  });

  try {
    // save the user to the database
    await newUser.save();

    // create a transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // send mail with defined transport object
    transporter.sendMail(
      {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Welcome to Our Platform",
        text: "Your account has been created successfully.",
        html: `
    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 10px;">
      <img src="https://lh3.googleusercontent.com/a/ACg8ocIej1cxNFTtSL7g1VqWX8jVB_xiS4ih10pmNnPxrZyHAA=s288-c-no" alt="Platform Logo" style="max-width: 100px; margin-bottom: 15px;">
      <h2 style="color: #333;">Welcome to our platform, <strong>${username}</strong>!</h2>
      <p style="color: #555; font-size: 16px;">Your account has been created successfully. We're glad to have you on board.</p>
      <p style="font-size: 24px;">🚀 Let the journey begin! 🌟</p>
      <div style="margin-top: 20px;">
        <img src="#" alt="Welcome Banner" style="max-width: 100%; border-radius: 10px;">
      </div>
    </div>
  `,
      },
      (error, info) => {
        if (error) {
          console.log("Error sending email", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
    const user = newUser._doc;

    // send a success response
    res.status(201).send({
      message: "User created successfully",
      user,
      
    });
  } catch (error) {
    // send an error response if there is an error
    console.error(error.message);

    next(error);
  }
};

export const signin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Get the email and password from the request body
  const { email, password } = req.body;

  // find the user with the email
  try {
    const validUser = await User.findOne({ email });

    // send a not found error if the user is not found
    if (!validUser) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    // compare the password with the hashed password
    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).send({
        message: "Wrong credentials",
      });
    }

    // create a token with the user id
    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET // secret key
    );
    const { password: hashedPassword, ...user } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    // send the token and user details as a response
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        expires: expiryDate,
        sameSite: "None",
      })
      .status(200)
      .send({
        message: "User logged in successfully",
        user,
      });
  } catch (error) {
    next(error); // send an error response if there is an error
  }
};


export const userDelete = async (req, res, next) => {
  const { _id } = req.body;
  // delete method
  try {
    // Find the user first
    const user = await User.findOne({ _id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { email } = user;

    // Then delete the user
    const deleteUser = await User.findOneAndDelete({ _id });

    res.status(200).json({ message: "User deleted successfully" });

    // Send an email to the user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    transporter.sendMail(
      {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Sorry to see you go...",
        html: `
          <div style="text-align: center;">
            <h1 style="color: #444;">Goodbye from EliteBluPrint</h1>
            <p style="color: #666;">
              We're sorry to see you go. Your account has been deleted successfully.
            </p>
            <p style="color: #666;">
              If you have any feedback or questions, feel free to reply to this email. We're always here to help.
            </p>
            <p style="color: #666;">
              If you change your mind, you're always welcome back.
            </p>
            <br/>
            <p style="color: #666;">
              Best regards,
            </p>
            <p style="color: #666;">
              The EliteBluPrint Team
            </p>
          </div>
        `
      },
      (error, info) => {
        if (error) {
          console.log("Error sending email", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      }
    );
  } catch (error) {
    next(error);
  }
};

export const updateDetails = async (req, res, next) => {
  const { email, name, password } = req.body;

  try {
    const updateUser = await User.findOneAndUpdate(
      { email },
      { name, password }
    );
    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  try {
    const validUser = await User.findOne({
      email: req.body.email,
    });

    if (validUser) {
      const token = jwt.sign(
        { id: validUser._id },
        process.env.JWT_SECRET // secret key
      );
      const { password: hashPassword, ...user } = validUser._doc;

      const expiryDate = new Date(Date.now() + 3600000); // 1 hour

      // send the token and user details as a response
      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          expires: expiryDate,
          sameSite: "None",
        })
        .status(200)
        .send({
          message: "User logged in successfully",
          user,
        });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);

      const hashedPassword = bcrypt.hashSync(generatedPassword, 10);

      const { name, email, photo, role } = req.body;
      console.log(req.body);
      const newUser = new User({
        name:
          name.split(" ").join("").toLowerCase() +
          Math.floor(Math.random() * 1000).toString(),
        email,
        role,
        password: hashedPassword,
        profilePicture: photo,
      });

      await newUser.save();

      // create a transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // send mail with defined transport object
      transporter.sendMail(
        {
          from: process.env.EMAIL_ADDRESS,
          to: email,
          subject: "Welcome to Our Platform",
          text: "Your account has been created successfully.",
          html: `
    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 10px;">
      <img src="https://lh3.googleusercontent.com/a/ACg8ocIej1cxNFTtSL7g1VqWX8jVB_xiS4ih10pmNnPxrZyHAA=s288-c-no" alt="Platform Logo" style="max-width: 100px; margin-bottom: 15px;">
      <h2 style="color: #333;">Welcome to our platform, <strong>${name}</strong>!</h2>
      <p style="color: #555; font-size: 16px;">Your account has been created successfully. We're glad to have you on board.</p>
      <p style="font-size: 24px;">🚀 Let the journey begin! 🌟</p>
      <div style="margin-top: 20px;">
        <img src="#" alt="Welcome Banner" style="max-width: 100%; border-radius: 10px;">
      </div>
    </div>
  `,
        },
        (error, info) => {
          if (error) {
            console.log("Error sending email", error);
          } else {
            console.log("Email sent: " + info.response);
          }
        }
      );

      const validUser = await User.findOne({
        email: req.body.email,
      });

      const token = jwt.sign(
        { id: validUser._id },
        process.env.JWT_SECRET // secret key
      );

      const expiryDate = new Date(Date.now() + 3600000); // 1 hour

      const { password: hashPassword, ...user } = validUser._doc;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true,
          expires: expiryDate,
          sameSite: "None",
        })
        .status(200)
        .send({
          message: "User created and logged in successfully",
          user,
        });
    }
  } catch (error) {
    next(error); // send an error response if there is an error
  }
};

export const signout = (req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .send("User logged out successfully");
};
