import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationsDropdown } from './NotificationsDropdown';
import { SettingsDialog } from './SettingsDialog';
import { UserMenu } from './UserMenu';
import { ConnectionStatus } from './ConnectionStatus';

interface HeaderProps {
  onCreateNew: () => void;
}

export function Header({ onCreateNew }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Resonira Technologies"
              className="h-10 w-auto object-contain"
            />
            <ConnectionStatus />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            <SettingsDialog />
            <Button variant="invoice" onClick={onCreateNew} className="ml-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Invoice</span>
            </Button>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
