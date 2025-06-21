import Promotion from '../models/Promotion.js';
import PromotionMongo from '../models/PromotionMongo.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';

// Créer une promotion
export const createPromotion = async (req, res) => {
  try {
    console.log('Creating promotion with data:', req.body);
    
    // Validation des dates
    const { startDate, endDate } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être postérieure à la date de début' 
      });
    }

    // Validation du code promo (format)
    const { code } = req.body;
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      return res.status(400).json({ 
        message: 'Le code promo doit contenir uniquement des lettres majuscules et chiffres (3-20 caractères)' 
      });
    }

    // Créer dans PostgreSQL
    const promotion = await Promotion.create(req.body);
    
    // Synchroniser avec MongoDB
    const promotionMongo = await PromotionMongo.create({
      ...req.body,
      promotionId: promotion.id
    });
    
    res.status(201).json({ promotion, promotionMongo });
  } catch (error) {
    console.error('Error creating promotion:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ce code promo existe déjà' });
    }
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer toutes les promotions
export const getPromotions = async (req, res) => {
  try {
    const { active, expired } = req.query;
    const now = new Date();
    
    let query = {};
    
    if (active === 'true') {
      query = {
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      };
    } else if (expired === 'true') {
      query = {
        endDate: { $lt: now }
      };
    }
    
    const promotions = await PromotionMongo.find(query).sort({ createdAt: -1 });
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer une promotion par ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await PromotionMongo.findOne({ promotionId: parseInt(id) });
    
    if (!promotion) {
      return res.status(404).json({ message: 'Promotion non trouvée' });
    }
    
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Valider un code promo
export const validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body;
    const now = new Date();
    
    console.log('🔍 DEBUG PROMO VALIDATION:');
    console.log('   Code:', code);
    console.log('   CartTotal reçu:', cartTotal);
    console.log('   CartItems:', cartItems?.length, 'items');
    if (cartItems?.length > 0) {
      console.log('   Premier item:', JSON.stringify(cartItems[0], null, 2));
    }
    
    // Rechercher la promotion
    const promotion = await PromotionMongo.findOne({
      code: code.toUpperCase(),
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
    
    if (!promotion) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Code promo invalide ou expiré' 
      });
    }
    
    console.log('🎫 Promotion trouvée:');
    console.log('   Type:', promotion.discountType);
    console.log('   Valeur:', promotion.discountValue);
    console.log('   Plafond max:', promotion.maxDiscountAmount);
    console.log('   Type application:', promotion.applicationType);
    
    // Vérifier la limite d'utilisation
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Ce code promo a atteint sa limite d\'utilisation' 
      });
    }
    
    // Vérifier le montant minimum (convertir en centimes pour la comparaison)
    const minOrderAmountInCentimes = promotion.minOrderAmount * 100;
    console.log('💳 Vérification montant minimum:');
    console.log('   CartTotal (centimes):', cartTotal);
    console.log('   Minimum requis (euros):', promotion.minOrderAmount);
    console.log('   Minimum requis (centimes):', minOrderAmountInCentimes);
    
    if (cartTotal < minOrderAmountInCentimes) {
      return res.status(400).json({ 
        valid: false, 
        message: `Montant minimum requis: ${promotion.minOrderAmount}€` 
      });
    }
    
    // Vérifier l'applicabilité (catégorie/produit)
    let applicableItems = [];
    let applicableTotal = 0;
    
    if (promotion.applicationType === 'all') {
      applicableItems = cartItems;
      applicableTotal = cartTotal;
    } else if (promotion.applicationType === 'category') {
      applicableItems = cartItems.filter(item => 
        promotion.applicableCategories.includes(item.Product.category)
      );
      applicableTotal = applicableItems.reduce((sum, item) => sum + item.price, 0);
    } else if (promotion.applicationType === 'product') {
      applicableItems = cartItems.filter(item => 
        promotion.applicableProductIds.includes(item.Product.id)
      );
      applicableTotal = applicableItems.reduce((sum, item) => sum + item.price, 0);
    }
    
    console.log('💰 Calcul applicabilité:');
    console.log('   Items applicables:', applicableItems.length);
    console.log('   Total applicable:', applicableTotal);
    
    if (applicableItems.length === 0) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Ce code promo ne s\'applique à aucun produit de votre panier' 
      });
    }
    
    // Calculer la réduction
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (applicableTotal * promotion.discountValue) / 100;
      console.log('🧮 Calcul pourcentage:');
      console.log('   Formule:', `${applicableTotal} * ${promotion.discountValue} / 100`);
      console.log('   Résultat brut:', discountAmount);
    } else {
      discountAmount = promotion.discountValue;
      console.log('🧮 Calcul fixe:', discountAmount);
    }
    
    // Appliquer la limite maximale de réduction
    if (promotion.maxDiscountAmount && discountAmount > (promotion.maxDiscountAmount * 100)) {
      const maxDiscountInCentimes = promotion.maxDiscountAmount * 100;
      console.log('🚫 Plafond appliqué:', `${discountAmount} → ${maxDiscountInCentimes} (${promotion.maxDiscountAmount}€)`);
      discountAmount = maxDiscountInCentimes;
    }
    
    // S'assurer que la réduction ne dépasse pas le total applicable
    discountAmount = Math.min(discountAmount, applicableTotal);
    console.log('✅ Réduction finale:', discountAmount);
    
    // Générer le message avec plafond si applicable
    let message = `Code promo appliqué ! Réduction de ${Math.round(discountAmount) / 100}€`;
    if (promotion.maxDiscountAmount && discountAmount >= (promotion.maxDiscountAmount * 100)) {
      message += ` (plafond maximum atteint : ${promotion.maxDiscountAmount}€)`;
    }

    const result = {
      valid: true,
      promotion: {
        id: promotion.promotionId,
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount
      },
      discountAmount: Math.round(discountAmount) / 100,
      applicableItems: applicableItems.length,
      message: message
    };
    
    console.log('📤 Réponse envoyée:', JSON.stringify(result, null, 2));
    res.status(200).json(result);
    
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Appliquer un code promo (incrémenter le compteur d'utilisation)
export const applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Mettre à jour dans PostgreSQL
    const [updatedRows] = await Promotion.update(
      { usageCount: Promotion.sequelize.literal('usage_count + 1') },
      { where: { code: code.toUpperCase() } }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
    
    // Synchroniser avec MongoDB
    await PromotionMongo.updateOne(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } }
    );
    
    res.status(200).json({ message: 'Code promo appliqué avec succès' });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour une promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validation des dates si modifiées
    const { startDate, endDate } = req.body;
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être postérieure à la date de début' 
      });
    }
    
    // Mettre à jour dans PostgreSQL
    const [updatedRows] = await Promotion.update(req.body, {
      where: { id: parseInt(id) }
    });
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Promotion non trouvée' });
    }
    
    // Synchroniser avec MongoDB
    await PromotionMongo.updateOne(
      { promotionId: parseInt(id) },
      req.body
    );
    
    const updatedPromotion = await PromotionMongo.findOne({ promotionId: parseInt(id) });
    res.status(200).json(updatedPromotion);
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supprimer de PostgreSQL
    const deletedRows = await Promotion.destroy({
      where: { id: parseInt(id) }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Promotion non trouvée' });
    }
    
    // Supprimer de MongoDB
    await PromotionMongo.deleteOne({ promotionId: parseInt(id) });
    
    res.status(200).json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer les promotions actives pour un produit/catégorie
export const getActivePromotionsForProduct = async (req, res) => {
  try {
    const { productId, category } = req.query;
    const now = new Date();
    
    // Construire les conditions de la requête
    const orConditions = [
      { applicationType: 'all' }
    ];
    
    // Ajouter la condition catégorie si fournie
    if (category) {
      orConditions.push({ 
        applicationType: 'category', 
        applicableCategories: category 
      });
    }
    
    // Ajouter la condition produit si fournie et valide
    if (productId && !isNaN(parseInt(productId))) {
      orConditions.push({ 
        applicationType: 'product', 
        applicableProductIds: parseInt(productId) 
      });
    }
    
    const query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: orConditions
    };
    
    const promotions = await PromotionMongo.find(query).sort({ discountValue: -1 });
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}; 