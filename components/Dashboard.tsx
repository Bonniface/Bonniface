import React, { useState, useMemo } from 'react';
import { User, UserRole, Project, ProjectStatus, Invoice } from '../types';
import { Search, Bell, Moon, Sun, Wallet, Rocket, ClipboardList, Heart, Edit2, FileText, TrendingDown, MessageCircle, UploadCloud, Sparkles, Share2, X, ChevronRight, Users } from 'lucide-react';

interface DashboardProps {
  user: User;
  projects: Project[];
  invoices: Invoice[];
  onNavigate: (view: any) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onProjectClick: (project: Project) => void;
  onToggleAI: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, projects, invoices, onNavigate, isDarkMode, toggleTheme, onProjectClick, onToggleAI }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;
  
  // Calculate dynamic stats
  const stats = useMemo(() => {
      if (isAdmin) {
          // Admin Stats
          const totalRevenue = invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          
          const activeProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PENDING).length;
          const pendingTasks = projects.filter(p => p.status === ProjectStatus.PENDING).length; // Simplified proxy for tasks

          return [
            { label: "TOTAL REVENUE", value: `$${totalRevenue.toLocaleString()}`, trend: "Lifetime earnings", icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", trendColor: "text-emerald-500" },
            { label: "ACTIVE PROJECTS", value: activeProjects.toString(), trend: "Current workload", icon: Rocket, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", trendColor: "text-slate-500" },
            { label: "PENDING ACTIONS", value: pendingTasks.toString(), trend: "Projects needing approval", icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", trendColor: "text-amber-500" },
            { label: "CLIENT SATISFACTION", value: "98%", trend: "Based on feedback", icon: Heart, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20", trendColor: "text-slate-500" },
          ];
      } else {
          // Client Stats
          const totalSpent = invoices
            .filter(inv => inv.status === 'Paid' && inv.clientName === user.name)
            .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          
          const myActiveProjects = projects.filter(p => (p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PENDING)).length;
          const pendingInvoices = invoices.filter(inv => inv.status === 'Pending' || inv.status === 'Overdue').length;

          return [
              { label: "AMOUNT SPENT", value: `$${totalSpent.toLocaleString()}`, trend: "Total investment", icon: TrendingDown, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-500/20", trendColor: "text-emerald-500" },
              { label: "ACTIVE PROJECTS", value: myActiveProjects.toString(), trend: "On schedule", icon: Rocket, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20", trendColor: "text-slate-500" },
              { label: "PENDING ACTIONS", value: pendingInvoices.toString(), trend: "Invoices to pay", icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20", trendColor: "text-amber-500" },
          ];
      }
  }, [projects, invoices, isAdmin, user.name]);

  // Filter projects for the Share Progress modal
  const filteredModalProjects = projects.filter(p => 
    p.title.toLowerCase().includes(shareSearchQuery.toLowerCase()) || 
    p.id.toLowerCase().includes(shareSearchQuery.toLowerCase()) ||
    p.clientName.toLowerCase().includes(shareSearchQuery.toLowerCase())
  );

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PAID: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400';
      case ProjectStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
      case ProjectStatus.PENDING: return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getClientInitial = (name: string) => name ? name.charAt(0) : '?';
  const getClientColor = (name: string) => {
    if (!name) return 'bg-slate-100 text-slate-600';
    const colors = ['bg-blue-100 text-blue-600', 'bg-orange-100 text-orange-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 transition-colors duration-300 relative">
      
      {/* Top Header */}
      <header className="h-20 bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-navy-800 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-4 pl-12 lg:pl-0">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white truncate">Dashboard</h2>
        </div>
        
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="relative w-full max-w-xs hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-64 bg-slate-100 dark:bg-navy-800 text-slate-900 dark:text-slate-200 pl-10 pr-4 py-2.5 rounded-full border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-colors"
            />
          </div>
          <button className="md:hidden text-slate-500 dark:text-slate-400">
            <Search size={22} />
          </button>
          
          <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-navy-900"></span>
          </button>

          <button 
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-orange-100 dark:bg-navy-800 flex items-center justify-center text-orange-500 dark:text-blue-400 transition-colors"
          >
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <img src={user.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-navy-700 hidden sm:block" />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
          
          {/* Sub Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
              {isAdmin ? 'Manage and track all ongoing consulting projects.' : 'Welcome back! Here is an overview of your projects.'}
            </p>
            <div className="flex gap-3 w-full md:w-auto">
              {isAdmin && (
                <div className="bg-white dark:bg-navy-900 rounded-lg p-1 border border-slate-200 dark:border-navy-700 flex text-sm font-medium overflow-x-auto no-scrollbar">
                  <button className="px-3 lg:px-4 py-1.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm whitespace-nowrap">All</button>
                  <button className="px-3 lg:px-4 py-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">Active</button>
                  <button className="px-3 lg:px-4 py-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white whitespace-nowrap">Completed</button>
                </div>
              )}
              
              {/* Conditional Action Button */}
              {isAdmin ? (
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-cobalt-600 dark:hover:bg-cobalt-500 text-white px-4 lg:px-5 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Share2 size={18} />
                  Share Progress
                </button>
              ) : (
                <button 
                  onClick={() => onNavigate('NEW_PROJECT')}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-cobalt-600 dark:hover:bg-cobalt-500 text-white px-4 lg:px-5 py-2 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  + New Project
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6`}>
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-navy-900 p-6 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between h-36 lg:h-40 transition-colors duration-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{stat.label}</h3>
                    <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                  </div>
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={20} className="lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className={`text-xs font-medium ${stat.trendColor}`}>{stat.trend}</div>
              </div>
            ))}
          </div>

          {/* Projects Table - Conditionally Rendered */}
          {isAdmin ? (
            /* ADMIN VIEW: Shows all projects with Client info */
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Users className="text-blue-500 dark:text-cobalt-400" size={24} />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Client Projects</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage all incoming projects assigned to you</p>
                    </div>
                </div>
                <button className="text-blue-600 dark:text-cobalt-400 text-sm font-medium hover:underline flex items-center gap-1">
                  Export CSV <span className="text-lg">↓</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/50 border-b border-slate-200 dark:border-navy-800">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Project Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Client</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Service Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Budget</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {projects.length > 0 ? projects.map((project) => (
                      <tr 
                        key={project.id} 
                        onClick={() => onProjectClick(project)}
                        className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">ID: #{project.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getClientColor(project.clientName)}`}>
                                {getClientInitial(project.clientName)}
                              </div>
                              <div>
                                 <div className="text-sm font-medium text-slate-900 dark:text-slate-200">{project.clientName}</div>
                                 <div className="text-xs text-slate-500 dark:text-slate-500">contact@client.com</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                             <div className="p-1.5 bg-slate-100 dark:bg-navy-800 rounded text-slate-500 dark:text-slate-400">
                                <Rocket size={14} />
                             </div>
                             {project.serviceType === 'Data Science' ? 'Data Vis.' : project.serviceType}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                          ${project.budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit border border-current bg-opacity-10 ${getStatusStyle(project.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-cobalt-400 transition-colors">
                                 <Edit2 size={16} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-cobalt-400 transition-colors">
                                 <FileText size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                No projects assigned yet.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CLIENT VIEW: Shows own projects */
            <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-sm overflow-hidden transition-colors duration-300">
              <div className="p-6 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Projects</h3>
                <button className="text-blue-600 dark:text-cobalt-400 text-sm font-medium hover:underline flex items-center gap-1">
                  Export CSV <span className="text-lg">↓</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/50 border-b border-slate-200 dark:border-navy-800">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Project Name</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Service Type</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Budget</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {projects.length > 0 ? projects.map((project) => (
                      <tr 
                        key={project.id} 
                        onClick={() => onProjectClick(project)}
                        className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">ID: #{project.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                             <div className="p-1.5 bg-slate-100 dark:bg-navy-800 rounded text-slate-500 dark:text-slate-400">
                                <Rocket size={14} />
                             </div>
                             {project.serviceType === 'Data Science' ? 'Data Vis.' : project.serviceType}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                          ${project.budget.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit border border-current bg-opacity-10 ${getStatusStyle(project.status)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <div className="flex items-center justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-cobalt-400 transition-colors">
                                 <Edit2 size={16} />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-cobalt-400 transition-colors">
                                 <FileText size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    )) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                                No projects found.
                            </td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom Section: Help & Upload - HIDDEN FOR ADMIN */}
          {!isAdmin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Need Help Card */}
              <div className="bg-navy-900 dark:bg-navy-800 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden border border-navy-800 dark:border-navy-700 shadow-lg">
                  <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                      <p className="text-slate-300 mb-6 text-sm leading-relaxed max-w-xs">
                          Schedule a consultation call with our experts to discuss your next big idea.
                      </p>
                      <button className="w-full bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm">
                          Schedule Call
                      </button>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
              </div>

              {/* Quick Upload Card */}
              <div className="bg-white dark:bg-navy-900 border border-dashed border-slate-300 dark:border-navy-700 rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-navy-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 group-hover:scale-110 group-hover:text-blue-500 transition-all">
                      <UploadCloud size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Quick Upload</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Drop project files here to add them to your vault</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Share Progress Modal for Admins */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-navy-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-navy-700 overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex justify-between items-center bg-slate-50 dark:bg-navy-950/50">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Share Progress</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Select a project to update</p>
                    </div>
                    <button onClick={() => setIsShareModalOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-navy-800 rounded-full transition-colors text-slate-500">
                        <X size={20}/>
                    </button>
                </div>
                <div className="p-4 border-b border-slate-100 dark:border-navy-800">
                   <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Search by ID, Name or Client..." 
                            className="w-full bg-slate-100 dark:bg-navy-950 pl-10 pr-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cobalt-500 outline-none text-slate-900 dark:text-white text-sm"
                            value={shareSearchQuery}
                            onChange={e => setShareSearchQuery(e.target.value)}
                        />
                   </div>
                </div>
                <div className="overflow-y-auto p-2 space-y-1">
                    {filteredModalProjects.length > 0 ? (
                        filteredModalProjects.map(p => (
                            <div 
                                key={p.id} 
                                onClick={() => { onProjectClick(p); setIsShareModalOpen(false); }}
                                className="p-3 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-xl cursor-pointer flex justify-between items-center group transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-cobalt-500/20 text-blue-600 dark:text-cobalt-400 flex items-center justify-center font-bold text-xs">
                                        {p.title.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900 dark:text-white text-sm">{p.title}</div>
                                        <div className="text-xs text-slate-500">{p.id} • {p.clientName}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-cobalt-400 transition-colors text-xs font-medium">
                                    <span>Update</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            No matching projects found.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Floating Action Button - Opens AI Assistant */}
      <button 
        onClick={onToggleAI}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 dark:bg-cobalt-600 dark:hover:bg-cobalt-500 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-all hover:scale-105 z-50 group"
      >
        <Sparkles size={24} className="group-hover:animate-spin-slow" />
      </button>

    </div>
  );
};

export default Dashboard;