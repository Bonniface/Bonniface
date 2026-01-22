import React, { useState, useRef } from 'react';
import { Project, ProjectStatus, UserRole, ProjectPhase, ProjectFile, User } from '../types';
import { ArrowLeft, CheckCircle2, Circle, Clock, FileText, Download, Upload, Calendar, Loader2, Save, Plus, Trash2, GripVertical, X, Cloud, Image as ImageIcon } from 'lucide-react';
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
    uploadProgress: { current: number; total: number };
    isAdmin: boolean;
    onUpdate: (id: string, field: keyof ProjectPhase, value: any) => void;
    onDelete: (id: string) => void;
    onUploadModeToggle: (id: string | null) => void;
    onFileDrop: (e: React.DragEvent, phaseId: string) => void;
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
}

const PhaseItem: React.FC<PhaseItemProps> = ({ 
    phase, 
    isEditing, 
    activePhaseId, 
    isUploading, 
    uploadProgress,
    isAdmin, 
    onUpdate, 
    onDelete, 
    onUploadModeToggle,
    onFileDrop,
    onFileInputChange,
    fileInputRef
}) => {
    const dragControls = useDragControls();
    const [isDragOver, setIsDragOver] = useState(false);

    const getPhaseIcon = (status: string) => {
        switch (status) {
          case 'Completed': return <CheckCircle2 className="text-emerald-500" size={24} />;
          case 'In Progress': return <Clock className="text-blue-500 animate-pulse" size={24} />;
          default: return <Circle className="text-slate-300 dark:text-slate-600" size={24} />;
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        onFileDrop(e, phase.id);
    };

    // Calculate percentage for progress bar
    const progressPercent = uploadProgress.total > 0 
        ? Math.round((uploadProgress.current / uploadProgress.total) * 100) 
        : 0;

    return (
        <Reorder.Item
            value={phase}
            id={phase.id}
            dragListener={false}
            dragControls={dragControls}
            className="relative flex gap-6"
            style={{ listStyle: 'none' }} 
            whileDrag={{ 
                scale: 1.02,
                zIndex: 50,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
        >
            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center bg-white dark:bg-navy-900 transition-all duration-200 ${isEditing ? 'scale-90 opacity-70' : ''}`}>
                    {getPhaseIcon(phase.status)}
                </div>
                {isEditing && (
                    <div 
                        onPointerDown={(e) => dragControls.start(e)}
                        className="p-2 mt-1 cursor-grab text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 bg-slate-50 dark:bg-navy-800 rounded-lg border border-slate-200 dark:border-navy-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all touch-none active:cursor-grabbing shadow-sm active:scale-95"
                        title="Drag to reorder phase"
                    >
                        <GripVertical size={18} />
                    </div>
                )}
            </div>
            
            <div className={`flex-1 rounded-xl p-5 border transition-all duration-200 ${
                isEditing 
                ? 'bg-white dark:bg-navy-900 border-dashed border-blue-300 dark:border-blue-700/50 shadow-md ring-1 ring-blue-50 dark:ring-blue-900/20' 
                : 'bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 hover:border-blue-200 dark:hover:border-navy-700'
            }`}>
            {isEditing ? (
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
                                onChange={(e) => onUpdate(phase.id, 'status', e.target.value)}
                                className="bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <button 
                                onClick={() => onDelete(phase.id)}
                                className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">Description</label>
                        <textarea 
                            value={phase.description}
                            onChange={(e) => onUpdate(phase.id, 'description', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[80px]"
                            rows={3}
                        />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                {phase.title}
                            </h3>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                        phase.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                        phase.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                        {phase.status}
                        </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{phase.description}</p>
                </>
            )}
            
            {/* Files Section */}
            {(phase.files && phase.files.length > 0) && (
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-navy-800">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-2">Attached Files</p>
                    {phase.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-800 group hover:border-blue-300 dark:hover:border-navy-600 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-navy-800 text-blue-600 dark:text-blue-400 rounded">
                                    {file.type === 'img' ? <ImageIcon size={16} /> : <FileText size={16} />}
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
                </div>
            )}

            {/* Upload Area (Drag & Drop) */}
            {activePhaseId === phase.id ? (
                <div 
                    className={`mt-4 rounded-xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                        isDragOver 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/50'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isUploading ? (
                        <div className="p-6 flex flex-col items-center justify-center">
                             <div className="w-full max-w-xs mb-2">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Uploading...</span>
                                    <span>{progressPercent}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-navy-700 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                             </div>
                             <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                 Processing file {Math.min(uploadProgress.current + 1, uploadProgress.total)} of {uploadProgress.total}
                             </p>
                        </div>
                    ) : (
                        <div className="relative p-6 flex flex-col items-center justify-center text-center group">
                            <button 
                                onClick={() => onUploadModeToggle(null)}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-navy-800 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            
                            <div className="w-12 h-12 bg-white dark:bg-navy-800 rounded-full flex items-center justify-center text-blue-500 mb-3 shadow-sm group-hover:scale-110 transition-transform">
                                <Cloud size={24} />
                            </div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                                Drag files here or <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 hover:underline">browse</button>
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Supports images, documents, CSV, and ZIP
                            </p>
                            
                            {/* Hidden Input for Click Selection */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                multiple
                                onChange={onFileInputChange} 
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* Collapsed Upload Button */
                isAdmin && !isEditing && (phase.status === 'In Progress' || phase.status === 'Pending') && (
                    <button 
                        onClick={() => onUploadModeToggle(phase.id)}
                        className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                        <Upload size={14} />
                        Upload files to this phase
                    </button>
                )
            )}
            </div>
        </Reorder.Item>
    );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, currentUser, onBack }) => {
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isEditing, setIsEditing] = useState(false);
  
  // Ref for file input element inside PhaseItem
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

  const handleUploadModeToggle = (phaseId: string | null) => {
    setActivePhaseId(phaseId);
    // Reset any pending inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = async (files: FileList) => {
      if (!files || files.length === 0 || !activePhaseId) return;

      setIsUploading(true);
      setUploadProgress({ current: 0, total: files.length });

      try {
          const newFiles: ProjectFile[] = [];

          for (let i = 0; i < files.length; i++) {
              const file = files[i];
              // Upload sequentially
              const uploaded = await api.uploadProjectFile(file, activePhaseId, currentUser.name);
              
              if (uploaded) {
                  newFiles.push(uploaded);
              }
              
              // Update progress
              setUploadProgress(prev => ({ ...prev, current: i + 1 }));
          }

          // Update Project State with all new files
          if (newFiles.length > 0) {
            setCurrentProject(prev => {
                const updatedPhases = prev.phases?.map(phase => {
                    if (phase.id === activePhaseId) {
                        return {
                            ...phase,
                            files: [...(phase.files || []), ...newFiles]
                        };
                    }
                    return phase;
                });
                return { ...prev, phases: updatedPhases };
            });
          }

      } catch (error) {
          console.error('Batch Upload failed', error);
          alert('Some files failed to upload. Please check the console or try again.');
      } finally {
          setIsUploading(false);
          setActivePhaseId(null); // Close dropzone on finish
          if (fileInputRef.current) {
              fileInputRef.current.value = '';
          }
      }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
          processFiles(event.target.files);
      }
  };

  const handleFileDrop = (event: React.DragEvent, phaseId: string) => {
      // Ensure we are dropping onto the active phase
      if (phaseId !== activePhaseId) return;
      
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
          processFiles(files);
      }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const handlePhaseUpdate = async (phaseId: string, field: keyof ProjectPhase, value: any) => {
    // Optimistic Update
    setCurrentProject(prev => {
      const updatedPhases = prev.phases?.map(p => {
        if (p.id === phaseId) {
          return { ...p, [field]: value };
        }
        return p;
      });
      return { ...prev, phases: updatedPhases };
    });

    // API Call
    await api.updateProjectPhase(phaseId, { [field]: value });
  };

  const handleReorderPhases = (newPhases: ProjectPhase[]) => {
      // Reorder logic handled by Framer Motion locally
      setCurrentProject(prev => ({
          ...prev,
          phases: newPhases
      }));
  };

  const handleAddPhase = async () => {
    const newPhase: ProjectPhase = {
      id: `ph-${Date.now()}`,
      title: 'New Project Phase',
      description: 'Describe the deliverables for this phase...',
      status: 'Pending',
      files: [],
      dependencies: []
    };

    // Optimistic
    setCurrentProject(prev => ({
      ...prev,
      phases: [...(prev.phases || []), newPhase]
    }));

    // API
    await api.createProjectPhase(newPhase, currentProject.id);
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
        // Optimistic
        setCurrentProject(prev => ({
            ...prev,
            phases: prev.phases?.filter(p => p.id !== phaseId)
        }));

        // API
        await api.deleteProjectPhase(phaseId);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-navy-950 transition-colors">
      
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-16 lg:pt-8 flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
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
                                Done Editing
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
                <div className="lg:col-span-2 space-y-8">
                <div className="bg-white dark:bg-navy-900 rounded-2xl p-6 border border-slate-200 dark:border-navy-800 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Roadmap</h2>
                        {isEditing && (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-pulse bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                Editing Mode Active
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
                                uploadProgress={uploadProgress}
                                isAdmin={isAdmin}
                                onUpdate={handlePhaseUpdate}
                                onDelete={handleDeletePhase}
                                onUploadModeToggle={handleUploadModeToggle}
                                onFileDrop={handleFileDrop}
                                onFileInputChange={handleFileInputChange}
                                fileInputRef={fileInputRef}
                            />
                        ))
                    ) : (
                        <div className="ml-10 py-10 text-slate-500 dark:text-slate-400">
                        No phases defined for this project yet.
                        </div>
                    )}
                    </Reorder.Group>

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
                    </div>
                </div>

                <div className="bg-blue-600 dark:bg-cobalt-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-600/20 dark:shadow-cobalt-600/20">
                    <h3 className="font-bold text-lg mb-2">Project Files</h3>
                    <p className="text-blue-100 text-sm mb-4">Access all deliverables and contracts in one place.</p>
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