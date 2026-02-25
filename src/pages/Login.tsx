import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                toast.success('Welcome back!');
                navigate('/');
            } else {
                toast.error(result.error || 'Invalid email or password');
            }
        } catch (error) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Brand */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/logo.png"
                            alt="Resonira Technologies"
                            className="h-20 w-auto"
                        />
                    </div>
                    <h1 className="font-heading font-bold text-2xl text-foreground">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sign in to manage your invoices
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12"
                                autoComplete="email"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pr-12"
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="invoice"
                            className="w-full h-12 text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-6">
                    © {new Date().getFullYear()} Resonira Technologies. All rights reserved.
                </p>
            </div>
        </div>
    );
}
