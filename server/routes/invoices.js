const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { sendInvoiceEmail, verifyEmailConfig } = require('../services/emailService');
const { generateInvoicePDF } = require('../services/pdfService');

// Get all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await db.invoices.getAll();
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single invoice
router.get('/:id', async (req, res) => {
    try {
        const invoice = await db.invoices.getById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create invoice
router.post('/', async (req, res) => {
    try {
        const invoice = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await db.invoices.create(invoice);
        res.status(201).json({ success: true, id: invoice.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update invoice
router.put('/:id', async (req, res) => {
    try {
        const updated = await db.invoices.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
    try {
        await db.invoices.delete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send invoice via email
router.post('/:id/send', async (req, res) => {
    try {
        const { recipientEmail } = req.body;

        if (!recipientEmail) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        let invoice = req.body.invoice || await db.invoices.getById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const companyInfo = await db.settings.get();
        const pdfBuffer = await generateInvoicePDF(invoice, companyInfo);
        const result = await sendInvoiceEmail(invoice, recipientEmail, pdfBuffer);

        res.json({
            success: true,
            messageId: result.messageId,
            message: `Invoice sent successfully to ${recipientEmail}`
        });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Check email configuration
router.get('/email/status', async (req, res) => {
    const status = await verifyEmailConfig();
    res.json(status);
});

// Generate PDF and send (accepts invoice data in body for quick send)
// Generate PDF and send (accepts invoice data in body for quick send)
router.post('/send-direct', async (req, res) => {
    try {
        const { invoice, recipientEmail, download } = req.body;

        if (!invoice) {
            return res.status(400).json({ error: 'Invoice data is required' });
        }

        const companyInfo = await db.settings.get();
        const pdfBuffer = await generateInvoicePDF(invoice, companyInfo);

        // Handle direct download request
        if (download) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.referenceNumber || 'draft'}.pdf`);
            res.send(pdfBuffer);
            return;
        }

        if (!recipientEmail) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }

        const result = await sendInvoiceEmail(invoice, recipientEmail, pdfBuffer);

        res.json({
            success: true,
            messageId: result.messageId,
            message: `Invoice sent successfully to ${recipientEmail}`
        });
    } catch (error) {
        console.error('Error processing invoice request:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
