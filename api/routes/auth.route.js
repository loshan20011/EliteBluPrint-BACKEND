import express from "express";
import {
  signup,
  signin,
  google,
  signout,
  userDelete,
  updateDetails,
  validateSignup,
  validateSignin,
} from "../controllers/auth.controller.js";

// Create a new router
const router = express.Router();

// Add a route to handle user signup
router.post("/signup",validateSignup, signup);

// add a route to handle user login
router.post("/signin", validateSignin, signin);

// add a route to handle user google authentication
router.post("/google", google);

// add a route to handle user signout
router.get("/signout", signout);

// delete user
router.delete("/delete", userDelete);

// updating user details
router.put("/update", updateDetails);

export default router;
