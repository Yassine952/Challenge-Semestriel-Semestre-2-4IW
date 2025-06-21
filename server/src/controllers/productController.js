import Product from '../models/Product.js';
import ProductMongo from '../models/ProductMongo.js';
import { Op, Sequelize } from 'sequelize';
import CartItem from '../models/CartItem.js';
import Cart from '../models/Cart.js';
import mongoose from 'mongoose';
import { sendNewProductAlert, sendLowStockAlert, sendRestockAlert, sendPriceChangeAlert, checkProductStockThreshold } from './alertController.js';
import { updateProductStockRelative, recordStockMovement } from '../services/hybridStockService.js';

export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    
    const productData = { ...req.body };
    console.log(`Prix reçu: ${productData.price} (format: ${typeof productData.price})`);
    
    // Convertir le prix en centimes si reçu en euros
    if (productData.price !== undefined) {
      const priceEuros = parseFloat(productData.price);
      if (!isNaN(priceEuros)) {
        productData.price = Math.round(priceEuros * 100); // Convertir en centimes
        console.log(`Prix converti: ${priceEuros}€ -> ${productData.price} centimes`);
      }
    }
    
    // Créer le produit dans PostgreSQL avec le stock initial
    const product = await Product.create(productData);
    console.log(`✅ Produit PostgreSQL créé - ID: ${product.id}, Stock: ${product.stock}, Prix: ${product.price}`);
    
    // Créer la version MongoDB avec le même stock
    const productMongo = await ProductMongo.create({ ...productData, productId: product.id });
    console.log(`✅ Produit MongoDB créé - ProductId: ${productMongo.productId}, Stock: ${productMongo.stock}`);
    
    // 🔧 CORRECTION: Enregistrer seulement l'historique du stock initial (pas de modification du stock)
    if (productData.stock && productData.stock > 0) {
      try {
        await recordStockMovement({
          productId: product.id,
          userId: req.user?.id || 1,
          movementType: 'initial',
          quantityChange: productData.stock,
          reason: 'Stock initial lors de la création du produit',
          reference: `product-creation-${product.id}-${Date.now()}`
        });
        console.log(`✅ Historique stock initial enregistré - Produit ${product.id}: ${productData.stock} unités`);
      } catch (historyError) {
        console.error('❌ Erreur enregistrement historique stock initial:', historyError);
        // Ce n'est pas critique, on continue
      }
    }
    
    // Envoyer une alerte de nouveau produit si le produit est en vente
    if (req.body.onSale) {
      sendNewProductAlert(product).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'alerte nouveau produit:', error);
      });
    }
    
    res.status(201).json({ product, productMongo });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await ProductMongo.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await ProductMongo.findOne({ productId });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    const oldStock = product.stock;
    const oldPrice = product.price;
    const newStock = req.body.stock;
    const newPrice = req.body.price;

    // Le prix est déjà converti en centimes côté client, pas de conversion nécessaire
    const updateData = { ...req.body };
    console.log(`Mise à jour produit ${productId} - Prix reçu: ${updateData.price} centimes`);
    
    if (updateData.price !== undefined) {
      updateData.price = Math.round(parseFloat(updateData.price)); // S'assurer que c'est un entier
      console.log(`Prix final: ${updateData.price} centimes`);
    }
    
    // 🔧 CORRECTION: Utiliser l'architecture hybride relative pour les modifications de stock
    if (newStock !== undefined && newStock !== oldStock) {
      const stockChange = newStock - oldStock;
      const movementType = stockChange > 0 ? 'adjustment' : 'adjustment';
      const reason = `Mise à jour produit: ${stockChange > 0 ? 'Augmentation' : 'Diminution'} de ${Math.abs(stockChange)} unités`;
      
      try {
        await updateProductStockRelative(
          productId,
          stockChange, // Changement relatif de stock
          req.user?.id || 1, // Fallback admin user
          movementType,
          reason,
          `product-update-${Date.now()}`
        );
        console.log(`✅ Stock mis à jour via architecture hybride - Produit ${productId}: ${stockChange} unités`);
      } catch (hybridError) {
        console.error('❌ Erreur architecture hybride:', hybridError);
        // Fallback : mise à jour manuelle
        await product.update(updateData);
        const mongoProduct = await ProductMongo.findOne({ productId });
        if (mongoProduct) {
          await mongoProduct.updateOne(updateData);
        }
      }
    } else {
      // Pas de changement de stock, mise à jour classique
      await product.update(updateData);
      const mongoProduct = await ProductMongo.findOne({ productId });
      if (mongoProduct) {
        await mongoProduct.updateOne(updateData);
      }
    }

    // Rechargement du produit après mise à jour
    await product.reload();

    // ✅ GESTION AMÉLIORÉE DES ALERTES DE STOCK
    if (oldStock !== newStock) {
      // Si le stock était à 0 et maintenant > 0, envoyer alerte de restock
      if (oldStock === 0 && newStock > 0) {
        sendRestockAlert(product).catch(error => {
          console.error('Erreur lors de l\'envoi de l\'alerte restock:', error);
        });
      }
      
      // ✅ Vérification automatique du seuil de stock faible avec l'ancien stock
      checkProductStockThreshold(product, oldStock).catch(error => {
        console.error('Erreur lors de la vérification du seuil de stock:', error);
      });
    }

    // Gestion des alertes de changement de prix
    if (oldPrice !== newPrice && newPrice !== undefined) {
      sendPriceChangeAlert(product, oldPrice, newPrice).catch(error => {
        console.error('Erreur lors de l\'envoi de l\'alerte changement de prix:', error);
      });
    }

    const mongoProduct = await ProductMongo.findOne({ productId });
    res.status(200).json({ product, mongoProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    const cartItems = await CartItem.findAll({ where: { productId: product.id } });

    for (const item of cartItems) {
      const cart = await Cart.findByPk(item.cartId);
      if (cart) {
        cart.totalPrice -= item.price;
        await cart.save();
        await item.destroy();
      }
    }

    await product.destroy();

    await ProductMongo.findOneAndDelete({ productId });

    res.status(200).json({ message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const { 
      q, 
      name, 
      description, 
      category, 
      priceMin, 
      priceMax, 
      inStock, 
      onPromotion,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    console.log('🔍 Recherche produits - Paramètres reçus:', {
      q, name, description, category, priceMin, priceMax, inStock, onPromotion
    });

    // Utiliser $and pour combiner tous les filtres de manière claire
    const andConditions = [
      { onSale: true }
    ];

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: {}
    };

    // Recherche textuelle globale améliorée (nom + description)
    if (q) {
      // Nettoyer et préparer la requête de recherche
      const searchTerm = q.trim();
      
      // Utiliser directement la recherche regex (plus fiable que full-text)
      // Diviser la requête en mots pour une recherche plus flexible
      const words = searchTerm.split(/\s+/).filter(word => word.length > 0);
      
      if (words.length === 1) {
        // Recherche simple par sous-chaîne (permet "tes" de trouver "test")
        const singleWord = words[0];
        const searchConditions = [
          { name: { $regex: singleWord, $options: 'i' } },
          { description: { $regex: singleWord, $options: 'i' } }
        ];
        
        andConditions.push({ $or: searchConditions });
      } else {
        // Recherche multi-mots : tous les mots doivent être présents
        const wordRegexes = words.map(word => ({
          $or: [
            { name: { $regex: word, $options: 'i' } },
            { description: { $regex: word, $options: 'i' } }
          ]
        }));
        
        andConditions.push(...wordRegexes);
      }
    }
    
    // Filtres spécifiques
    if (name) {
      andConditions.push({ name: { $regex: name, $options: 'i' } });
    }
    if (description) {
      andConditions.push({ description: { $regex: description, $options: 'i' } });
    }
    if (category) {
      andConditions.push({ category: category });
    }
    
    // Filtres de prix - convertir les euros reçus en centimes pour la recherche
    if (priceMin || priceMax) {
      const priceCondition = {};
      
      if (priceMin) {
        // Convertir les euros en centimes (multiplier par 100)
        const minPriceEuros = parseFloat(priceMin);
        console.log(`💰 Prix min: ${priceMin} euros -> ${minPriceEuros} -> ${Math.round(minPriceEuros * 100)} centimes`);
        if (!isNaN(minPriceEuros) && minPriceEuros > 0) {
          const minPriceCents = Math.round(minPriceEuros * 100);
          priceCondition.$gte = minPriceCents;
        }
      }
      
      if (priceMax) {
        // Convertir les euros en centimes (multiplier par 100)
        const maxPriceEuros = parseFloat(priceMax);
        console.log(`💰 Prix max: ${priceMax} euros -> ${maxPriceEuros} -> ${Math.round(maxPriceEuros * 100)} centimes`);
        if (!isNaN(maxPriceEuros) && maxPriceEuros > 0) {
          const maxPriceCents = Math.round(maxPriceEuros * 100);
          priceCondition.$lte = maxPriceCents;
        }
      }
      
      // Ajouter la condition de prix seulement si elle est valide
      if (Object.keys(priceCondition).length > 0) {
        andConditions.push({ price: priceCondition });
        console.log('💰 Filtre prix ajouté:', { price: priceCondition });
      }
    }
    
    // Filtre de stock
    if (inStock !== undefined) {
      andConditions.push({ stock: inStock === 'true' ? { $gt: 0 } : { $lte: 0 } });
    }
    
    // Filtre promotion (recherche des produits avec promotions actives)
    if (onPromotion === 'true') {
      console.log('🎫 Filtre promotion activé !');
      const now = new Date();
      const PromotionMongo = (await import('../models/PromotionMongo.js')).default;
      
      const activePromotions = await PromotionMongo.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      });
      
      console.log(`🎫 Promotions actives trouvées: ${activePromotions.length}`);
      activePromotions.forEach(promo => {
        console.log(`  - ${promo.code} (${promo.applicationType}): ${promo.description}`);
      });
      
      const promotionProductIds = [];
      const promotionCategories = [];
      
      activePromotions.forEach(promo => {
        if (promo.applicationType === 'product' && promo.applicableProductIds) {
          promotionProductIds.push(...promo.applicableProductIds);
          console.log(`  → Produits ajoutés: ${promo.applicableProductIds.join(', ')}`);
        } else if (promo.applicationType === 'category' && promo.applicableCategories) {
          promotionCategories.push(...promo.applicableCategories);
          console.log(`  → Catégories ajoutées: ${promo.applicableCategories.join(', ')}`);
        }
      });
      
      console.log(`🎫 Résumé: ${promotionProductIds.length} produits, ${promotionCategories.length} catégories`);
      
      if (promotionProductIds.length > 0 || promotionCategories.length > 0 || 
          activePromotions.some(p => p.applicationType === 'all')) {
        const promotionQuery = [];
        
        if (activePromotions.some(p => p.applicationType === 'all')) {
          console.log('🎫 Promotion globale détectée → Tous les produits sont en promotion');
          // Si il y a une promotion sur tous les produits, pas besoin de filtrer
        } else {
          if (promotionProductIds.length > 0) {
            promotionQuery.push({ productId: { $in: promotionProductIds } });
          }
          if (promotionCategories.length > 0) {
            promotionQuery.push({ category: { $in: promotionCategories } });
          }
          
          if (promotionQuery.length > 0) {
            console.log('🎫 Condition promotion ajoutée:', JSON.stringify({ $or: promotionQuery }, null, 2));
            andConditions.push({ $or: promotionQuery });
          }
        }
      } else {
        console.log('🎫 Aucune promotion applicable → Retour résultat vide');
        // Aucune promotion active, retourner un résultat vide
        return res.status(200).json({ products: [], total: 0, page: parseInt(page), totalPages: 0 });
      }
    }

    // Construire la requête finale
    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    // Tri optimisé
    const sortField = sortBy === 'price' ? 'price' : 
                     sortBy === 'name' ? 'name' : 
                     sortBy === 'category' ? 'category' :
                     sortBy === 'brand' ? 'brand' : 'name';
    options.sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    console.log('🔍 Requête MongoDB finale:', JSON.stringify(query, null, 2));

    // Exécution de la requête avec pagination
    const [products, total] = await Promise.all([
      ProductMongo.find(query, null, options),
      ProductMongo.countDocuments(query)
    ]);

    console.log(`📊 Résultats: ${products.length} produits trouvés sur ${total} total`);
    if (products.length > 0) {
      console.log('📦 Premier produit:', {
        name: products[0].name,
        price: products[0].price,
        priceEuros: products[0].price / 100
      });
    }

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      products,
      total,
      page: parseInt(page),
      totalPages,
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await ProductMongo.distinct('category', { onSale: true });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer toutes les marques
export const getBrands = async (req, res) => {
  try {
    const brands = await ProductMongo.distinct('brand', { 
      onSale: true, 
      brand: { $ne: null, $ne: '' } 
    });
    res.status(200).json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductsOnSale = async (req, res) => {
  try {
    const products = await ProductMongo.find({ onSale: true });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
