// routes/profile.js
import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getUserProfile);
router.put('/', authenticateToken, updateUserProfile);

export default router;
