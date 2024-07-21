import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import NodeCache from 'node-cache';
import sequelize from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

// Configuration du transporteur de courrier électronique
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Temporisation après tentatives de connexion infructueuses
let loginAttempts = {};

// Cache pour les demandes de réinitialisation de mot de passe
const passwordResetCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 60 }); // TTL de 15 minutes

// Inscription de l'utilisateur avec confirmation par email
export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, shippingAddress } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hashedPassword, shippingAddress });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const url = `${process.env.BASE_URL}/api/auth/confirm/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Confirm your email',
      html: `Click <a href="${url}">here</a> to confirm your email.`
    });

    res.status(201).json({ message: "User registered, please check your email to confirm your account." });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Confirmation de l'email de l'utilisateur
export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isConfirmed = true;
    await user.save();

    res.status(200).json({ message: "Email confirmed" });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Connexion de l'utilisateur avec gestion des tentatives infructueuses
export const login = async (req, res) => {
  const { email, password } = req.body;
  const currentTime = Date.now();

  if (loginAttempts[email] && loginAttempts[email].count >= 3 && currentTime - loginAttempts[email].lastAttempt < 60000) {
    // Envoyer un email pour notifier l'utilisateur de trop de tentatives infructueuses
    await transporter.sendMail({
      to: email,
      subject: 'Account Locked Due to Too Many Login Attempts',
      html: 'Your account has been locked due to too many login attempts. Please try again after some time.'
    });

    return res.status(403).json({ message: "Too many login attempts. Please try again after some time." });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 1, lastAttempt: currentTime };
      } else {
        loginAttempts[email].count += 1;
        loginAttempts[email].lastAttempt = currentTime;
      }
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ message: "Please confirm your email to login" });
    }

    loginAttempts[email] = { count: 0, lastAttempt: null };
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Récupération de tous les utilisateurs
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error); // Ajout de log
    res.status(500).json({ message: 'Server error' });
  }
};

// Récupération d'un utilisateur par ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error); // Ajout de log
    res.status(500).json({ message: 'Server error' });
  }
};

// Création d'un nouvel utilisateur
export const createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error); // Ajout de log
    res.status(500).json({ message: 'Server error' });
  }
};

// Mise à jour d'un utilisateur existant
export const updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByPk(req.params.id);
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    await updatedUser.update(req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error); // Ajout de log
    res.status(500).json({ message: 'Server error' });
  }
};

// Suppression d'un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByPk(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    await deletedUser.destroy();
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error); // Ajout de log
    res.status(500).json({ message: 'Server error' });
  }
};

// Réinitialisation du mot de passe avec le token
export const resetPasswordWithToken = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Jeton invalide ou utilisateur introuvable" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordLastChanged = Date.now();
    await user.save();

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: "Server error" });
  }
};


// Demande de réinitialisation de mot de passe
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "User non trouvé" });
    }

    if (passwordResetCache.get(email)) {
      return res.status(429).json({ message: "Demande de réinitialisation du mot de passe déjà effectuée. Veuillez attendre 15 minutes avant de réessayer." });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetUrl = `${process.env.BASE_URL}/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Demande de réinitialisation de mot de passe',
      html: `Cliquez <a href="${resetUrl}">ici</a> pour réinitialiser votre mot de passe.`
    });

    // Stocker la demande de réinitialisation dans le cache
    passwordResetCache.set(email, true);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: "Server error" });
  }
};


// Planification de la vérification du renouvellement de mot de passe
cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.findAll();
    const currentTime = Date.now();

    users.forEach(async (user) => {
      if (user.passwordLastChanged) {
        const passwordAge = currentTime - new Date(user.passwordLastChanged).getTime();
        if (passwordAge > 60 * 24 * 60 * 60 * 1000) { // 60 jours en millisecondes
          user.passwordNeedsReset = true;
          await user.save();
          // Envoyer un email pour notifier l'utilisateur de changer son mot de passe
          await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Required',
            html: 'Your password needs to be reset. Please change your password.'
          });
        }
      }
    });
  } catch (err) {
    console.error('Error checking password age:', err);
  }
});
