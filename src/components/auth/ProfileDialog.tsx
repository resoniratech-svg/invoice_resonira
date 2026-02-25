import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { User, Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        // Validate password change if new password is provided
        if (newPassword) {
            if (!currentPassword) {
                toast.error('Please enter your current password');
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error('New passwords do not match');
                return;
            }
            if (newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                return;
            }
        }

        setIsSaving(true);
        try {
            const result = await updateProfile({
                name: name !== user?.name ? name : undefined,
                email: email !== user?.email ? email : undefined,
                currentPassword: newPassword ? currentPassword : undefined,
                newPassword: newPassword || undefined,
            });

            if (result.success) {
                toast.success('Profile updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Settings
                    </DialogTitle>
                    <DialogDescription>
                        Update your profile information and change your password.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="profile-name">Name</Label>
                        <Input
                            id="profile-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                    </div>

                    {/* Password Change Section */}
                    <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium mb-3">Change Password</p>

                        {/* Current Password */}
                        <div className="space-y-2 mb-3">
                            <Label htmlFor="current-password">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2 mb-3">
                            <Label htmlFor="new-password">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
