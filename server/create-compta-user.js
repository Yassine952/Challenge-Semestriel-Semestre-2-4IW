import bcrypt from 'bcryptjs';
import User from './src/models/User.js';
import sequelize from './src/config/database.js';

const createComptaUser = async () => {
  try {
    // Synchroniser la base de données
    await sequelize.sync();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email: 'compta@lemondedesmugs.fr' } });
    
    if (existingUser) {
      console.log('Utilisateur comptabilité existe déjà !');
      console.log('Email: compta@lemondedesmugs.fr');
      console.log('Mot de passe: ComptaMugs2024!');
      return;
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('ComptaMugs2024!', 10);
    
    // Créer l'utilisateur comptable
    const comptaUser = await User.create({
      email: 'compta@lemondedesmugs.fr',
      password: hashedPassword,
      first_name: 'Comptable',
      last_name: 'Le Monde des Mugs',
      role: 'ROLE_COMPTA'
    });
    
    console.log('✅ Utilisateur comptabilité créé avec succès !');
    console.log('📧 Email: compta@lemondedesmugs.fr');
    console.log('🔐 Mot de passe: ComptaMugs2024!');
    console.log('👤 Rôle: ROLE_COMPTA');
    console.log('🆔 ID:', comptaUser.id);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur comptabilité:', error);
  } finally {
    await sequelize.close();
  }
};

createComptaUser(); 