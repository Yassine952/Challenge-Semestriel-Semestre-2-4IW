import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth.js';
import {
  monitorPerformance,
  postgresqlFallback,
  verifyStockConsistency,
  recordSaleMovement,
  recordPurchaseMovement,
  recordAdjustmentMovement
} from '../middleware/hybridStock.js';

// 🔥 CONTRÔLEURS HYBRIDES (Écriture Double)
import {
  getStockEvolutionChartMongo,
  getProductStockEvolutionMongo,
  getAdvancedStockStatsMongo,
  getLowStockWithContextMongo,
  getPerformanceComparison
} from '../controllers/stockControllerMongo.js';

import {
  recordManualStockMovement,
  getStockEvolutionChart,
  getProductStockEvolution,
  getStockMovementsStats,
  getStockMovementHistory,
  getLowStockWithHistory,
  debugStockCalculation
} from '../controllers/stockController.js';

import {
  getGlobalStockEvolution
} from '../services/hybridStockService.js';

import ProductMongo from '../models/ProductMongo.js';

const router = express.Router();

/**
 * 🚀 ROUTES HYBRIDES - ÉCRITURE DOUBLE PostgreSQL + MongoDB
 * ✅ Écrit automatiquement dans les 2 bases
 * ✅ Lit depuis MongoDB (ultra-rapide)
 * ✅ PostgreSQL reste la source de vérité
 */

// Middlewares globaux pour toutes les routes stock
router.use(monitorPerformance);
router.use(postgresqlFallback);

/**
 * 📊 GRAPHIQUES & ANALYTICS (Lecture MongoDB)
 */

