import express from 'express';
import { check } from 'express-validator';
import { register, confirmEmail, login, resetPassword } from '../controllers/authController.js';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/authController.js';

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
  '/reset-password',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('newPassword', 'Password must be at least 12 characters long and contain symbols, numbers, lowercase, and uppercase letters')
      .isLength({ min: 12 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
  ],
  resetPassword
);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
