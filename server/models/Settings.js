const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    name: String,
    gstin: String,
    state: String,
    state_code: String,
    pan: String,
    sales_phone: String,
    support_phone: String,
    email: String,
    address: String,
    logo: String,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
