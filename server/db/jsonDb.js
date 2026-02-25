const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read/write JSON files
const getFile = (filename) => path.join(DATA_DIR, `${filename}.json`);

const readData = (filename) => {
    const file = getFile(filename);
    if (!fs.existsSync(file)) return [];
    try {
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filename}.json:`, err);
        return [];
    }
};

const writeData = (filename, data) => {
    try {
        fs.writeFileSync(getFile(filename), JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error(`Error writing ${filename}.json:`, err);
        return false;
    }
};

// Generic CRUD factory
const createModel = (filename) => ({
    getAll: async () => {
        return readData(filename);
    },
    getById: async (id) => {
        const data = readData(filename);
        return data.find(item => item.id === id) || null;
    },
    create: async (item) => {
        const data = readData(filename);
        data.push(item);
        writeData(filename, data);
        return item;
    },
    update: async (id, updates) => {
        const data = readData(filename);
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;

        data[index] = { ...data[index], ...updates };
        writeData(filename, data);
        return data[index];
    },
    delete: async (id) => {
        const data = readData(filename);
        const filtered = data.filter(item => item.id !== id);
        if (data.length === filtered.length) return null;

        writeData(filename, filtered);
        return { success: true };
    },
    // Special methods
    findOne: async (query) => {
        const data = readData(filename);
        return data.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        }) || null;
    },
    countDocuments: async () => {
        const data = readData(filename);
        return data.length;
    }
});

// Settings specific (singleton-ish)
// Settings specific (singleton-ish)
const settingsModel = {
    ...createModel('settings'),
    get: async () => {
        const data = readData('settings');
        // Handle array or object (legacy support)
        if (Array.isArray(data)) {
            return data[0] || {};
        }
        return data || {};
    },
    update: async (updates) => {
        const data = readData('settings');
        let current;
        if (Array.isArray(data)) {
            current = data[0] || {};
        } else {
            current = data || {};
        }

        const updated = { ...current, ...updates };
        // Always save as array to standardize
        writeData('settings', [updated]);
        return updated;
    }
};

// Invoice specific (sort by date desc)
const invoiceModel = {
    ...createModel('invoices'),
    getAll: async () => {
        const data = readData('invoices');
        return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
};

// User specific (with authentication)
const userModel = {
    ...createModel('users'),
    getByEmail: async (email) => {
        const data = readData('users');
        return data.find(u => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    authenticate: async (email, password) => {
        const data = readData('users');
        const user = data.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        if (user && user.password === password) {
            const { password: _, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }
};

module.exports = {
    invoices: invoiceModel,
    settings: settingsModel,
    users: userModel
};
