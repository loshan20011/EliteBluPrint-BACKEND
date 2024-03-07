import express from "express";
import {
  signup,
  signin,
  google,
  signout,
  userDelete,
  updateDetails,
} from "../controllers/auth.controller.js";

// Create a new router
const router = express.Router();

// Add a route to handle user signup
router.post("/signup", signup);

// add a route to handle user login
router.post("/signin", signin);

// add a route to handle user google authentication
router.post("/google", google);

// add a route to handle user signout
router.get("/signout", signout);

// delete user
router.delete("/delete", userDelete);

// updating user details
router.put("/update", updateDetails);

export default router;
