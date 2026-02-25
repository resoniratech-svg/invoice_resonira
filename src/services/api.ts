import { Invoice, CompanyInfo } from '@/types/invoice';

// Use environment variable for API URL (set in Netlify/Vercel dashboard)
// Falls back to localhost for local development
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export const api = {
    // Invoices
    getInvoices: async (): Promise<Invoice[]> => {
        const response = await fetch(`${API_BASE}/invoices`);
        if (!response.ok) throw new Error('Failed to fetch invoices');
        return response.json();
    },

    getInvoice: async (id: string): Promise<Invoice> => {
        const response = await fetch(`${API_BASE}/invoices/${id}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        return response.json();
    },

    createInvoice: async (invoice: Invoice): Promise<{ success: true; id: string }> => {
        const response = await fetch(`${API_BASE}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create invoice');
        }
        return response.json();
    },

    updateInvoice: async (id: string, invoice: Invoice): Promise<{ success: true }> => {
        const response = await fetch(`${API_BASE}/invoices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoice),
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to update invoice');
        }
        return response.json();
    },

    deleteInvoice: async (id: string): Promise<{ success: true }> => {
        const response = await fetch(`${API_BASE}/invoices/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete invoice');
        return response.json();
    },

    // Company Settings
    getSettings: async (): Promise<CompanyInfo> => {
        const response = await fetch(`${API_BASE}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    updateSettings: async (settings: CompanyInfo): Promise<{ success: true }> => {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to update settings');
        return response.json();
    },

    // Email
    sendInvoiceEmail: async (invoice: Invoice, recipientEmail: string): Promise<{ success: true; message: string }> => {
        // For new invoices (not saved yet), we use send-direct
        const endpoint = invoice.id && !invoice.id.toString().startsWith('temp')
            ? `${API_BASE}/invoices/${invoice.id}/send`
            : `${API_BASE}/invoices/send-direct`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invoice, recipientEmail }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to send email');
        }
        return response.json();
    },

    // Auth
    login: async (email: string, password: string): Promise<{ success: boolean; user?: { id: string; email: string; name: string }; error?: string }> => {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            return { success: false, error: data.error || 'Login failed' };
        }
        return { success: true, user: data.user };
    },

    updateProfile: async (userId: string, data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; user?: { id: string; email: string; name: string }; error?: string }> => {
        const response = await fetch(`${API_BASE}/auth/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            return { success: false, error: result.error || 'Update failed' };
        }
        return { success: true, user: result.user };
    },
};
