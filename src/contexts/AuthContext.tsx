import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateProfile: (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session on load
        const savedUser = localStorage.getItem('invoiceUser');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('invoiceUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const result = await api.login(email, password);

            if (result.success && result.user) {
                setUser(result.user);
                localStorage.setItem('invoiceUser', JSON.stringify(result.user));
                return { success: true };
            }
            return { success: false, error: result.error || 'Login failed' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please ensure the backend is running.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('invoiceUser');
    };

    const updateProfile = async (data: { name?: string; email?: string; currentPassword?: string; newPassword?: string }): Promise<{ success: boolean; error?: string }> => {
        if (!user) return { success: false, error: 'Not logged in' };

        try {
            const result = await api.updateProfile(user.id, data);

            if (result.success && result.user) {
                setUser(result.user);
                localStorage.setItem('invoiceUser', JSON.stringify(result.user));
                return { success: true };
            }
            return { success: false, error: result.error || 'Update failed' };
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, error: 'Network error' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

