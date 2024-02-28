import express from 'express';
import { resetPassword } from '../controllers/reset.controller.js';

const router = express.Router();

router.post('/resetpassword', resetPassword);

export default router;