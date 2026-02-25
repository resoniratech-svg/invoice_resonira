const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generate PDF invoice matching the web preview design exactly
 * Table columns are properly sized to show all content
 */
function generateInvoicePDF(invoice, companyInfo) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 40, size: 'A4' });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const isQuotation = invoice.type === 'quotation';
            const docType = isQuotation ? 'Tax Proposal' : 'Tax Invoice';
            const primaryColor = '#1e3a8a'; // Dark blue
            const mutedColor = '#6b7280';   // Gray

            // Logo path
            const logoPath = path.join(__dirname, '../assets/logo.png');
            const hasLogo = fs.existsSync(logoPath);

            // Default company info
            const company = {
                name: companyInfo.name || 'RESONIRA TECHNOLOGIES',
                gstin: companyInfo.gstin || '36ABMFR2520B1ZJ',
                state: companyInfo.state || 'Telangana',
                state_code: companyInfo.state_code || '36',
                pan: companyInfo.pan || 'ABMFR2520B',
                sales_phone: companyInfo.sales_phone || '+919154289324',
                email: companyInfo.email || 'info@resonira.com'
            };

            const pageWidth = 595; // A4 width in points
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2); // ~515

            // ========== HEADER ==========
            if (hasLogo) {
                doc.image(logoPath, margin, 30, { width: 120 });
            }

            // Company info (right side)
            const rightCol = 380;
            let y = 30;

            doc.fontSize(9);
            doc.fillColor(mutedColor).text('GSTIN/UIN: ', rightCol, y, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(company.gstin);
            doc.font('Helvetica');
            y += 13;

            doc.fillColor(mutedColor).text('STATE: ', rightCol, y, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(company.state);
            doc.font('Helvetica');
            y += 13;

            doc.fillColor(mutedColor).text('STATE CODE: ', rightCol, y, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(company.state_code);
            doc.font('Helvetica');
            y += 13;

            doc.fillColor(mutedColor).text('PAN: ', rightCol, y, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(company.pan);
            doc.font('Helvetica');

            // ========== DOCUMENT TITLE ==========
            doc.fontSize(18).fillColor(primaryColor).font('Helvetica-Bold')
                .text(docType.toUpperCase(), margin, 95, { align: 'center', width: contentWidth });
            doc.font('Helvetica');

            // ========== CLIENT INFO & INVOICE META ==========
            y = 130;

            // Left column - Client details
            doc.fontSize(9).fillColor(mutedColor);
            doc.text(`${isQuotation ? 'Quotation' : 'Invoice'} For: `, margin, y, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(invoice.client?.companyName || '');
            doc.font('Helvetica').fillColor(mutedColor);
            y += 14;

            doc.text('Name/Attn.: ', margin, y, { continued: true });
            doc.fillColor('#000').text(invoice.client?.attentionTo || '');
            y += 14;

            doc.fillColor(mutedColor).text('Address: ', margin, y, { continued: true });
            doc.fillColor('#000').text(invoice.client?.address || '');
            y += 14;

            doc.fillColor(mutedColor).text('Tel: ', margin, y, { continued: true });
            doc.fillColor('#000').text(invoice.client?.phone || '');
            y += 14;

            doc.fillColor(mutedColor).text('Email: ', margin, y, { continued: true });
            doc.fillColor('#000').text(invoice.client?.email || '');
            y += 14;

            doc.fillColor(mutedColor).text('GST No: ', margin, y, { continued: true });
            doc.fillColor('#000').text(invoice.client?.gstNo || '');

            // Right column - Invoice meta
            doc.fillColor(mutedColor).text('Date: ', rightCol, 130, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(formatDate(invoice.date));
            doc.font('Helvetica').fillColor(mutedColor);

            doc.text('Invoice No: ', rightCol, 144, { continued: true });
            doc.fillColor('#000').font('Helvetica-Bold').text(invoice.referenceNumber || '');
            doc.font('Helvetica');

            // ========== SCOPE OF WORK ==========
            y = 230;
            doc.fontSize(11).fillColor('#000').font('Helvetica-Bold')
                .text('SCOPE OF WORK', margin, y);
            doc.font('Helvetica');

            // ========== TABLE ==========
            const tableTop = y + 18;
            const tableLeft = margin;

            // IMPORTANT: Column widths adjusted for content visibility
            // Sl. | Description | Duration | Qty | Unit Price | Total
            const colWidths = [35, 180, 80, 45, 90, 85]; // Total: 515 (matches contentWidth)
            const tableWidth = colWidths.reduce((a, b) => a + b, 0);
            const rowHeight = 22;

            // Header row
            doc.rect(tableLeft, tableTop, tableWidth, rowHeight).fill(primaryColor);
            doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');

            let x = tableLeft;
            doc.text('Sl.', x + 5, tableTop + 7, { width: colWidths[0] - 10 });
            x += colWidths[0];
            doc.text('Description', x + 5, tableTop + 7, { width: colWidths[1] - 10 });
            x += colWidths[1];
            doc.text('Duration', x + 5, tableTop + 7, { width: colWidths[2] - 10, align: 'center' });
            x += colWidths[2];
            doc.text('Qty', x + 5, tableTop + 7, { width: colWidths[3] - 10, align: 'center' });
            x += colWidths[3];
            doc.text('Unit Price (INR)', x + 5, tableTop + 7, { width: colWidths[4] - 10, align: 'right' });
            x += colWidths[4];
            doc.text('Total (INR)', x + 5, tableTop + 7, { width: colWidths[5] - 10, align: 'right' });
            doc.font('Helvetica');

            // Data rows
            let rowY = tableTop + rowHeight;
            doc.fontSize(9);

            (invoice.lineItems || []).forEach((item, index) => {
                // Calculate row height based on description length
                const descText = item.description || '';
                const descHeight = doc.heightOfString(descText, { width: colWidths[1] - 15 });
                const currentRowHeight = Math.max(rowHeight, descHeight + 10);

                // Alternating background
                if (index % 2 === 1) {
                    doc.rect(tableLeft, rowY, tableWidth, currentRowHeight).fill('#f8fafc');
                }

                doc.fillColor('#333');
                x = tableLeft;

                // Draw cell content
                doc.text(String(index + 1), x + 5, rowY + 6, { width: colWidths[0] - 10 });
                x += colWidths[0];
                doc.text(descText, x + 5, rowY + 6, { width: colWidths[1] - 15 });
                x += colWidths[1];
                doc.text(item.duration || '', x + 5, rowY + 6, { width: colWidths[2] - 10, align: 'center' });
                x += colWidths[2];
                doc.text(String(item.quantity || 1), x + 5, rowY + 6, { width: colWidths[3] - 10, align: 'center' });
                x += colWidths[3];
                doc.text(formatNumber(item.unitPrice || 0), x + 5, rowY + 6, { width: colWidths[4] - 10, align: 'right' });
                x += colWidths[4];
                doc.text(formatNumber(item.total || 0), x + 5, rowY + 6, { width: colWidths[5] - 10, align: 'right' });

                rowY += currentRowHeight;
            });

            // ========== TOTALS ==========
            const totalsLabelX = 370;
            const totalsValueX = 475;
            rowY += 20;

            // GST
            doc.fontSize(10).fillColor(mutedColor);
            doc.text(`GST (${invoice.gstRate || 18}%):`, totalsLabelX, rowY, { width: 100, align: 'right' });
            doc.fillColor(primaryColor).text(formatNumber(invoice.gstAmount || 0), totalsValueX, rowY, { width: 80, align: 'right' });
            rowY += 18;

            // Grand Total
            doc.fillColor(primaryColor).font('Helvetica-Bold');
            doc.text('GRAND TOTAL', totalsLabelX, rowY, { width: 100, align: 'right' });
            doc.text(formatNumber(invoice.grandTotal || 0), totalsValueX, rowY, { width: 80, align: 'right' });
            doc.font('Helvetica');
            rowY += 18;

            // Advance Paid
            if (invoice.advancePayment && invoice.advancePayment > 0) {
                doc.fillColor('#059669'); // Green
                doc.text('Advance Paid', totalsLabelX, rowY, { width: 100, align: 'right' });
                doc.text(`- ${formatNumber(invoice.advancePayment)}`, totalsValueX, rowY, { width: 80, align: 'right' });
                rowY += 18;
            }

            // Balance Due
            doc.fillColor('#dc2626').font('Helvetica-Bold');
            doc.text('BALANCE DUE', totalsLabelX, rowY, { width: 100, align: 'right' });
            doc.text(formatNumber(invoice.balanceDue || 0), totalsValueX, rowY, { width: 80, align: 'right' });
            doc.font('Helvetica');
            rowY += 28;

            // ========== AMOUNT IN WORDS ==========
            doc.rect(tableLeft, rowY, tableWidth, 25).fill('#fef3c7');
            doc.fillColor('#92400e').fontSize(10).font('Helvetica-Oblique');
            doc.text(invoice.amountInWords || '', tableLeft + 10, rowY + 7, { width: tableWidth - 20 });
            doc.font('Helvetica');
            rowY += 40;

            // ========== TERMS ==========
            doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold');
            doc.text('PAYMENT TERMS', tableLeft, rowY);
            doc.text('DELIVERY TERMS', 300, rowY);
            doc.font('Helvetica').fillColor('#333').fontSize(9);
            rowY += 15;
            doc.text(invoice.paymentTerms || '', tableLeft, rowY, { width: 220 });
            doc.text(invoice.deliveryTerms || '', 300, rowY, { width: 220 });
            rowY += 35;

            // ========== VALIDITY ==========
            doc.fontSize(10).fillColor(primaryColor).font('Helvetica-Bold');
            doc.text('VALIDITY', tableLeft, rowY);
            doc.font('Helvetica').fillColor('#333').fontSize(9);
            rowY += 15;
            if (invoice.validityDate) {
                doc.text(`The above offer is valid till ${formatDate(invoice.validityDate)}`, tableLeft, rowY);
            }

            // ========== WATERMARKS ==========
            if (hasLogo) {
                [{ x: 130, y: 180 }, { x: 130, y: 420 }, { x: 130, y: 650 }].forEach(pos => {
                    doc.save();
                    doc.rotate(-25, { origin: [pos.x + 150, pos.y + 50] });
                    doc.opacity(0.04);
                    doc.image(logoPath, pos.x, pos.y, { width: 280 });
                    doc.restore();
                });
            }

            // ========== FOOTER ==========
            doc.fontSize(8).fillColor('#9ca3af');
            doc.text('This is a computer generated document and no signature is required.', margin, 755, { align: 'center', width: contentWidth });
            doc.text(`Date: ${formatDate(invoice.date)}`, margin, 768, { align: 'center', width: contentWidth });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num || 0);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

module.exports = {
    generateInvoicePDF,
};
