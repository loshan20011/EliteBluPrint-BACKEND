import express from 'express';
import User from '../models/user.model.js';
import { getArchitects , getUsers} from '../controllers/user.controller.js';

// Create a new router
const router = express.Router();

// Add a route to get all users
router.get('/architectpanel', getArchitects);

// Add a route to get all users
router.get('/usernames', getUsers);

export default router;