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
import { User, UserRole, ViewState, Project, PaymentMethod, Invoice, ChatSession, ProjectStatus } from './types';
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
  
  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
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

  const loadData = async (user: User) => {
    setIsLoadingData(true);
    
    try {
        const isAdmin = user.role === UserRole.ADMIN;
        
        // Parallel fetching from Database
        const [fetchedProjects, fetchedInvoices, fetchedPaymentMethods, fetchedChats] = await Promise.all([
            api.fetchProjects(user.id, isAdmin),
            api.fetchInvoices(user.name, isAdmin),
            api.fetchPaymentMethods(user.id),
            api.fetchUserChats(user.id)
        ]);

        setProjects(fetchedProjects);
        setInvoices(fetchedInvoices);
        setPaymentMethods(fetchedPaymentMethods);
        setChatSessions(fetchedChats);

    } catch (error) {
        console.error("Failed to load data", error);
    } finally {
        setIsLoadingData(false);
    }
  };

  // Real-Time Subscriptions for Dashboard Data
  useEffect(() => {
    if (!currentUser) return;

    // Listen for changes in projects (e.g., status updates)
    const projectSubscription = supabase
        .channel('public:projects')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
            // Refresh data on any project change (Insert/Update/Delete)
            // Ideally we'd optimize to just update state, but refresh ensures consistency
            loadData(currentUser); 
        })
        .subscribe();
    
    // Listen for invoice changes (e.g., paid status)
    const invoiceSubscription = supabase
        .channel('public:invoices')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => {
            loadData(currentUser);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(projectSubscription);
        supabase.removeChannel(invoiceSubscription);
    };
  }, [currentUser]);

  const handleAuthUser = async (session: any) => {
    if (!session?.user) return;

    const { email, id } = session.user;

    // Check if this is an Admin based on email whitelist
    const isAdminEmail = email && (
        email.toLowerCase().includes('admin') || 
        email.toLowerCase().includes('bonniface') || 
        email.toLowerCase() === 'kalongboniface97@gmail.com'
    );

    // 1. Fetch real user profile from Database
    let dbUser = await api.fetchUserProfile(id);
    
    // 2. Fallback if profile not ready (race condition with DB trigger on signup)
    if (!dbUser) {
        const meta = session.user.user_metadata || {};
        
        dbUser = {
            id,
            email: email || '',
            name: meta.full_name || email?.split('@')[0] || 'User',
            role: isAdminEmail ? UserRole.ADMIN : UserRole.CLIENT, // Temporary fallback role
            avatarUrl: meta.avatar_url || (isAdminEmail ? '/assets/boni_avatar.jpg' : `https://picsum.photos/seed/${id}/200/200`)
        };
    }

    // 3. ENFORCE ADMIN ROLE: If email is whitelisted but DB/Profile says CLIENT (e.g. first OTP login), correct it.
    if (isAdminEmail && dbUser.role !== UserRole.ADMIN) {
        dbUser.role = UserRole.ADMIN;
        // Persist the role upgrade to the database
        api.updateUserProfile(dbUser.id, { role: 'ADMIN' }).catch(console.error);
    }

    setCurrentUser(dbUser);
    setNavMode('APP');

    // Fetch Data using real user context
    await loadData(dbUser);
  };

  // Supabase Auth Listener
  useEffect(() => {
    // Check initial session
    (supabase.auth as any).getSession().then(({ data: { session } }: any) => {
      if (session) {
        handleAuthUser(session);
      }
    });

    const {
      data: { subscription },
    } = (supabase.auth as any).onAuthStateChange((_event: any, session: any) => {
      if (session) {
        handleAuthUser(session);
      } else {
        // If session is lost (logout/expiry), redirect to Landing.
        setCurrentUser(null);
        setNavMode('LANDING');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Secret Backdoor Listener (Ctrl + Shift + A) - Triggers Real OTP flow
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
         e.preventDefault();
         
         const email = 'kalongboniface97@gmail.com';
         
         // 1. Confirm intention to send email
         const confirmSend = window.confirm(`[ADMIN SECURITY]\n\nDo you want to send a login verification code to:\n${email}?`);
         if (!confirmSend) return;

         try {
             // 2. Trigger Supabase OTP Email
             const { error } = await (supabase.auth as any).signInWithOtp({ email });
             
             if (error) {
                 alert(`Error sending email: ${error.message}`);
                 return;
             }

             // 3. Prompt user for the code
             const token = window.prompt(
                 `Verification code sent to ${email}.\n\nPlease check your inbox and enter the 6-digit code below to confirm your identity:`
             );

             if (!token) return; // User cancelled

             // 4. Verify the OTP
             const { data, error: verifyError } = await (supabase.auth as any).verifyOtp({
                 email,
                 token,
                 type: 'email'
             });

             if (verifyError) {
                 alert(`Access Denied: ${verifyError.message}`);
             } else if (data.session) {
                 // 5. Success - The onAuthStateChange listener will handle the login transition
                 alert("Identity Verified. Welcome back, Administrator."); 
             }

         } catch (err) {
             console.error("Auth Error:", err);
             alert("An unexpected error occurred during verification.");
         }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('PROJECT_DETAILS');
  };

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    setCurrentUser(null);
    setNavMode('LANDING');
    setIsMobileMenuOpen(false);
  };

  const handlePaymentMethodAdded = (newMethod: PaymentMethod) => {
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const handleProjectCreated = (newProject: Project) => {
      setProjects(prev => [newProject, ...prev]);
      setCurrentView('PROJECTS');
  };

  const handleRefreshChats = async () => {
      if (!currentUser) return;
      const fetchedChats = await api.fetchUserChats(currentUser.id);
      if (fetchedChats) {
          setChatSessions(fetchedChats);
      }
  };

  const handleInvoicePaid = (invoiceId: string, projectId?: string) => {
      // 1. Mark Invoice as Paid in UI
      setInvoices(prev => prev.map(inv => 
          inv.id === invoiceId ? { ...inv, status: 'Paid' } : inv
      ));
      
      // 2. Update Project Status in UI (Optimistic update)
      // If payment was for a Pending project, it moves to In Progress
      if (projectId) {
          setProjects(prev => prev.map(p => 
              p.id === projectId && p.status === ProjectStatus.PENDING
                ? { ...p, status: ProjectStatus.IN_PROGRESS }
                : p
          ));
          
          // Also update selected project if it's the current one
          if (selectedProject?.id === projectId && selectedProject.status === ProjectStatus.PENDING) {
              setSelectedProject(prev => prev ? { ...prev, status: ProjectStatus.IN_PROGRESS } : null);
          }
      }
  };

  // 1. Landing Mode
  if (navMode === 'LANDING') {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LandingPage 
            onLogin={() => { /* Handled by Supabase Listener */ }} 
            onNavigateToWork={() => setNavMode('WORK')} 
        />
        {/* Simple Guest AI Chat */}
        <AIAssistant 
          isOpen={isAIOpen} 
          onClose={() => setIsAIOpen(false)} 
          projects={[]} 
          user={{ id: 'guest', name: 'Guest', email: '', role: UserRole.CLIENT, avatarUrl: '' }} 
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

  // 2. Portfolio Mode
  if (navMode === 'WORK') {
      return (
          <div className={isDarkMode ? 'dark' : ''}>
              <MyWorkPage onBack={() => setNavMode('LANDING')} />
          </div>
      );
  }

  // 3. App Mode (Requires User)
  if (!currentUser) {
      // Fallback if state hasn't updated yet but we are in APP mode
      return <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center"><Loader /></div>;
  }

  const renderContent = () => {
    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <Loader />
                <span>Syncing data...</span>
            </div>
        );
    }

    switch (currentView) {
      case 'OVERVIEW':
        return (
          <Dashboard 
            user={currentUser} 
            projects={projects} 
            invoices={invoices}
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
        return (
            <ChatInterface 
                sessions={chatSessions} 
                currentUser={currentUser} 
                onRefresh={handleRefreshChats}
            />
        );
      case 'NEW_PROJECT':
        return <NewProjectWizard user={currentUser} onProjectCreated={handleProjectCreated} />;
      case 'INVOICES':
      case 'BILLING':
        return (
            <InvoicesPage 
                user={currentUser} 
                invoices={invoices} 
                paymentMethods={paymentMethods}
                onNavigate={setCurrentView} 
                onInvoicePaid={handleInvoicePaid}
            />
        );
      case 'ADD_PAYMENT_METHOD':
        return <AddPaymentMethod onNavigate={setCurrentView} onSave={handlePaymentMethodAdded} userId={currentUser.id} />;
      case 'SETTINGS':
        return <SettingsPage user={currentUser} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
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

const Loader = () => (
    <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-cobalt-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default App;