import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, UserRole, ProjectPhase, ProjectFile, User } from '../types';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, Download, Upload, MoreVertical, Calendar, Loader2, Save, Plus, Trash2, X, Link, Lock, Unlock, Linkedin, Twitter, Mail, GripVertical } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import * as api from '../lib/api';
import { Footer } from './Footer';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  onBack: () => void;
}

interface PhaseItemProps {
    phase: ProjectPhase;
    isEditing: boolean;
    allPhases: ProjectPhase[];
    activePhaseId: string | null;
    isUploading: boolean;
    isAdmin: boolean;
    onUpdate: (id: string, field: keyof ProjectPhase, value: any) => void;
    onDelete: (id: string) => void;
    onDependencyToggle: (phaseId: string, depId: string) => void;
    onUploadClick: (id: string) => void;
}

const PhaseItem = ({ 
    phase, 
    isEditing, 
    allPhases, 
    activePhaseId, 
    isUploading, 
    isAdmin, 
    onUpdate, 
    onDelete, 
    onDependencyToggle, 
    onUploadClick 
}: PhaseItemProps) => {
    const dragControls = useDragControls();

    // Logic for finding dependencies and status
    const dependencies = allPhases.filter(p => phase.dependencies?.includes(p.id)) || [];
    const areDependenciesMet = dependencies.length === 0 || dependencies.every(d => d.status === 'Completed');
    
    // Locked States logic
    const isDependencyLocked = !areDependenciesMet && !isEditing;
    const isCompletedLocked = phase.status === 'Completed' && !isEditing;
    const isLocked = isDependencyLocked || isCompletedLocked;

    const getPhaseIcon = (status: string, isDependencyLocked: boolean) => {
        if (isDependencyLocked) return <Lock className="text-slate-300 dark:text-slate-600" size={24} />;
        switch (status) {
          case 'Completed': return <CheckCircle2 className="text-emerald-500" size={24} />;
          case 'In Progress': return <Clock className="text-blue-500 animate-pulse" size={24} />;
          default: return <Circle className="text-slate-300 dark:text-slate-600" size={24} />;
        }
    };

    return (
        <Reorder.Item
            value={phase}
            id={phase.id}
            dragListener={false}
            dragControls={dragControls}
            className="relative flex gap-6"
            style={{ listStyle: 'none' }} // Ensure no list bullets
        >
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-white dark:bg-navy-900">
                    {getPhaseIcon(phase.status, isDependencyLocked)}
                </div>
                {isEditing && (
                    <div 
                        onPointerDown={(e) => dragControls.start(e)}
                        className="p-1 cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 touch-none active:cursor-grabbing"
                    >
                        <GripVertical size={16} />
                    </div>
                )}
            </div>
            
            {/* Phase Card */}
            <div className={`flex-1 rounded-xl p-5 border transition-all ${
                isEditing 
                ? 'bg-white dark:bg-navy-900 border-blue-300 dark:border-blue-700 shadow-md' 
                : isDependencyLocked
                    ? 'bg-slate-50/50 dark:bg-navy-950/30 border-slate-100 dark:border-navy-800 opacity-70 grayscale-[0.5]'
                    : isCompletedLocked
                        ? 'bg-emerald-50/20 dark:bg-emerald-900/10 border-emerald-100/50 dark:border-emerald-900/20'
                        : 'bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 hover:border-blue-200 dark:hover:border-navy-700'
            }`}>
            {isEditing ? (
                /* EDIT MODE for Phase */
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <input 
                            type="text" 
                            value={phase.title}
                            onChange={(e) => onUpdate(phase.id, 'title', e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Phase Title"
                        />
                        <div className="flex gap-2 w-full md:w-auto">
                            <select 
                                value={phase.status}
                                onChange={(e) => {
                                const newStatus = e.target.value;
                                if (newStatus === 'Completed' && phase.status !== 'Completed') {
                                    if (window.confirm('Are you sure you want to mark this phase as Completed?')) {
                                    onUpdate(phase.id, 'status', newStatus);
                                    }
                                } else {
                                    onUpdate(phase.id, 'status', newStatus);
                                }
                                }}
                                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button 
                                onClick={() => onDelete(phase.id)}
                                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                title="Delete Phase"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Dependency Selector */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 block">Depends on:</label>
                        <div className="flex flex-wrap gap-2">
                            {allPhases.filter(p => p.id !== phase.id).map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => onDependencyToggle(phase.id, p.id)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        phase.dependencies?.includes(p.id)
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30'
                                            : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-navy-800 dark:text-slate-400 dark:border-navy-700 hover:bg-slate-200 dark:hover:bg-navy-700'
                                    }`}
                                >
                                    {phase.dependencies?.includes(p.id) && <CheckCircle2 size={12} className="inline mr-1" />}
                                    {p.title}
                                </button>
                            ))}
                            {(!allPhases || allPhases.length <= 1) && (
                                <span className="text-xs text-slate-400 italic">No other phases available</span>
                            )}
                        </div>
                    </div>

                    {/* Description Edit */}
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Description</label>
                        <textarea 
                            value={phase.description}
                            onChange={(e) => onUpdate(phase.id, 'description', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[80px]"
                            rows={3}
                            placeholder="Describe the deliverables for this phase..."
                        />
                    </div>
                </div>
            ) : (
                /* VIEW MODE for Phase */
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                            <h3 className={`font-semibold ${isDependencyLocked ? 'text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                                {phase.title}
                            </h3>
                            {isDependencyLocked && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-200 dark:bg-navy-800 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Locked
                                </span>
                            )}
                            {isCompletedLocked && (
                                <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-200 dark:border-emerald-900/50">
                                    <Lock size={10} />
                                    Locked
                                </span>
                            )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        phase.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        phase.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {phase.status}
                        </span>
                    </div>

                    {/* Dependencies Display */}
                    {dependencies.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Link size={12} /> Depends on:
                            </span>
                            {dependencies.map(d => (
                                <span key={d.id} className={`text-xs px-2 py-0.5 rounded border ${
                                    d.status === 'Completed' 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                        : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                }`}>
                                    {d.title}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{phase.description}</p>
                </>
            )}
            
            {/* Files Section */}
            {((phase.files && phase.files.length > 0) || (activePhaseId === phase.id && isUploading)) && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-navy-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Attached Files</p>
                {phase.files && phase.files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-white dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-800 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 rounded">
                        <FileText size={16} />
                        </div>
                        <div>
                        <a href={file.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors hover:underline">
                            {file.name}
                        </a>
                        <p className="text-xs text-slate-500">Uploaded by {file.uploadedBy} • {file.date}</p>
                        </div>
                    </div>
                    <a href={file.url} download={file.name} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <Download size={16} />
                    </a>
                    </div>
                ))}
                
                {/* Upload Loading State */}
                {activePhaseId === phase.id && isUploading && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-navy-900/50 rounded-lg border border-dashed border-blue-300 dark:border-blue-700">
                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={18} />
                    <span className="text-sm text-slate-600 dark:text-slate-300">Uploading to secure vault...</span>
                    </div>
                )}
                </div>
            )}

            {/* Upload Button */}
            {isAdmin && !isEditing && (phase.status === 'In Progress' || phase.status === 'Pending') && !isUploading && !isLocked && (
                <button 
                onClick={() => onUploadClick(phase.id)}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                <Upload size={14} />
                Upload file to this phase
                </button>
            )}
            </div>
        </Reorder.Item>
    );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, currentUser, onBack }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.IN_PROGRESS: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10';
      case ProjectStatus.COMPLETED: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
      case ProjectStatus.PAID: return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const handleUploadClick = (phaseId: string) => {
    setActivePhaseId(phaseId);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activePhaseId) return;

    setIsUploading(true);

    try {
        const newFile = await api.uploadProjectFile(file, activePhaseId, currentUser.name);

        if (newFile) {
            setCurrentProject(prev => {
                const updatedPhases = prev.phases?.map(phase => {
                    if (phase.id === activePhaseId) {
                        return {
                            ...phase,
                            files: [...(phase.files || []), newFile]
                        };
                    }
                    return phase;
                });
                return { ...prev, phases: updatedPhases };
            });
        } else {
            alert('File upload failed. Please try again.');
        }
    } catch (error) {
        console.error('Upload failed', error);
        alert('An error occurred during upload.');
    } finally {
        setIsUploading(false);
        setActivePhaseId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  // --- Edit Mode Handlers ---

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handlePhaseUpdate = (phaseId: string, field: keyof ProjectPhase, value: any) => {
    setCurrentProject(prev => {
      const updatedPhases = prev.phases?.map(p => {
        if (p.id === phaseId) {
          return { ...p, [field]: value };
        }
        return p;
      });
      return { ...prev, phases: updatedPhases };
    });
  };

  const handlePhaseDependencyToggle = (phaseId: string, dependencyId: string) => {
    setCurrentProject(prev => {
      const updatedPhases = prev.phases?.map(p => {
        if (p.id === phaseId) {
            const currentDeps = p.dependencies || [];
            const newDeps = currentDeps.includes(dependencyId)
                ? currentDeps.filter(id => id !== dependencyId)
                : [...currentDeps, dependencyId];
            return { ...p, dependencies: newDeps };
        }
        return p;
      });
      return { ...prev, phases: updatedPhases };
    });
  };

  const handleReorderPhases = (newPhases: ProjectPhase[]) => {
      setCurrentProject(prev => ({
          ...prev,
          phases: newPhases
      }));
  };

  const handleAddPhase = () => {
    const newPhase: ProjectPhase = {
      id: `ph-${Date.now()}`,
      title: 'New Project Phase',
      description: 'Describe the deliverables for this phase...',
      status: 'Pending',
      files: [],
      dependencies: []
    };
    setCurrentProject(prev => ({
      ...prev,
      phases: [...(prev.phases || []), newPhase]
    }));
  };

  const handleDeletePhase = (phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
        setCurrentProject(prev => ({
            ...prev,
            phases: prev.phases?.filter(p => p.id !== phaseId)
        }));
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 transition-colors">
      
      {/* Hidden File Input */}
      {isAdmin && (
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange} 
        />
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
            {/* Header */}
            <div className="mb-8">
                <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
                >
                <ArrowLeft size={20} />
                <span>Back to Projects</span>
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">{currentProject.title}</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Due {currentProject.deadline}
                    </span>
                    <span>•</span>
                    <span>ID: {currentProject.id}</span>
                    {isAdmin && (
                        <>
                        <span>•</span>
                        <span>Client: {currentProject.clientName}</span>
                        </>
                    )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(currentProject.status)}`}>
                    {currentProject.status}
                    </span>
                    {isAdmin && (
                    <button 
                        onClick={toggleEditMode}
                        className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2 ${
                            isEditing 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                        }`}
                    >
                        {isEditing ? (
                            <>
                                <Save size={16} />
                                Save Roadmap
                            </>
                        ) : (
                            'Edit Project'
                        )}
                    </button>
                    )}
                </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main Content - Phases Timeline */}
                <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Roadmap</h2>
                        {isEditing && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-pulse bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                Editing Mode Active - Drag to Reorder
                            </span>
                        )}
                    </div>
                    
                    <Reorder.Group 
                        axis="y"
                        values={currentProject.phases || []}
                        onReorder={handleReorderPhases}
                        className="relative space-y-8 before:absolute before:inset-0 before:ml-3 before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 dark:before:bg-navy-800 before:content-['']"
                    >
                    {currentProject.phases && currentProject.phases.length > 0 ? (
                        currentProject.phases.map((phase) => (
                            <PhaseItem 
                                key={phase.id}
                                phase={phase}
                                isEditing={isEditing}
                                allPhases={currentProject.phases || []}
                                activePhaseId={activePhaseId}
                                isUploading={isUploading}
                                isAdmin={isAdmin}
                                onUpdate={handlePhaseUpdate}
                                onDelete={handleDeletePhase}
                                onDependencyToggle={handlePhaseDependencyToggle}
                                onUploadClick={handleUploadClick}
                            />
                        ))
                    ) : (
                        <div className="ml-10 py-10 text-slate-500 dark:text-slate-400">
                        No phases defined for this project yet.
                        </div>
                    )}
                    </Reorder.Group>

                    {/* Add New Phase Button */}
                    {isEditing && (
                        <div className="relative pl-12 animate-in fade-in slide-in-from-bottom-2 mt-8">
                            <button 
                                onClick={handleAddPhase}
                                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                                    <Plus size={18} />
                                </div>
                                <span className="font-medium">Add New Phase</span>
                            </button>
                        </div>
                    )}
                    </div>
                </div>

                {/* Sidebar - Overview */}
                <div className="space-y-6">
                <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Project Overview</h3>
                    <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Budget</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">${currentProject.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Service Type</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{currentProject.serviceType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-navy-800">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Start Date</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">Oct 01, 2024</span>
                    </div>
                    <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Completion</span>
                            <span className="text-slate-900 dark:text-white font-medium">65%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-navy-950 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-[65%] rounded-full"></div>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="bg-blue-600 dark:bg-cobalt-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 dark:shadow-cobalt-600/20">
                    <h3 className="font-bold text-lg mb-2">Project Files</h3>
                    <p className="text-blue-100 text-sm mb-4">Access all deliverables and contracts in one place.</p>
                    <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-medium transition-colors border border-white/30">
                    Open File Vault
                    </button>
                </div>
                </div>
            </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default ProjectDetails;