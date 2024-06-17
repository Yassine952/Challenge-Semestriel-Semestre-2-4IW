import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'your-jwt-secret', { expiresIn: '1d' });
    const url = `http://localhost:8000/api/auth/confirm/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`
    });

    res.status(201).send("User registered, please check your email to confirm your account.");
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send("Server error");
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, 'your-jwt-secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    user.isConfirmed = true;
    await user.save();

    res.status(200).send("Email confirmed");
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send("Server error");
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send("Invalid credentials");
    }

    if (!user.isConfirmed) {
      return res.status(403).send("Please confirm your email to login");
    }

    const token = jwt.sign({ userId: user._id }, 'your-jwt-secret', { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send("Server error");
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send("Password reset successfully");
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send("Server error");
  }
};
