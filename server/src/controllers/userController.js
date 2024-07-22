// controllers/userController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

// Récupération de tous les utilisateurs
export const getUsers = async (req, res) => {
  console.log('getUsers called');
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Récupération d'un utilisateur par ID
export const getUserById = async (req, res) => {
  console.log('getUserById called');
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Création d'un nouvel utilisateur
export const createUser = async (req, res) => {
  console.log('createUser called');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, shippingAddress, role } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({ firstName, lastName, email, password: hashedPassword, shippingAddress, role });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mise à jour d'un utilisateur existant
export const updateUser = async (req, res) => {
  console.log('updateUser called');
  const { firstName, lastName, email, password, shippingAddress, role } = req.body;
  try {
    const updatedUser = await User.findByPk(req.params.id);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await updatedUser.update({ firstName, lastName, email, password: hashedPassword, shippingAddress, role });
    } else {
      await updatedUser.update({ firstName, lastName, email, shippingAddress, role });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Suppression d'un utilisateur
export const deleteUser = async (req, res) => {
  console.log('deleteUser called');
  try {
    const deletedUser = await User.findByPk(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    await deletedUser.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