// Évolution globale des stocks
router.get('/evolution-chart', 
  authenticateToken,
  authorize(['ROLE_ADMIN', 'ROLE_STORE_KEEPER']),
  async (req, res) => {
    try {
      const { period = '3m' } = req.query;
      
      // 🔥 NOUVEAU: Récupérer l'évolution de chaque produit séparément
      const StockHistoryMongo = (await import('../models/StockHistoryMongo.js')).default;
      const ProductMongo = (await import('../models/ProductMongo.js')).default;

      // Récupérer tous les produits
      const products = await ProductMongo.find({}, { productId: 1, name: 1, stock: 1 });
      console.log(`📊 Produits trouvés: ${products.length}`);

      // Calculer la période de recherche
      const now = new Date();
      let startDate;
      switch (period) {
        case '5m':
          startDate = new Date(now.getTime() - 5 * 60 * 1000);
          break;
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '1d':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '1w':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '1m':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3m':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6m':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 5 * 60 * 1000);
      }

      // 🔧 NOUVELLE LOGIQUE: Calcul intelligent de l'évolution des stocks
      const productEvolutions = await Promise.all(
        products.map(async (product) => {
          try {
            // 1. Récupérer TOUT l'historique du produit (pas seulement la période)
            const allHistory = await StockHistoryMongo.find({
              productId: product.productId
            }).sort({ createdAt: 1 });

            // 2. Définir le nombre de points selon la période
            const numberOfPoints = {
              '5m': 6,
              '1h': 7,
              '1d': 8,
              '1w': 7,
              '1m': 10,
              '3m': 12,
              '6m': 15,
              '1y': 20
            }[period] || 10;

            // 3. Créer les points de temps uniformément répartis
            const timePoints = [];
            const timeInterval = (now.getTime() - startDate.getTime()) / (numberOfPoints - 1);
            
            for (let i = 0; i < numberOfPoints; i++) {
              timePoints.push(new Date(startDate.getTime() + (timeInterval * i)));
            }

            // 4. Calculer le stock à chaque point de temps
            const dataPoints = timePoints.map(pointTime => {
              // Trouver le stock à ce moment précis en rejouant l'historique
              let stockAtTime = 0;
              
              // Trouver le mouvement initial
              const initialMovement = allHistory.find(m => m.movementType === 'initial');
              if (initialMovement) {
                // Si le point est après le stock initial, commencer par le stock initial
                if (pointTime >= initialMovement.createdAt) {
                  stockAtTime = initialMovement.quantityAfter;
                  
                  // Appliquer tous les mouvements entre le stock initial et ce point
                  const movementsUntilPoint = allHistory.filter(m => 
                    m.createdAt > initialMovement.createdAt && 
                    m.createdAt <= pointTime &&
                    m.movementType !== 'initial'
                  );
                  
                  movementsUntilPoint.forEach(movement => {
                    stockAtTime += movement.quantityChange;
                  });
                } else {
                  // Point avant le stock initial = 0
                  stockAtTime = 0;
                }
              } else {
                // Pas de stock initial, calculer depuis le début
                const movementsUntilPoint = allHistory.filter(m => m.createdAt <= pointTime);
                stockAtTime = movementsUntilPoint.reduce((stock, movement) => {
                  return stock + movement.quantityChange;
                }, 0);
              }

              return {
                date: pointTime,
                stock: Math.max(0, stockAtTime) // Éviter les stocks négatifs dans l'affichage
              };
            });

            console.log(`📊 ${product.name}: Généré ${dataPoints.length} points, stock actuel calculé: ${dataPoints[dataPoints.length - 1].stock}, stock DB: ${product.stock}`);

            return {
              productId: product.productId,
              productName: product.name,
              currentStock: product.stock,
              dataPoints: dataPoints,
              historyCount: allHistory.length
            };
          } catch (error) {
            console.warn(`⚠️ Erreur pour produit ${product.name}:`, error.message);
            
            // Fallback: créer des points avec le stock actuel
            const numberOfPoints = 6;
            const timeInterval = (now.getTime() - startDate.getTime()) / (numberOfPoints - 1);
            const fallbackPoints = [];
            
            for (let i = 0; i < numberOfPoints; i++) {
              fallbackPoints.push({
                date: new Date(startDate.getTime() + (timeInterval * i)),
                stock: product.stock
              });
            }
            
            return {
              productId: product.productId,
              productName: product.name,
              currentStock: product.stock,
              dataPoints: fallbackPoints,
              historyCount: 0
            };
          }
        })
      );

      // 🔧 NOUVELLE LOGIQUE SIMPLIFIÉE: Tous les produits ont les mêmes points de temps
      // Utiliser les points de temps du premier produit comme référence
      const referencePoints = productEvolutions[0]?.dataPoints || [];
      
      // Couleurs pour chaque produit
      const colors = [
        'rgb(59, 130, 246)',   // Bleu
        'rgb(34, 197, 94)',    // Vert
        'rgb(249, 115, 22)',   // Orange
        'rgb(168, 85, 247)',   // Violet
        'rgb(239, 68, 68)',    // Rouge
        'rgb(20, 184, 166)',   // Teal
        'rgb(245, 158, 11)',   // Amber
        'rgb(236, 72, 153)'    // Pink
      ];

      // Créer les datasets pour Chart.js
      const datasets = productEvolutions.map((product, index) => {
        const color = colors[index % colors.length];
        
        // Extraire directement les valeurs de stock
        const data = product.dataPoints.map(point => point.stock);

        return {
          label: product.productName,
          data: data,
          borderColor: color,
          backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          tension: 0.3,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2
        };
      });

      // Formater les dates pour l'affichage selon la période
      const labels = referencePoints.map(point => {
        const dateObj = point.date;
        if (period === '5m') {
          // Pour 5 minutes, afficher heure:minute:seconde
          return dateObj.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          });
        } else if (period === '1h' || period === '1d') {
          // Pour 1 heure/jour, afficher heure:minute
          return dateObj.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } else {
          // Pour les périodes longues, afficher jour/mois
          return dateObj.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        }
      });

      // 🔍 DEBUG: Afficher les données pour diagnostic
      console.log('\n🔍 DEBUG - Évolution des stocks calculée :');
      productEvolutions.forEach(product => {
        console.log(`📦 ${product.productName} (${product.historyCount} mouvements):`);
        console.log(`   Stock DB: ${product.currentStock} | Stock calculé final: ${product.dataPoints[product.dataPoints.length - 1]?.stock}`);
        console.log(`   Évolution: ${product.dataPoints.map(p => p.stock).join(' → ')}`);
      });

      console.log(`\n📊 Graphique: ${datasets.length} produits × ${labels.length} points de temps (période: ${period})`);

      const chartData = {
        labels: labels,
        datasets: datasets,
        // Informations supplémentaires
        productsInfo: productEvolutions.map(product => ({
          name: product.productName,
          currentStock: product.currentStock,
          dataPointsCount: product.dataPoints.length
        }))
      };

      console.log(`📊 Graphique généré: ${datasets.length} produits, ${labels.length} points de temps`);
      res.json(chartData);

    } catch (error) {
      console.error('Error getting product stock evolution chart:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution des stocks par produit' });
    }
  }
);

// Évolution d'un produit spécifique
router.get('/product/:productId/evolution', 
  authenticateToken, 
  getProductStockEvolutionMongo
);

// Statistiques avancées
router.get('/advanced-stats', 
  authenticateToken, 
  getAdvancedStockStatsMongo
);

// Alertes stock contextualisées
router.get('/low-stock-context', 
  authenticateToken, 
  getLowStockWithContextMongo
);

// Comparaison de performance
router.get('/performance-comparison', 
  authenticateToken, 
  getPerformanceComparison
);

/**
 * 🔄 OPÉRATIONS STOCK (Écriture Double Automatique)
 */

