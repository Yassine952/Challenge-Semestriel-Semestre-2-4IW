// server/src/services/emailService.js
import nodemailer from 'nodemailer';

export const sendOrderConfirmationEmail = async (to, pdfPath) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Confirmation de votre commande',
    text: 'Merci pour votre commande. Vous trouverez votre facture en pièce jointe.',
    attachments: [
      {
        filename: 'facture.pdf',
        path: pdfPath,
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', to);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
