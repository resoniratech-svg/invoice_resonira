const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ['quotation', 'invoice'], default: 'invoice' },
    referenceNumber: String,
    date: String,
    validityDate: String,
    subject: String,
    description: String,
    preparedBy: String,
    preparedByEmail: String,
    client: {
        companyName: String,
        attentionTo: String,
        address: String,
        phone: String,
        email: String,
        gstNo: String
    },
    lineItems: [{
        id: String,
        description: String,
        duration: String,
        quantity: Number,
        unitPrice: Number,
        total: Number
    }],
    subtotal: Number,
    gstRate: Number,
    gstAmount: Number,
    grandTotal: Number,
    advancePayment: { type: Number, default: 0 },
    balanceDue: Number,
    amountInWords: String,
    paymentTerms: String,
    deliveryTerms: String,
    status: { type: String, default: 'draft' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false }); // Using strict: false to allow flexible invoice structures if needed

module.exports = mongoose.model('Invoice', invoiceSchema);
