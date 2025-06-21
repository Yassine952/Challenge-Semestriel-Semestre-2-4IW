import User from '../models/User.js';
import UserMongo from '../models/UserMongo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let loginAttempts = {};

const passwordResetCache = new NodeCache({ stdTTL: 15 * 60, checkperiod: 60 });

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, shippingAddress, role = 'ROLE_USER' } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ firstName, lastName, email, password: hashedPassword, shippingAddress, role });

    try {
      const userMongo = new UserMongo({
        userId: user.id, 
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
      await user.destroy();
      return res.status(500).json({ message: "Erreur lors de la synchronisation avec MongoDB" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const url = `${process.env.BASE_URL}/api/auth/confirm/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Confirmez votre compte',
      html: `Cliquez <a href="${url}">ici</a> pour confirmer votre inscription.`
    });

    res.status(201).json({ message: "veuillez vérifier votre email pour confirmer votre compte." });
  } catch (err) {
    console.error('Server Error:', err); 
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const confirmEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(400).json({ message: "Token invalide" });
    }

    user.isConfirmed = true;
    await user.save();

    const userMongo = await UserMongo.findOne({ userId: user.id });
    if (userMongo) {
      userMongo.isConfirmed = true;
      await userMongo.save();
    }

    res.status(200).json({ message: "email confirmé" });
  } catch (err) {
    console.error('Server Error:', err); 
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const currentTime = Date.now();

  if (loginAttempts[email] && loginAttempts[email].count >= 3 && currentTime - loginAttempts[email].lastAttempt < 60000) {
    await transporter.sendMail({
      to: email,
      subject: 'Compte verrouillé en raison d\'un trop grand nombre de tentatives de connexion',
      html: 'Votre compte a été verrouillé en raison d\'un trop grand nombre de tentatives de connexion. Veuillez réessayer après un certain temps.'
    });

    return res.status(403).json({ message: "Trop de tentatives de connexion. Veuillez réessayer après un certain temps." });
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
      return res.status(400).json({ message: "email ou mot de passe incorrect" });
    }

    if (!user.isConfirmed) {
      return res.status(403).json({ message: "Veuillez confirmer votre email pour vous connecter" });
    }

    loginAttempts[email] = { count: 0, lastAttempt: null };
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Server Error:', err); 
    res.status(500).json({ message: "Erreur serveur" });
  }
};

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

    const userMongo = await UserMongo.findOne({ userId: user.id });
    if (userMongo) {
      userMongo.password = hashedPassword;
      await userMongo.save();
    }

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

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
    // URL corrigée pour pointer vers le frontend
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      to: email,
      subject: 'Demande de réinitialisation de mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte Le Monde des Mugs.</p>
          <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p><strong>Ce lien expirera dans 1 heure.</strong></p>
          <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Le Monde des Mugs</p>
        </div>
      `
    });

    passwordResetCache.set(email, true);

    res.status(200).json({ message: "E-mail de réinitialisation du mot de passe envoyé" });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

cron.schedule('0 0 * * *', async () => {
  try {
    const users = await User.findAll();
    const currentTime = Date.now();

    users.forEach(async (user) => {
      if (user.passwordLastChanged) {
        const passwordAge = currentTime - new Date(user.passwordLastChanged).getTime();
        if (passwordAge > 60 * 24 * 60 * 60 * 1000) { 
          user.passwordNeedsReset = true;
          await user.save();

          const userMongo = await UserMongo.findOne({ userId: user.id });
          if (userMongo) {
            userMongo.passwordNeedsReset = true;
            await userMongo.save();
          }

          await transporter.sendMail({
            to: user.email,
            subject: 'Réinitialisation du mot de passe requise',
            html: 'Votre mot de passe doit être réinitialisé. Veuillez changer votre mot de passe.'
          });
        }
      }
    });
  } catch (err) {
    console.error('Error checking password age:', err);
  }
});
