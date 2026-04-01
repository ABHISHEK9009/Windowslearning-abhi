import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Settings,
  LogOut, Bell, Search, Menu, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';


const sidebarItems = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Verify Mentors', to: '/admin/verify-mentors', icon: ShieldCheck, badge: 3 },
  { label: 'User Directory', to: '/admin/users', icon: Users },
  { label: 'Platform Stats', to: '/admin/dashboard', icon: Settings }, // Keep it simple for now
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#020817] font-sans antialiased overflow-hidden">
      {/* ─── Sidebar ────────────────────────────────────────────────────────────────── */}
      <aside className="w-72 admin-sidebar text-white shadow-2xl relative z-50 flex flex-col pt-6 pb-2">
        {/* Header/Logo */}
        <div className="flex items-center px-7 mb-10 gap-3 group pointer-events-none">
          <div className="bg-primary p-2.5 rounded-xl shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-transform group-hover:scale-105">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white/95 leading-tight">Windows Learning</h2>
            <p className="text-[10px] text-white/40 uppercase font-semibold tracking-widest leading-none mt-1">Admin Console</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-8 group">
          <div className="relative group-hover:bg-white/5 transition-colors rounded-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search features..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white/10 transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`admin-nav-link group ${isActive ? 'active' : ''}`}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : 'text-white/50 group-hover:text-white'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge className={`bg-primary/20 text-primary border-none text-[10px] h-5 min-w-[20px] transition-all group-hover:bg-primary group-hover:text-white ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : ''}`}>
                    {item.badge}
                  </Badge>
                )}
                <ChevronRight className={`h-4 w-4 opacity-0 transition-all -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0 ml-auto`} />
              </Link>
            );
          })}
        </nav>

        {/* Footer/User Profile Section */}
        <div className="px-4 mt-auto mb-2">
          <div className="admin-glass-card rounded-2xl p-4 shadow-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white/10 p-0.5 shrink-0 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Administrator')}&background=6366f1&color=ffffff&size=128&bold=true`} />
                <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold uppercase ring-1 ring-primary/30">
                  {user?.name?.[0] || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-semibold truncate text-white/90 leading-none mb-1">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-white/40 truncate leading-none">{user?.email || 'admin@windows.dev'}</p>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-white/30 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-8 w-8 transition-all active:scale-95" 
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header - Glass Effect */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm hidden sm:block">Admin</span>
              <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:block" />
              <h3 className="text-base font-semibold tracking-tight capitalize text-slate-800 dark:text-slate-100">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Overview'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4 mr-2">
              <div className="text-right">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">System Status</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live</span>
                </div>
              </div>
            </div>

            <Separator orientation="vertical" className="h-8 mx-1 hidden lg:block opacity-30" />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#020817] shadow-sm"></span>
              </Button>
              
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-all">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area with smooth entrance animation */}
        <main className="p-8 pb-12 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
