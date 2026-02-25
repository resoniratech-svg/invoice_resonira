import { useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

// Start with empty notifications - real notifications will be added via actions
const initialNotifications: Notification[] = [];

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [open, setOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter((n) => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-heading font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-foreground">
                                            {notification.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {notification.time}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {!notification.read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <Check className="w-3 h-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={() => deleteNotification(notification.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-2 border-t border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-destructive hover:text-destructive"
                            onClick={clearAll}
                        >
                            Clear all notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
