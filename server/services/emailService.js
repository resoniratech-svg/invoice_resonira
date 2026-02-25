const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

const transporter = createTransporter();

/**
 * Send invoice email with PDF attachment
 */
async function sendInvoiceEmail(invoice, recipientEmail, pdfBuffer) {
    if (!transporter) {
        throw new Error('Email not configured. Please set EMAIL_USER and EMAIL_PASS in .env file.');
    }

    const isQuotation = invoice.type === 'quotation';
    const docType = isQuotation ? 'Quotation' : 'Invoice';

    const mailOptions = {
        from: `"Resonira Technologies" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: `${docType} #${invoice.referenceNumber} - ${invoice.subject || 'Resonira Technologies'}`,
        html: generateEmailHTML(invoice, docType),
        attachments: [
            {
                filename: `${docType}_${invoice.referenceNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
}

/**
 * Generate HTML email template
 */
function generateEmailHTML(invoice, docType) {
    const clientName = invoice.client?.attentionTo || invoice.client?.companyName || 'Valued Customer';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Resonira Technologies</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${docType} #${invoice.referenceNumber}</p>
        </div>
        <div class="content">
          <p>Dear ${clientName},</p>
          <p>Please find attached your ${docType.toLowerCase()} for the following:</p>
          <h3 style="color: #333;">${invoice.subject || 'Services'}</h3>
          <p><strong>Amount:</strong> <span class="amount">₹${formatNumber(invoice.grandTotal)}</span></p>
          <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
          ${invoice.validityDate ? `<p><strong>Valid Till:</strong> ${formatDate(invoice.validityDate)}</p>` : ''}
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p>If you have any questions about this ${docType.toLowerCase()}, please don't hesitate to contact us.</p>
          
          <p>Thank you for your business!</p>
          <p>Best regards,<br><strong>Resonira Technologies</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply directly to this email.</p>
          <p>© ${new Date().getFullYear()} Resonira Technologies. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Verify email configuration
 */
async function verifyEmailConfig() {
    if (!transporter) {
        return { configured: false, error: 'Email not configured' };
    }

    try {
        await transporter.verify();
        return { configured: true };
    } catch (error) {
        return { configured: false, error: error.message };
    }
}

module.exports = {
    sendInvoiceEmail,
    verifyEmailConfig,
};