// Enregistrer une vente (avec middleware automatique)
router.post('/movement/sale',
  authenticateToken,
  recordSaleMovement,
  verifyStockConsistency,
  async (req, res) => {
    try {
      const { productId, quantity, orderId } = req.body;
      
      // Utiliser le middleware pour enregistrer automatiquement
      await req.recordStockMovement({
        productId,
        quantityChange: -Math.abs(quantity), // Négatif pour vente
        reason: 'Vente produit',
        reference: orderId,
        metadata: {
          orderId,
          type: 'vente'
        }
      });
      
      res.json({
        success: true,
        message: 'Mouvement de vente enregistré (Double écriture)',
        architecture: 'PostgreSQL + MongoDB'
      });
    } catch (error) {
      console.error('❌ Erreur enregistrement vente:', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la vente' });
    }
  }
);

// Enregistrer un achat/réapprovisionnement
router.post('/movement/purchase',
  authenticateToken,
  recordPurchaseMovement,
  verifyStockConsistency,
  async (req, res) => {
    try {
      const { productId, quantity, cost, supplier } = req.body;
      
      await req.recordStockMovement({
        productId,
        quantityChange: Math.abs(quantity), // Positif pour achat
        reason: 'Réapprovisionnement',
        cost: parseFloat(cost) || null,
        metadata: {
          supplier,
          type: 'achat',
          unitCost: cost
        }
      });
      
      res.json({
        success: true,
        message: 'Réapprovisionnement enregistré (Double écriture)',
        architecture: 'PostgreSQL + MongoDB'
      });
    } catch (error) {
      console.error('❌ Erreur enregistrement achat:', error);
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'achat' });
    }
  }
);

// Ajustement de stock
router.post('/movement/adjustment',
  authenticateToken,
  recordAdjustmentMovement,
  verifyStockConsistency,
  async (req, res) => {
    try {
      const { productId, quantityChange, reason, notes } = req.body;
      
      await req.recordStockMovement({
        productId,
        quantityChange: parseInt(quantityChange),
        reason: reason || 'Ajustement manuel',
        notes,
        metadata: {
          type: 'ajustement',
          manual: true
        }
      });
      
      res.json({
        success: true,
        message: 'Ajustement de stock enregistré (Double écriture)',
        architecture: 'PostgreSQL + MongoDB'
      });
    } catch (error) {
      console.error('❌ Erreur ajustement stock:', error);
      res.status(500).json({ error: 'Erreur lors de l\'ajustement du stock' });
    }
  }
);

/**
 * 🔧 UTILITAIRES & MAINTENANCE
 */

// Vérifier la cohérence entre PostgreSQL et MongoDB
router.get('/verify-consistency/:productId?',
  authenticateToken,
  verifyStockConsistency,
  async (req, res) => {
    try {
      const { productId } = req.params;
      
      if (productId) {
        // Vérifier un produit spécifique
        const result = await req.verifyStock(productId);
        res.json({
          productId,
          ...result,
          message: result.consistent 
            ? 'Stock cohérent entre PostgreSQL et MongoDB'
            : 'Incohérence détectée et corrigée'
        });
      } else {
        // Vérifier tous les produits (limité)
        res.json({
          message: 'Vérification globale disponible via script de maintenance',
          endpoint: '/verify-consistency/:productId pour un produit spécifique'
        });
      }
    } catch (error) {
      console.error('❌ Erreur vérification cohérence:', error);
      res.status(500).json({ error: 'Erreur lors de la vérification de cohérence' });
    }
  }
);

// Statistiques de l'architecture hybride
router.get('/hybrid-stats',
  authenticateToken,
  async (req, res) => {
    try {
      const stats = {
        architecture: 'Écriture Double PostgreSQL + MongoDB',
        advantages: [
          '🚀 Lectures ultra-rapides (MongoDB)',
          '🔒 Sécurité et cohérence (PostgreSQL)',
          '📊 Agrégations optimisées (MongoDB Pipeline)',
          '🔄 Synchronisation automatique',
          '🛡️ Fallback PostgreSQL si MongoDB indisponible'
        ],
        performance: {
          reads: 'MongoDB (optimisé pour analytics)',
          writes: 'Double écriture automatique',
          consistency: 'PostgreSQL source de vérité',
          monitoring: 'Temps de réponse surveillés'
        },
        features: [
          'Middleware automatique d\'enregistrement',
          'Vérification de cohérence',
          'Métadonnées enrichies',
          'Optimisations temporelles',
          'Monitoring des performances'
        ],
        status: req.mongoAvailable ? 'Hybride actif' : 'Mode PostgreSQL seul'
      };
      
      res.json(stats);
    } catch (error) {
      console.error('❌ Erreur stats hybrides:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  }
);

// 🔧 DEBUG: Route pour vérifier le calcul du stock
router.get('/debug', authenticateToken, debugStockCalculation);

// 🔧 Route pour l'évolution globale des stocks (wrapper)
router.get('/global-evolution', authenticateToken, async (req, res) => {
  try {
    const { period = '3m' } = req.query;
    const evolution = await getGlobalStockEvolution(period);
    
    // Formater pour Chart.js
    const chartData = {
      labels: evolution.map(item => new Date(item.date).toLocaleDateString('fr-FR')),
      datasets: [{
        label: 'Stock Total',
        data: evolution.map(item => item.totalStock),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true
      }]
    };

    res.json(chartData);
  } catch (error) {
    console.error('Error getting global stock evolution:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'évolution globale des stocks' });
  }
});

export default router; 