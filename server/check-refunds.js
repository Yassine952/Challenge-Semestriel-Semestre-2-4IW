// Script pour vérifier les remboursements
import Order from './src/models/Order.js';
import sequelize from './src/config/database.js';

const checkRefunds = async () => {
  try {
    await sequelize.authenticate();
    console.log('🔍 Vérification des remboursements récents...\n');
    
    const orders = await Order.findAll({
      where: { refundRequested: true },
      order: [['updatedAt', 'DESC']],
      limit: 10
    });
    
    if (orders.length === 0) {
      console.log('❌ Aucun remboursement trouvé');
      return;
    }
    
    console.log(`✅ ${orders.length} remboursement(s) trouvé(s):\n`);
    
    orders.forEach(order => {
      console.log(`📋 Commande #${order.id}`);
      console.log(`   💰 Montant: ${order.refundAmount}€`);
      console.log(`   📊 Statut: ${order.refundStatus || 'N/A'}`);
      console.log(`   🆔 Stripe ID: ${order.refundId || 'N/A'}`);
      console.log(`   📅 Date: ${order.refundDate || 'N/A'}`);
      console.log(`   🔄 Retour: ${order.returnStatus}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

checkRefunds(); 