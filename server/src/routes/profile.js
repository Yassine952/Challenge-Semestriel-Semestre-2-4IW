import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken);
router.get('/', getUserProfile);
router.put('/', updateUserProfile);

export default router;
