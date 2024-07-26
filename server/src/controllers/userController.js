import User from '../models/User.js';
import UserMongo from '../models/UserMongo.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

export const getUsers = async (req, res) => {
  console.log('getUsers called');
  try {
    const users = await UserMongo.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserById = async (req, res) => {
  console.log('getUserById called');
  try {
    const user = await UserMongo.findOne({ userId: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      shippingAddress,
      role,
      isConfirmed: true 
    });

    try {
      const userMongo = new UserMongo({
        userId: newUser.id,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        shippingAddress,
        role,
        isConfirmed: true
      });
      await userMongo.save();
    } catch (mongoError) {
      console.error('MongoDB Error:', mongoError);
      await newUser.destroy();
      return res.status(500).json({ message: "Erreur lors de la synchronisation avec MongoDB" });
    }

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req, res) => {
  console.log('updateUser called');
  const { firstName, lastName, email, password, shippingAddress, role } = req.body;
  try {
    const updatedUser = await User.findByPk(req.params.id);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      await updatedUser.update({ firstName, lastName, email, password: hashedPassword, shippingAddress, role });

      const userMongo = await UserMongo.findOne({ userId: updatedUser.id });
      if (userMongo) {
        userMongo.firstName = firstName;
        userMongo.lastName = lastName;
        userMongo.email = email;
        userMongo.password = hashedPassword;
        userMongo.shippingAddress = shippingAddress;
        userMongo.role = role;
        await userMongo.save();
      }
    } else {
      await updatedUser.update({ firstName, lastName, email, shippingAddress, role });

      const userMongo = await UserMongo.findOne({ userId: updatedUser.id });
      if (userMongo) {
        userMongo.firstName = firstName;
        userMongo.lastName = lastName;
        userMongo.email = email;
        userMongo.shippingAddress = shippingAddress;
        userMongo.role = role;
        await userMongo.save();
      }
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  console.log('deleteUser called');
  try {
    const deletedUser = await User.findByPk(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    await deletedUser.destroy();

    await UserMongo.findOneAndDelete({ userId: req.params.id });

    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
