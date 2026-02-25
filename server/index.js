require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const invoiceRoutes = require('./routes/invoices');
const settingsRoutes = require('./routes/settings');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware - Allow all origins for deployment
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/invoices', invoiceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/auth', authRoutes);

// Health check - basic
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check - full (includes database connectivity)
app.get('/api/health/full', (req, res) => {
    const db = require('./db/database');
    const fs = require('fs');
    const path = require('path');

    const checks = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            backend: { status: 'ok', port: process.env.PORT || 3001 },
            database: { status: 'unknown' },
            email: {
                status: process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your-email@gmail.com' ? 'configured' : 'not_configured'
            }
        }
    };

    // Check database (JSON file storage) connectivity
    try {
        const dataDir = path.join(__dirname, 'db', 'data');
        const invoicesExist = fs.existsSync(path.join(dataDir, 'invoices.json'));
        const settingsExist = fs.existsSync(path.join(dataDir, 'settings.json'));
        const usersExist = fs.existsSync(path.join(dataDir, 'users.json'));

        // Try to read data
        const invoices = db.invoices.getAll();
        const settings = db.settings.get();

        checks.services.database = {
            status: 'ok',
            type: 'json-file-storage',
            files: {
                invoices: invoicesExist,
                settings: settingsExist,
                users: usersExist
            },
            counts: {
                invoices: invoices.length,
                hasSettings: Object.keys(settings).length > 0
            }
        };
    } catch (error) {
        checks.status = 'degraded';
        checks.services.database = {
            status: 'error',
            error: error.message
        };
    }

    res.json(checks);
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Invoice server running on http://localhost:${PORT}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER || 'Not configured'}`);
});
