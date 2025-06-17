import Promotion from '../models/Promotion.js';
import PromotionMongo from '../models/PromotionMongo.js';
import Product from '../models/Product.js';
import { Op } from 'sequelize';
export const createPromotion = async (req, res) => {
  try {
    console.log('Creating promotion with data:', req.body);
    const { startDate, endDate } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être postérieure à la date de début' 
      });
    }
    const { code } = req.body;
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      return res.status(400).json({ 
        message: 'Le code promo doit contenir uniquement des lettres majuscules et chiffres (3-20 caractères)' 
      });
    }
    const promotion = await Promotion.create(req.body);
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
export const validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal, cartItems } = req.body;
    const now = new Date();
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
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Ce code promo a atteint sa limite d\'utilisation' 
      });
    }
    if (cartTotal < promotion.minOrderAmount) {
      return res.status(400).json({ 
        valid: false, 
        message: `Montant minimum requis: ${promotion.minOrderAmount}€` 
      });
    }
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
    
    if (applicableItems.length === 0) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Ce code promo ne s\'applique à aucun produit de votre panier' 
      });
    }
    let discountAmount = 0;
    if (promotion.discountType === 'percentage') {
      discountAmount = (applicableTotal * promotion.discountValue) / 100;
    } else {
      discountAmount = promotion.discountValue;
    }
    if (promotion.maxDiscountAmount && discountAmount > promotion.maxDiscountAmount) {
      discountAmount = promotion.maxDiscountAmount;
    }
    discountAmount = Math.min(discountAmount, applicableTotal);
    let message = `Code promo appliqué ! Réduction de ${Math.round(discountAmount * 100) / 100}€`;
    if (promotion.maxDiscountAmount && discountAmount >= promotion.maxDiscountAmount) {
      message += ` (plafond maximum atteint : ${promotion.maxDiscountAmount}€)`;
    }

    res.status(200).json({
      valid: true,
      promotion: {
        id: promotion.promotionId,
        code: promotion.code,
        description: promotion.description,
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        maxDiscountAmount: promotion.maxDiscountAmount
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
      applicableItems: applicableItems.length,
      message: message
    });
    
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
export const applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;
    const [updatedRows] = await Promotion.update(
      { usageCount: Promotion.sequelize.literal('usage_count + 1') },
      { where: { code: code.toUpperCase() } }
    );
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Code promo non trouvé' });
    }
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
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.body;
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ 
        message: 'La date de fin doit être postérieure à la date de début' 
      });
    }
    const [updatedRows] = await Promotion.update(req.body, {
      where: { id: parseInt(id) }
    });
    
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Promotion non trouvée' });
    }
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
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Promotion.destroy({
      where: { id: parseInt(id) }
    });
    
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Promotion non trouvée' });
    }
    await PromotionMongo.deleteOne({ promotionId: parseInt(id) });
    
    res.status(200).json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
export const getActivePromotionsForProduct = async (req, res) => {
  try {
    const { productId, category } = req.query;
    const now = new Date();
    
    const query = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { applicationType: 'all' },
        { applicationType: 'category', applicableCategories: category },
        { applicationType: 'product', applicableProductIds: parseInt(productId) }
      ]
    };
    
    const promotions = await PromotionMongo.find(query).sort({ discountValue: -1 });
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}; 