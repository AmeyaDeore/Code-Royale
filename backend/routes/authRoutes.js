import express from 'express';
import { registerUser, loginUser, startGoogleAuth, googleAuthCallback } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/google', startGoogleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
