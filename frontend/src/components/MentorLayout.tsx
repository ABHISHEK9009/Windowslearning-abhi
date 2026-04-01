import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, FileText, Calendar, DollarSign, Clock, UserCircle, HelpCircle, LogOut, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { label: 'Dashboard', to: '/mentor/dashboard', icon: LayoutDashboard },
  { label: 'Learner Requests', to: '/mentor/requests', icon: Inbox },
  { label: 'Chat', to: '/mentor/chat', icon: MessageSquare },
  { label: 'My Proposals', to: '/mentor/proposals', icon: FileText },
  { label: 'My Sessions', to: '/mentor/sessions', icon: Calendar },
  { label: 'Earnings', to: '/mentor/earnings', icon: DollarSign },
  { label: 'Availability', to: '/mentor/availability', icon: Clock },
  { label: 'Edit Profile', to: '/mentor/profile/edit', icon: UserCircle },
  { label: 'Help & Support', to: '/help', icon: HelpCircle },
];

const MentorLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'M';

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex flex-col w-64 border-r bg-card shrink-0">
        <div className="p-6 border-b">
          <Link to="/" className="text-lg font-bold">
            Windows<span className="text-accent">Learning</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Mentor Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold">Windows<span className="text-accent">Learning</span></Link>
          <div className="flex items-center gap-3">
            <Link to="/mentor/profile/edit" className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
              {initials}
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default MentorLayout;
