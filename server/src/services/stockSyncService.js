import Product from '../models/Product.js';
import { recordStockMovement } from './stockService.js';

class StockSyncService {
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
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error(`Produit ${productId} non trouvé`);
      }

      const quantityBefore = product.stock;
      const quantityAfter = quantityBefore + quantityChange;

      if (quantityAfter < 0) {
        throw new Error(`Stock insuffisant pour le produit ${product.name}. Stock actuel: ${quantityBefore}, demandé: ${Math.abs(quantityChange)}`);
      }

      await product.update({ stock: quantityAfter });

      await recordStockMovement({
        productId,
        userId,
        movementType,
        quantityChange,
        reason,
        cost,
        reference
      });

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

  static async syncProductToMongo(product) {
    try {
      const { default: ProductMongo } = await import('../models/ProductMongo.js');
      
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

      console.log(`🔄 Produit ${product.name} synchronisé vers MongoDB (stock: ${product.stock})`);
    } catch (error) {
      console.error('❌ Erreur synchronisation MongoDB:', error);
    }
  }

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

  static async confirmSale(productId, quantity, userId, orderId) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error(`Produit ${productId} non trouvé`);
      }

      await recordStockMovement({
        productId,
        userId,
        movementType: 'sale_confirmed',
        quantityChange: 0,
        reason: `Confirmation de vente (conversion réservation → vente)`,
        reference: `order_${orderId}`
      });

      console.log(`✅ Vente confirmée - ${product.name}: ${quantity} unités (stock inchangé car déjà réservé)`);

      return {
        productId,
        productName: product.name,
        quantityBefore: product.stock,
        quantityAfter: product.stock,
        quantityChange: 0,
        movementType: 'sale_confirmed'
      };

    } catch (error) {
      console.error('❌ Erreur lors de la confirmation de vente:', error);
      throw error;
    }
  }

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