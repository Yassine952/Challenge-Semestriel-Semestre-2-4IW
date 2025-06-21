// Service de synchronisation des stocks PostgreSQL ↔ MongoDB
import Product from '../models/Product.js';
import { recordStockMovement } from './stockService.js';

class StockSyncService {
  /**
   * Met à jour le stock d'un produit et synchronise avec MongoDB
   * @param {number} productId - ID du produit
   * @param {number} quantityChange - Changement de quantité (+ ou -)
   * @param {string} movementType - Type de mouvement (sale, purchase, adjustment, etc.)
   * @param {number} userId - ID de l'utilisateur qui fait l'action
   * @param {string} reason - Raison du mouvement
   * @param {number} cost - Coût unitaire (optionnel)
   * @param {string} reference - Référence (commande, etc.)
   */
  static async updateStock({
    productId,
    quantityChange,
    movementType,
    userId,
    reason,
    cost = null,
    reference = null
  }) {
    try {
      // 1. Récupérer le produit
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error(`Produit ${productId} non trouvé`);
      }

      const quantityBefore = product.stock;
      const quantityAfter = quantityBefore + quantityChange;

      // 2. Vérifier que le stock ne devient pas négatif
      if (quantityAfter < 0) {
        throw new Error(`Stock insuffisant pour le produit ${product.name}. Stock actuel: ${quantityBefore}, demandé: ${Math.abs(quantityChange)}`);
      }

      // 3. Mettre à jour le stock dans PostgreSQL
      await product.update({ stock: quantityAfter });

      // 4. Enregistrer le mouvement dans l'historique
      await recordStockMovement({
        productId,
        userId,
        movementType,
        quantityChange,
        reason,
        cost,
        reference
      });

      // 5. Synchroniser avec MongoDB
      await this.syncProductToMongo(product);

      console.log(`✅ Stock synchronisé - ${product.name}: ${quantityBefore} → ${quantityAfter} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);

      return {
        productId,
        productName: product.name,
        quantityBefore,
        quantityAfter,
        quantityChange,
        movementType
      };

    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation du stock:', error);
      throw error;
    }
  }

  /**
   * Synchronise un produit vers MongoDB
   */
  static async syncProductToMongo(product) {
    try {
      const { default: ProductMongo } = await import('../models/ProductMongo.js');
      
      // Mettre à jour ou créer le produit dans MongoDB
      await ProductMongo.findOneAndUpdate(
        { productId: product.id },
        {
          productId: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock, // ← IMPORTANT: Synchroniser le stock
          category: product.category,
          brand: product.brand,
          onSale: product.onSale,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`🔄 Produit ${product.name} synchronisé vers MongoDB (stock: ${product.stock})`);
    } catch (error) {
      console.error('❌ Erreur synchronisation MongoDB:', error);
      // Ne pas faire échouer la transaction principale
    }
  }

  /**
   * Synchronise tous les produits vers MongoDB
   */
  static async syncAllProductsToMongo() {
    try {
      console.log('🔄 Synchronisation complète PostgreSQL → MongoDB...');
      
      const products = await Product.findAll();
      const { default: ProductMongo } = await import('../models/ProductMongo.js');

      for (const product of products) {
        await ProductMongo.findOneAndUpdate(
          { productId: product.id },
          {
            productId: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: product.category,
            brand: product.brand,
            onSale: product.onSale,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      console.log(`✅ ${products.length} produits synchronisés vers MongoDB`);
    } catch (error) {
      console.error('❌ Erreur synchronisation complète:', error);
      throw error;
    }
  }

  /**
   * Réserve du stock temporairement (pour le panier)
   */
  static async reserveStock(productId, quantity, userId, cartId) {
    return await this.updateStock({
      productId,
      quantityChange: -quantity,
      movementType: 'reservation',
      userId,
      reason: `Réservation panier ${cartId}`,
      reference: `cart_${cartId}`
    });
  }

  /**
   * Libère du stock réservé (panier expiré/annulé)
   */
  static async releaseStock(productId, quantity, userId, cartId) {
    return await this.updateStock({
      productId,
      quantityChange: quantity,
      movementType: 'release',
      userId,
      reason: `Libération panier ${cartId}`,
      reference: `cart_${cartId}`
    });
  }

  /**
   * Confirme une vente (panier → commande)
   * Ne change pas le stock car il a déjà été réservé lors de l'ajout au panier
   */
  static async confirmSale(productId, quantity, userId, orderId) {
    try {
      // 1. Récupérer le produit pour les infos
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error(`Produit ${productId} non trouvé`);
      }

      // 2. Enregistrer le mouvement de confirmation sans changer le stock
      // Car le stock a déjà été réservé lors de l'ajout au panier
      await recordStockMovement({
        productId,
        userId,
        movementType: 'sale_confirmed',
        quantityChange: 0, // ← IMPORTANT: Pas de changement de stock
        reason: `Confirmation de vente (conversion réservation → vente)`,
        reference: `order_${orderId}`
      });

      console.log(`✅ Vente confirmée - ${product.name}: ${quantity} unités (stock inchangé car déjà réservé)`);

      return {
        productId,
        productName: product.name,
        quantityBefore: product.stock,
        quantityAfter: product.stock, // Même stock
        quantityChange: 0,
        movementType: 'sale_confirmed'
      };

    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de vente:', error);
      throw error;
    }
  }

  /**
   * Retour produit (remboursement)
   */
  static async returnProduct(productId, quantity, userId, orderId) {
    return await this.updateStock({
      productId,
      quantityChange: quantity,
      movementType: 'return',
      userId,
      reason: `Retour produit`,
      reference: `return_${orderId}`
    });
  }
}

export default StockSyncService; 