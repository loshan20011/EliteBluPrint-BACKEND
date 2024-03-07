// import packages to the file
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import forgotPasswordRoute from './routes/forgotPassword.js';
import passwordRoutes from './routes/reset.route.js';


// Load environment variables
dotenv.config();

// Use the PORT from environment variables or default to 3000
const port = process.env.PORT || 3000;

// create an express application
const app = express();

// middleware for handling parsing request body
app.use(express.json());

// middleware for handling CORS
app.use(cors());

// Add the user routes to the express application
app.use('/api/user', userRoutes);

// Add the auth routes to the express application
app.use('/api/auth', authRoutes);

app.use('/forgotpassword', forgotPasswordRoute);

app.use('/api/password', passwordRoutes);

// connect to the database
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Database connected");

    // listening to the running port
    app.listen(port, () => {
      console.log(`Server running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to database", error);
  });

// Add a default route
app.get("/", (req, res) => {
  res.status(200).send("Welcome to EliteBluPrint!");
});

// Add error handling for express app setup
app.on('error', (err) => {
    console.error('Express App Error:', err.message);
});

// Add error handling middleware
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({
        success: false,
        status,
        message,
    });
});