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
import { MyWorkPage } from './components/MyWorkPage';
import { ADMIN_USER, CLIENT_USER, ADMIN_CHATS, CLIENT_CHATS, MOCK_PROJECTS, MOCK_INVOICES, MOCK_PAYMENT_METHODS } from './constants';
import { User, UserRole, ViewState, Project, PaymentMethod, Invoice } from './types';
import { Repeat, Menu } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import * as api from './lib/api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(CLIENT_USER); 
  const [currentView, setCurrentView] = useState<ViewState>('OVERVIEW');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // Navigation State: 'LANDING', 'WORK', 'APP'
  const [navMode, setNavMode] = useState<'LANDING' | 'WORK' | 'APP'>('LANDING');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Supabase Auth Listener
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleAuthUser(session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleAuthUser(session);
      } else {
        if (navMode === 'APP') {
           setNavMode('LANDING');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navMode]);

  const handleAuthUser = async (session: any) => {
    const email = session.user.email;
    const isBonniface = email?.includes('admin') || email?.includes('bonniface');
    
    let userRole = UserRole.CLIENT;
    let userName = session.user.user_metadata?.full_name || email?.split('@')[0] || 'Client';

    if (isBonniface) {
        userRole = UserRole.ADMIN;
        // In real app, fetch profile from DB
    }
    
    const user: User = { 
        id: session.user.id,
        name: userName,
        email: email || '',
        role: userRole,
        avatarUrl: isBonniface ? 'https://picsum.photos/seed/bonniface/200/200' : 'https://picsum.photos/seed/user/200/200'
    };

    setCurrentUser(user);
    setNavMode('APP');

    // Fetch Data
    await loadData(user);
  };

  const loadData = async (user: User) => {
    setIsLoadingData(true);
    try {
        const isAdmin = user.role === UserRole.ADMIN;
        
        // Parallel fetching
        const [fetchedProjects, fetchedInvoices, fetchedPaymentMethods] = await Promise.all([
            api.fetchProjects(user.id, isAdmin),
            api.fetchInvoices(user.name, isAdmin),
            api.fetchPaymentMethods(user.id)
        ]);

        // If DB is empty, fall back to constants for demo purposes
        setProjects(fetchedProjects.length > 0 ? fetchedProjects : MOCK_PROJECTS);
        setInvoices(fetchedInvoices.length > 0 ? fetchedInvoices : MOCK_INVOICES);
        setPaymentMethods(fetchedPaymentMethods.length > 0 ? fetchedPaymentMethods : []);

    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        setIsLoadingData(false);
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('PROJECT_DETAILS');
  };

  const handleLogin = () => {
    // handled by auth listener
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setNavMode('LANDING');
    setIsMobileMenuOpen(false);
  };

  // Refreshes data after adding a payment method
  const handlePaymentMethodAdded = (newMethod: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, newMethod]);
    // Optionally trigger a full re-fetch if needed
  };

  if (navMode === 'LANDING') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LandingPage 
            onLogin={handleLogin} 
            onNavigateToWork={() => setNavMode('WORK')} 
        />
        <AIAssistant 
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)} 
          projects={[]} // No projects in landing context
          user={CLIENT_USER} // Dummy user for landing
        />
        {!isAIOpen && (
          <div 
             onClick={() => setIsAIOpen(true)}
             className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 z-50 cursor-pointer"
          >
             <div className="w-1.5 h-1.5 bg-green-400 rounded-full absolute top-3 right-3 animate-pulse" />
             <BotIcon />
          </div>
        )}
      </div>
    );
  }

  if (navMode === 'WORK') {
      return (
          <div className={isDarkMode ? 'dark' : ''}>
              <MyWorkPage onBack={() => setNavMode('LANDING')} />
          </div>
      );
  }

  const renderContent = () => {
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-screen text-slate-500">
                Loading data...
            </div>
        );
    }

    switch (currentView) {
      case 'OVERVIEW':
        return (
          <Dashboard 
            user={currentUser} 
            projects={projects} 
            onNavigate={setCurrentView} 
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            onProjectClick={handleProjectClick}
            onToggleAI={() => setIsAIOpen(prev => !prev)}
          />
        );
      case 'PROJECTS':
        return (
          <ProjectList 
            projects={projects} 
            onProjectClick={handleProjectClick}
          />
        );
      case 'PROJECT_DETAILS':
        if (!selectedProject) return <ProjectList projects={projects} onProjectClick={handleProjectClick} />;
        return (
          <ProjectDetails 
            project={selectedProject} 
            currentUser={currentUser}
            onBack={() => setCurrentView('PROJECTS')} 
          />
        );
      case 'MESSAGES':
        const chats = currentUser.role === UserRole.ADMIN ? ADMIN_CHATS : CLIENT_CHATS;
        return <ChatInterface sessions={chats} currentUser={currentUser} />;
      case 'NEW_PROJECT':
        return <NewProjectWizard />;
      case 'INVOICES':
      case 'BILLING':
        return (
            <InvoicesPage 
                user={currentUser} 
                invoices={invoices} 
                paymentMethods={paymentMethods}
                onNavigate={setCurrentView} 
            />
        );
      case 'ADD_PAYMENT_METHOD':
        return <AddPaymentMethod onNavigate={setCurrentView} onSave={handlePaymentMethodAdded} userId={currentUser.id} />;
      case 'SETTINGS':
        return <SettingsPage user={currentUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      default:
        return (
          <div className="flex items-center justify-center h-screen text-slate-500 dark:text-slate-400">
            Work in progress...
          </div>
        );
    }
  };

  return (
    <div className="flex bg-slate-50 dark:bg-navy-950 min-h-screen font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300">
      <Sidebar 
        user={currentUser}
        currentView={currentView}
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 bg-white dark:bg-navy-800 text-slate-700 dark:text-white rounded-xl shadow-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors"
      >
        <Menu size={20} />
      </button>

      <main className="flex-1 lg:ml-64 w-full relative bg-slate-50 dark:bg-navy-950 transition-all duration-300">
        {renderContent()}
      </main>

      <AIAssistant 
        isOpen={isAIOpen} 
        onClose={() => setIsAIOpen(false)} 
        projects={projects}
        user={currentUser}
      />
    </div>
  );
};

const BotIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/><path d="m16 13 2 2"/><path d="m8 13-2 2"/><path d="m12 15 2 2"/><path d="m10 17 2 2"/></svg>
);

export default App;