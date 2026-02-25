const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

let prisma;
let usingFallback = false;

// Try to initialize Prisma
try {
    if (!process.env.DATABASE_URL) {
        console.log('⚠️ DATABASE_URL not configured, switching to local JSON storage');
        usingFallback = true;
    } else {
        prisma = new PrismaClient();
        console.log('✅ Prisma client initialized (PostgreSQL)');
    }
} catch (err) {
    console.error('❌ Prisma initialization error:', err.message);
    console.log('⚠️ Switching to local JSON storage');
    usingFallback = true;
}

const jsonDb = require('./jsonDb');

// Prisma-based database implementation
const prismaDb = {
    invoices: {
        getAll: async () => {
            const invoices = await prisma.invoice.findMany({
                include: { lineItems: true },
                orderBy: { createdAt: 'desc' },
            });
            // Transform to match expected format
            return invoices.map(formatInvoice);
        },
        getById: async (id) => {
            const invoice = await prisma.invoice.findUnique({
                where: { id },
                include: { lineItems: true },
            });
            return invoice ? formatInvoice(invoice) : null;
        },
        create: async (data) => {
            const { lineItems, client, ...invoiceData } = data;
            const invoice = await prisma.invoice.create({
                data: {
                    ...invoiceData,
                    client: client || {},
                    lineItems: lineItems ? {
                        create: lineItems.map(item => ({
                            id: item.id,
                            description: item.description,
                            duration: item.duration,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                        })),
                    } : undefined,
                },
                include: { lineItems: true },
            });
            return formatInvoice(invoice);
        },
        update: async (id, data) => {
            const { lineItems, client, ...invoiceData } = data;

            // Delete existing line items and recreate
            if (lineItems) {
                await prisma.lineItem.deleteMany({ where: { invoiceId: id } });
            }

            const invoice = await prisma.invoice.update({
                where: { id },
                data: {
                    ...invoiceData,
                    client: client !== undefined ? client : undefined,
                    lineItems: lineItems ? {
                        create: lineItems.map(item => ({
                            id: item.id,
                            description: item.description,
                            duration: item.duration,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.total,
                        })),
                    } : undefined,
                },
                include: { lineItems: true },
            });
            return formatInvoice(invoice);
        },
        delete: async (id) => {
            await prisma.invoice.delete({ where: { id } });
            return { success: true };
        },
    },
    settings: {
        get: async () => {
            const settings = await prisma.settings.findFirst();
            return settings || {};
        },
        update: async (data) => {
            const existing = await prisma.settings.findFirst();
            if (existing) {
                return prisma.settings.update({
                    where: { id: existing.id },
                    data,
                });
            } else {
                return prisma.settings.create({ data });
            }
        },
    },
    users: {
        getAll: async () => prisma.user.findMany(),
        getById: async (id) => prisma.user.findUnique({ where: { id } }),
        getByEmail: async (email) => prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        }),
        authenticate: async (email, password) => {
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (user && user.password === password) {
                const { password: _, ...safeUser } = user;
                return safeUser;
            }
            return null;
        },
        update: async (id, data) => {
            try {
                const updated = await prisma.user.update({
                    where: { id },
                    data: { ...data, updatedAt: new Date() },
                });
                if (updated) {
                    const { password: _, ...safeUser } = updated;
                    return safeUser;
                }
                return null;
            } catch (err) {
                return null;
            }
        },
    },
};

// Format invoice to match the API response shape
function formatInvoice(invoice) {
    const { lineItems, ...rest } = invoice;
    return {
        ...rest,
        lineItems: lineItems ? lineItems.map(({ invoiceId, ...item }) => item) : [],
    };
}

// Wrapper to choose between Prisma and JSON DB
const getDb = () => {
    if (usingFallback) {
        return jsonDb;
    }
    return prismaDb;
};

// Export a proxy so we check the flag on every access
module.exports = new Proxy({}, {
    get: (target, prop) => {
        return getDb()[prop];
    },
});
