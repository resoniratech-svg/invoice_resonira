import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileDialog } from '@/components/auth/ProfileDialog';

export function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors">
                            <span className="font-heading font-bold text-primary">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
        </>
    );
}

