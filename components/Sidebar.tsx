import React from 'react';
import { LayoutDashboard, FolderKanban, MessageSquare, PlusCircle, Settings, LogOut, BarChart3, ShieldCheck, X, Receipt, CreditCard } from 'lucide-react';
import { User, UserRole, ViewState } from '../types';

interface SidebarProps {
  user: User;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, onChangeView, onLogout, isOpen, onClose }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const NavItem = ({ view, icon: Icon, label, badgeCount }: { view: ViewState; icon: any; label: string; badgeCount?: number }) => (
    <button
      onClick={() => {
        onChangeView(view);
        onClose();
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        currentView === view
          ? 'bg-blue-50 dark:bg-cobalt-600/10 text-blue-600 dark:text-white shadow-sm dark:shadow-none'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-blue-600 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white'} />
      <span className="font-medium text-sm">{label}</span>
      {badgeCount && (
        <span className="ml-auto bg-blue-100 dark:bg-cobalt-500 text-blue-600 dark:text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-navy-800 flex flex-col p-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand */}
        <div className="flex items-center justify-between mb-10 mt-2 px-2">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/boni_avatar.jpg" 
              alt="Bonniface Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-600/20 dark:shadow-cobalt-500/20"
              onError={(e) => {
                // Fallback to icon if image fails
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-gradient-to-br dark:from-cobalt-500 dark:to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 dark:shadow-cobalt-500/20 hidden">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">Bonniface</h1>
              <p className="text-slate-500 text-xs font-medium">Portal v2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          <div className="px-2 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          
          <NavItem 
            view="OVERVIEW" 
            icon={LayoutDashboard} 
            label="Overview" 
          />
          
          <NavItem 
            view="MESSAGES" 
            icon={MessageSquare} 
            label="Messages" 
            badgeCount={3}
          />
          
          <div className="px-2 mt-6 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Management
          </div>

          <NavItem 
            view="PROJECTS" 
            icon={FolderKanban} 
            label="Projects" 
          />

          {/* Client Specific */}
          {!isAdmin && (
            <>
              <NavItem 
                view="NEW_PROJECT" 
                icon={PlusCircle} 
                label="Start Project" 
              />
              <NavItem 
                view="BILLING" 
                icon={CreditCard} 
                label="Billing" 
              />
            </>
          )}

          {/* Admin Specific */}
          {isAdmin && (
            <NavItem 
              view="INVOICES" 
              icon={Receipt} 
              label="Invoices" 
            />
          )}
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-200 dark:border-navy-800 space-y-2">
          <NavItem 
            view="SETTINGS" 
            icon={Settings} 
            label="Settings" 
          />
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-navy-800/50 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;