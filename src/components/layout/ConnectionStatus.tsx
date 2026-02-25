import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Database, Server } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface HealthStatus {
    status: string;
    timestamp: string;
    services?: {
        backend: { status: string; port: string };
        database: { status: string };
        email: { status: string };
    };
}

export function ConnectionStatus() {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const response = await fetch(`${apiBase}/health/full`);
                if (response.ok) {
                    const data = await response.json();
                    setHealth(data);
                    setIsConnected(data.status === 'ok');
                } else {
                    setIsConnected(false);
                }
            } catch {
                setIsConnected(false);
                setHealth(null);
            } finally {
                setIsLoading(false);
            }
        };

        // Check immediately
        checkConnection();

        // Check every 30 seconds
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-xs">Connecting...</span>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-help">
                        {isConnected ? (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <WifiOff className="w-3.5 h-3.5 text-red-500" />
                            </>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-2 text-xs">
                        <div className="font-semibold">
                            {isConnected ? '✅ System Connected' : '❌ Connection Failed'}
                        </div>
                        {health && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Server className="w-3 h-3" />
                                    <span>Backend: {health.services?.backend?.status || 'unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    <span>Database: {health.services?.database?.status || 'unknown'}</span>
                                </div>
                            </div>
                        )}
                        {!isConnected && (
                            <div className="text-red-400">
                                Make sure the backend server is running on port 3002
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
