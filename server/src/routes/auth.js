import express from 'express';
import { check } from 'express-validator';
import { register, confirmEmail, login, getUsers, getUserById, createUser, updateUser, deleteUser, resetPasswordWithToken, forgotPassword } from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 12 characters long and contain symbols, numbers, lowercase, and uppercase letters')
      .isLength({ min: 12 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
  ],
  register
);

router.get('/confirm/:token', confirmEmail);
router.post('/login', login);

router.post(
  '/reset-password/:token',
  [
    check('newPassword', 'Password must be at least 12 characters long and contain symbols, numbers, lowercase, and uppercase letters')
      .isLength({ min: 12 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
  ],
  resetPasswordWithToken
);

router.post('/forgot-password', forgotPassword);

router.get('/', getUsers); // Correction ici
router.get('/:id', getUserById); // Correction ici
router.post('/', createUser); // Correction ici
router.put('/:id', updateUser); // Correction ici
router.delete('/:id', deleteUser); // Correction ici

export default router;
