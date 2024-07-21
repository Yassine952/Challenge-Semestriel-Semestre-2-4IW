// server/src/services/pdfService.js
import PDFDocument from 'pdfkit';
import fs from 'fs';

export const generateInvoicePDF = async (order, user) => {
  const doc = new PDFDocument();
  const pdfPath = `./invoices/invoice_${order.id}.pdf`;

  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(25).text('Facture', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text(`Numéro de commande: ${order.id}`);
  doc.text(`Nom: ${user.firstName} ${user.lastName}`);
  doc.text(`Adresse: ${user.shippingAddress}`);
  doc.moveDown();
  doc.text(`Montant total: ${order.totalAmount} USD`);
  doc.moveDown();

  doc.text('Détails de la commande:', { underline: true });
  order.OrderItems.forEach(item => {
    doc.text(`${item.quantity} x ${item.Product.name} - ${item.price} USD`);
  });

  doc.end();

  return pdfPath;
};
