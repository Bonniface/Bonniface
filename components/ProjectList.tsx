import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus } from '../types';
import { Calendar, MoreHorizontal, Filter, ArrowUpDown, ArrowUp, ArrowDown, Check, DollarSign, Clock } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
}

type SortField = 'deadline' | 'budget' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

const ProjectList: React.FC<ProjectListProps> = ({ projects, onProjectClick }) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20';
      case ProjectStatus.COMPLETED: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500 dark:border-emerald-500/20';
      case ProjectStatus.PAID: return 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 dark:border-blue-500/20';
      case ProjectStatus.DECLINED: return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending
    }
    setIsSortMenuOpen(false);
  };

  const parseDateValue = (dateStr: string) => {
    if (!dateStr) return 0;
    // Handle mock data formats and potential relative strings
    const lower = dateStr.toLowerCase();
    if (lower.includes('ago')) return new Date().getTime(); // Treat "ago" as very recent (approx now) for sorting
    if (lower === 'yesterday') return new Date().getTime() - 86400000;
    
    const parsed = Date.parse(dateStr);
    return isNaN(parsed) ? 0 : parsed;
  };

  const sortedProjects = useMemo(() => {
    if (!sortField) return projects;

    return [...projects].sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortField) {
        case 'budget':
          valA = a.budget;
          valB = b.budget;
          break;
        case 'deadline':
           valA = parseDateValue(a.deadline);
           valB = parseDateValue(b.deadline);
           break;
        case 'lastUpdated':
           valA = parseDateValue(a.lastUpdated);
           valB = parseDateValue(b.lastUpdated);
           break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortField, sortDirection]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-screen overflow-y-auto pt-16 lg:pt-8">
      {/* Header with Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4 sm:gap-0 pl-12 lg:pl-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">Projects</h2>
          <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400">Manage your AI and Data Science initiatives.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            {/* Sort Dropdown */}
            <div className="relative">
                <button 
                  onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-colors w-full sm:w-auto justify-center ${
                      sortField 
                      ? 'bg-blue-50 dark:bg-cobalt-500/10 text-blue-600 dark:text-cobalt-400 border-blue-200 dark:border-cobalt-500/30' 
                      : 'bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-navy-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ArrowUpDown size={16} />
                  <span>Sort</span>
                  {sortField && (
                      <span className="ml-1 text-xs bg-blue-100 dark:bg-cobalt-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
                          {sortField === 'lastUpdated' ? 'Date' : sortField}
                      </span>
                  )}
                </button>
                
                {isSortMenuOpen && (
                   <>
                       <div className="fixed inset-0 z-10" onClick={() => setIsSortMenuOpen(false)}></div>
                       <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-navy-900 rounded-xl shadow-xl border border-slate-200 dark:border-navy-800 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          <div className="p-2 space-y-1">
                             <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort By</div>
                             
                             {[
                                { id: 'deadline', label: 'Deadline', icon: Calendar },
                                { id: 'budget', label: 'Budget', icon: DollarSign },
                                { id: 'lastUpdated', label: 'Last Updated', icon: Clock }
                             ].map((opt) => (
                                 <button 
                                    key={opt.id}
                                    onClick={() => handleSort(opt.id as SortField)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                        sortField === opt.id 
                                        ? 'bg-blue-50 dark:bg-cobalt-500/10 text-blue-600 dark:text-cobalt-400' 
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800'
                                    }`}
                                 >
                                    <div className="flex items-center gap-2">
                                        <opt.icon size={16} />
                                        <span>{opt.label}</span>
                                    </div>
                                    {sortField === opt.id && (
                                        <div className="flex items-center gap-1">
                                            {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                            <Check size={14} />
                                        </div>
                                    )}
                                 </button>
                             ))}

                             {sortField && (
                                 <div className="pt-2 mt-2 border-t border-slate-100 dark:border-navy-800">
                                     <button 
                                        onClick={() => { setSortField(null); setIsSortMenuOpen(false); }}
                                        className="w-full text-center py-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                     >
                                         Clear Sort
                                     </button>
                                 </div>
                             )}
                          </div>
                       </div>
                   </>
                )}
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-navy-800 text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-navy-700 shadow-sm transition-colors w-full sm:w-auto justify-center">
              <Filter size={16} />
              <span>Filter</span>
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/50">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Project Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Client</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Service</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th 
                    className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
                    onClick={() => handleSort('budget')}
                >
                    <div className="flex items-center gap-1">
                        Budget
                        {sortField === 'budget' && (
                            sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                    </div>
                </th>
                <th 
                    className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors group"
                    onClick={() => handleSort('deadline')}
                >
                    <div className="flex items-center gap-1">
                        Deadline
                        {sortField === 'deadline' && (
                            sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                    </div>
                </th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {sortedProjects.map((project) => (
                <tr 
                  key={project.id} 
                  onClick={() => onProjectClick(project)}
                  className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group cursor-pointer"
                >
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-white">{project.title}</div>
                    <div className="text-xs text-slate-500">{project.id}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{project.clientName}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">{project.serviceType}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 dark:border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-nowrap">${project.budget.toLocaleString()}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 whitespace-nowrap">
                    <Calendar size={14} />
                    {project.deadline}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-navy-700 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white lg:opacity-0 lg:group-hover:opacity-100 transition-all opacity-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;