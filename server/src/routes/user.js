import express from 'express';
import { check } from 'express-validator';
import { getUsers, getUserById, createUser, updateUser, deleteUser, getNewsletterSubscribersCount } from '../controllers/userController.js';
import { authenticateToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', authorize(['ROLE_ADMIN']), getUsers);

// Route pour compter les abonnés à la newsletter (accessible aux admins et store keepers)
// IMPORTANT: Cette route doit être avant /:id pour éviter les conflits
router.get('/newsletter-subscribers-count', authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']), getNewsletterSubscribersCount);

// Route générique /:id DOIT être après toutes les routes spécifiques
router.get('/:id', authorize(['ROLE_ADMIN']), getUserById);

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 12 characters long and contain symbols, numbers, lowercase, and uppercase letters')
      .isLength({ min: 12 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
  ],
  authorize(['ROLE_ADMIN']),
  createUser
);

router.put(
  '/:id',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password')
      .optional({ checkFalsy: true })
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
      .withMessage('Password must contain symbols, numbers, lowercase, and uppercase letters')
  ],
  authorize(['ROLE_ADMIN']),
  updateUser
);

router.delete('/:id', authorize(['ROLE_ADMIN']), deleteUser);

export default router;
