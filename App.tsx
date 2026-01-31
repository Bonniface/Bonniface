import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import ChatInterface from './components/ChatInterface';
import NewProjectWizard from './components/NewProjectWizard';
import InvoicesPage from './components/InvoicesPage';
import SettingsPage from './components/SettingsPage';
import AddPaymentMethod from './components/AddPaymentMethod';
import AIAssistant from './components/AIAssistant';
import LandingPage from './components/LandingPage';
import BookingsPage from './components/BookingsPage';
import { MyWorkPage } from './components/MyWorkPage';
import { User, UserRole, ViewState, Project, PaymentMethod, Invoice, ChatSession, ProjectStatus, Booking } from './types';
import { Menu } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import * as api from './lib/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [currentView, setCurrentView] = useState<ViewState>('OVERVIEW');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const [navMode, setNavMode] = useState<'LANDING' | 'WORK' | 'APP'>('LANDING');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = async (user: User) => {
    setIsLoadingData(true);
    try {
        const isAdmin = user.role === UserRole.ADMIN;
        const [fetchedProjects, fetchedInvoices, fetchedPaymentMethods, fetchedChats, fetchedBookings] = await Promise.all([
            api.fetchProjects(user.id, isAdmin),
            api.fetchInvoices(user.name, isAdmin),
            api.fetchPaymentMethods(user.id),
            api.fetchUserChats(user.id),
            api.fetchBookings(user.id, isAdmin)
        ]);

        setProjects(fetchedProjects);
        setInvoices(fetchedInvoices);
        setPaymentMethods(fetchedPaymentMethods);
        setChatSessions(fetchedChats);
        setBookings(fetchedBookings);
    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const projectSub = supabase.channel('public:projects').on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => loadData(currentUser)).subscribe();
    const invoiceSub = supabase.channel('public:invoices').on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => loadData(currentUser)).subscribe();
    const bookingSub = supabase.channel('public:bookings').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => loadData(currentUser)).subscribe();

    return () => {
        supabase.removeChannel(projectSub);
        supabase.removeChannel(invoiceSub);
        supabase.removeChannel(bookingSub);
    };
  }, [currentUser]);

  const handleAuthUser = async (session: any) => {
    if (!session?.user) return;
    const { email, id } = session.user;
    const isAdminEmail = email && (email.toLowerCase().includes('admin') || email.toLowerCase().includes('bonniface') || email.toLowerCase() === 'kalongboniface97@gmail.com');
    let dbUser = await api.fetchUserProfile(id);
    if (!dbUser) {
        const meta = session.user.user_metadata || {};
        dbUser = { id, email: email || '', name: meta.full_name || email?.split('@')[0] || 'User', role: isAdminEmail ? UserRole.ADMIN : UserRole.CLIENT, avatarUrl: meta.avatar_url || (isAdminEmail ? '/assets/boni_avatar.jpg' : `https://picsum.photos/seed/${id}/200/200`) };
    }
    if (isAdminEmail && dbUser.role !== UserRole.ADMIN) {
        dbUser.role = UserRole.ADMIN;
        try { await api.updateUserProfile(dbUser.id, { role: 'ADMIN' }); } catch (e) { console.error(e); }
    }
    setCurrentUser(dbUser);
    setNavMode('APP');
    await loadData(dbUser);
  };

  useEffect(() => {
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => { if (session) handleAuthUser(session); });
    const { data: { subscription } } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => { if (session) handleAuthUser(session); else { setCurrentUser(null); setNavMode('LANDING'); } });
    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    setCurrentUser(null);
    setNavMode('LANDING');
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (isLoadingData) return <div className="flex items-center justify-center h-full text-slate-500 gap-2"><Loader /><span>Syncing data...</span></div>;
    if (!currentUser) return null;

    switch (currentView) {
      case 'OVERVIEW':
        return <Dashboard user={currentUser} projects={projects} invoices={invoices} onNavigate={setCurrentView} isDarkMode={isDarkMode} toggleTheme={toggleTheme} onProjectClick={(p) => { setSelectedProject(p); setCurrentView('PROJECT_DETAILS'); }} onToggleAI={() => setIsAIOpen(prev => !prev)} />;
      case 'PROJECTS':
        return <ProjectList projects={projects} onProjectClick={(p) => { setSelectedProject(p); setCurrentView('PROJECT_DETAILS'); }} />;
      case 'PROJECT_DETAILS':
        if (!selectedProject) return <ProjectList projects={projects} onProjectClick={(p) => { setSelectedProject(p); setCurrentView('PROJECT_DETAILS'); }} />;
        return <ProjectDetails project={selectedProject} currentUser={currentUser} onBack={() => setCurrentView('PROJECTS')} />;
      case 'MESSAGES':
        return <ChatInterface sessions={chatSessions} currentUser={currentUser} onRefresh={() => loadData(currentUser)} />;
      case 'BOOKINGS':
        return <BookingsPage user={currentUser} bookings={bookings} />;
      case 'NEW_PROJECT':
        return <NewProjectWizard user={currentUser} onProjectCreated={(p) => { setProjects(prev => [p, ...prev]); setCurrentView('PROJECTS'); }} />;
      case 'INVOICES':
      case 'BILLING':
        return <InvoicesPage user={currentUser} invoices={invoices} paymentMethods={paymentMethods} onNavigate={setCurrentView} onInvoicePaid={(id, prj) => { loadData(currentUser); }} />;
      case 'ADD_PAYMENT_METHOD':
        return <AddPaymentMethod onNavigate={setCurrentView} onSave={(m) => setPaymentMethods(p => [...p, m])} userId={currentUser.id} />;
      case 'SETTINGS':
        return <SettingsPage user={currentUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      default:
        return <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">Work in progress...</div>;
    }
  };

  if (navMode === 'LANDING') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LandingPage onLogin={() => {}} onNavigateToWork={() => setNavMode('WORK')} />
        <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} projects={[]} user={{ id: 'guest', name: 'Guest', email: '', role: UserRole.CLIENT, avatarUrl: '' }} />
        {!isAIOpen && (
          <div onClick={() => setIsAIOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-50 cursor-pointer">
             <div className="w-1.5 h-1.5 bg-green-400 rounded-full absolute top-3 right-3 animate-pulse" />
             <BotIcon />
          </div>
        )}
      </div>
    );
  }

  if (navMode === 'WORK') return <div className={isDarkMode ? 'dark' : ''}><MyWorkPage onBack={() => setNavMode('LANDING')} /></div>;

  return (
    <div className="flex bg-slate-50 dark:bg-navy-950 min-h-screen font-sans transition-colors duration-300">
      <Sidebar user={currentUser} currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white dark:bg-navy-800 text-slate-700 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-navy-700"><Menu size={20} /></button>
      <main className="flex-1 lg:ml-64 w-full relative bg-slate-50 dark:bg-navy-950">{renderContent()}</main>
      {currentUser && <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} projects={projects} user={currentUser} />}
    </div>
  );
};

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/><path d="m16 13 2 2"/><path d="m8 13-2 2"/><path d="m12 15 2 2"/><path d="m10 17 2 2"/></svg>
);

const Loader = () => (
    <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-cobalt-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
);

export default App;