import { useState } from 'react';
import { Settings, Moon, Sun, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState({
        darkMode: false,
        compactView: false,
        autoSave: true,
        defaultGstRate: '18',
        currency: 'INR',
        dateFormat: 'dd/MM/yyyy',
    });

    const toggleDarkMode = (enabled: boolean) => {
        setSettings({ ...settings, darkMode: enabled });
        if (enabled) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading">Settings</DialogTitle>
                    <DialogDescription>
                        Customize your invoice management experience
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Appearance */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-primary mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            Appearance
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="dark-mode">Dark Mode</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Switch to dark theme
                                    </p>
                                </div>
                                <Switch
                                    id="dark-mode"
                                    checked={settings.darkMode}
                                    onCheckedChange={toggleDarkMode}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="compact-view">Compact View</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Reduce spacing in lists
                                    </p>
                                </div>
                                <Switch
                                    id="compact-view"
                                    checked={settings.compactView}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, compactView: checked })
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Invoice Defaults */}
                    <div>
                        <h4 className="font-heading font-semibold text-sm text-primary mb-3">
                            Invoice Defaults
                        </h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-save">Auto Save</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Save drafts automatically
                                    </p>
                                </div>
                                <Switch
                                    id="auto-save"
                                    checked={settings.autoSave}
                                    onCheckedChange={(checked) =>
                                        setSettings({ ...settings, autoSave: checked })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="gst-rate">Default GST Rate</Label>
                                    <Select
                                        value={settings.defaultGstRate}
                                        onValueChange={(value) =>
                                            setSettings({ ...settings, defaultGstRate: value })
                                        }
                                    >
                                        <SelectTrigger id="gst-rate">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5%</SelectItem>
                                            <SelectItem value="12">12%</SelectItem>
                                            <SelectItem value="18">18%</SelectItem>
                                            <SelectItem value="28">28%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select
                                        value={settings.currency}
                                        onValueChange={(value) =>
                                            setSettings({ ...settings, currency: value })
                                        }
                                    >
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="INR">₹ INR</SelectItem>
                                            <SelectItem value="USD">$ USD</SelectItem>
                                            <SelectItem value="EUR">€ EUR</SelectItem>
                                            <SelectItem value="GBP">£ GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date-format">Date Format</Label>
                                <Select
                                    value={settings.dateFormat}
                                    onValueChange={(value) =>
                                        setSettings({ ...settings, dateFormat: value })
                                    }
                                >
                                    <SelectTrigger id="date-format">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                                        <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                                        <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button variant="invoice" onClick={() => setOpen(false)}>
                        Save Settings
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
