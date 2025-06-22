import sequelize from './src/config/database.js';
import Promotion from './src/models/Promotion.js';

const createTestPromotion = async () => {
  try {
    console.log('🎫 Création d\'une promotion de test...');

    // Vérifier si une promotion existe déjà
    const existingPromo = await Promotion.findOne({
      where: { code: 'WELCOME10' }
    });

    if (existingPromo) {
      console.log('✅ Promotion WELCOME10 existe déjà');
      console.log(`   ID: ${existingPromo.promotionId}`);
      console.log(`   Statut: ${existingPromo.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Réduction: ${existingPromo.discountValue}${existingPromo.discountType === 'percentage' ? '%' : '€'}`);
      return;
    }

    // Créer une nouvelle promotion
    const promotion = await Promotion.create({
      code: 'WELCOME10',
      description: 'Promotion de bienvenue - 10% de réduction',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0, // Pas de minimum
      maxDiscountAmount: 50, // Maximum 50€ de réduction
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      usageLimit: null, // Illimité
      usageCount: 0,
      applicationType: 'all', // Applicable à tous les produits
      isActive: true
    });

    console.log('✅ Promotion créée avec succès !');
    console.log(`   ID: ${promotion.promotionId}`);
    console.log(`   Code: ${promotion.code}`);
    console.log(`   Réduction: ${promotion.discountValue}%`);
    console.log(`   Valide jusqu'au: ${promotion.endDate.toLocaleDateString('fr-FR')}`);

    // Créer une deuxième promotion
    const promotion2 = await Promotion.create({
      code: 'PROMO20',
      description: 'Super promotion - 20% de réduction',
      discountType: 'percentage',
      discountValue: 20,
      minOrderAmount: 100, // Minimum 100€
      maxDiscountAmount: 100, // Maximum 100€ de réduction
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      usageLimit: 50, // Limité à 50 utilisations
      usageCount: 0,
      applicationType: 'all',
      isActive: true
    });

    console.log('✅ Deuxième promotion créée !');
    console.log(`   ID: ${promotion2.promotionId}`);
    console.log(`   Code: ${promotion2.code}`);
    console.log(`   Réduction: ${promotion2.discountValue}%`);
    console.log(`   Minimum: ${promotion2.minOrderAmount}€`);

  } catch (error) {
    console.error('❌ Erreur lors de la création de la promotion:', error);
  } finally {
    await sequelize.close();
  }
};

createTestPromotion(); 