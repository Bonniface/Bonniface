import React, { useState } from 'react';
import { ServiceType, User, Project } from '../types';
import { UploadCloud, Check, ChevronRight, ChevronLeft, AlertCircle, Loader2, FileText, X } from 'lucide-react';
import * as api from '../lib/api';

interface NewProjectWizardProps {
    user: User;
    onProjectCreated: (project: Project) => void;
}

const NewProjectWizard: React.FC<NewProjectWizardProps> = ({ user, onProjectCreated }) => {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    budget: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Type' },
    { id: 2, title: 'Details' },
    { id: 3, title: 'Upload' },
    { id: 4, title: 'Review' }
  ];

  const handleNext = async () => {
    // Validation for Step 1
    if (step === 1 && !selectedType) {
        setError("Please select a service type.");
        return;
    }

    // Validation for Step 2
    if (step === 2) {
      if (!formData.title.trim()) {
        setError('Please enter a project title.');
        return;
      }
      
      const budgetAmount = parseFloat(formData.budget);
      if (!formData.budget || isNaN(budgetAmount) || budgetAmount < 150) {
        setError('Minimum budget required is $150 USD.');
        return;
      }
    }

    // Submission on Step 3 (going to 4)
    if (step === 3) {
        setIsSubmitting(true);
        try {
            const newProject = await api.createProject(
                formData.title,
                parseFloat(formData.budget),
                formData.description,
                selectedType!,
                user.id,
                user.name,
                selectedFile || undefined
            );

            if (newProject) {
                onProjectCreated(newProject);
                setStep(4); // Success screen
            } else {
                setError("Failed to create project. Please try again.");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
        return;
    }

    setError(null);
    setStep(s => Math.min(4, s + 1));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error on type
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
          setError(null);
      }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto min-h-screen flex flex-col justify-center pt-16 lg:pt-0">
      <div className="mb-6 lg:mb-10">
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-4 pl-12 lg:pl-0">Start New Project</h2>
        {/* Progress Bar */}
        <div className="flex items-center gap-2 lg:gap-4">
          {steps.map((s) => (
            <div key={s.id} className="flex-1">
              <div className={`h-1 w-full rounded-full mb-2 ${step >= s.id ? 'bg-blue-600 dark:bg-cobalt-500' : 'bg-slate-200 dark:bg-navy-800'}`} />
              <span className={`text-[10px] lg:text-xs font-medium ${step >= s.id ? 'text-blue-600 dark:text-cobalt-400' : 'text-slate-500 dark:text-slate-600'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-navy-800 p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-navy-700 shadow-xl dark:shadow-2xl min-h-[400px] transition-colors duration-300 flex flex-col">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white">What type of service do you need?</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(ServiceType).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setError(null); }}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    selectedType === type 
                      ? 'border-blue-600 dark:border-cobalt-500 bg-blue-50 dark:bg-cobalt-500/10' 
                      : 'border-slate-200 dark:border-navy-600 hover:border-slate-300 dark:hover:border-navy-500 bg-white dark:bg-navy-900'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border mb-4 flex items-center justify-center ${selectedType === type ? 'border-blue-600 dark:border-cobalt-500' : 'border-slate-400 dark:border-slate-500'}`}>
                    {selectedType === type && <div className="w-3 h-3 bg-blue-600 dark:bg-cobalt-500 rounded-full" />}
                  </div>
                  <h4 className="text-base lg:text-lg font-medium text-slate-900 dark:text-white mb-1">{type}</h4>
                  <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400">Professional {type.toLowerCase()} services tailored to your needs.</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Project Details</h3>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Project Title</label>
                <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cobalt-500 outline-none transition-colors" 
                    placeholder="e.g. Sales Forecast Model" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Budget (USD)</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input 
                        type="number" 
                        min="150"
                        value={formData.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl pl-8 pr-4 py-3 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cobalt-500 outline-none transition-colors" 
                        placeholder="Min. 150" 
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1">Minimum budget allowed is $150.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Description</label>
                <textarea 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl p-3 text-slate-900 dark:text-white focus:border-blue-600 dark:focus:border-cobalt-500 outline-none h-32 transition-colors resize-none" 
                    placeholder="Describe your project goals, timeline, and any specific requirements..." 
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Upload Training Data</h3>
            
            <input 
                type="file" 
                id="wizard-file-upload" 
                className="hidden" 
                onChange={handleFileSelect}
            />
            
            {!selectedFile ? (
                <label 
                    htmlFor="wizard-file-upload"
                    className="border-2 border-dashed border-slate-300 dark:border-navy-600 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-navy-900/50 transition-colors cursor-pointer group"
                >
                    <div className="w-16 h-16 bg-slate-100 dark:bg-navy-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud className="text-blue-600 dark:text-cobalt-500" size={32} />
                    </div>
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Click to upload or drag and drop</h4>
                    <p className="text-sm text-slate-500">CSV, PDF, or JSON (Max 50MB)</p>
                </label>
            ) : (
                <div className="bg-blue-50 dark:bg-navy-900 border border-blue-200 dark:border-navy-700 rounded-2xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                            <FileText size={24} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
            )}
          </div>
        )}

        {step === 4 && (
            <div className="text-center py-10 animate-in zoom-in duration-500 flex flex-col items-center justify-center flex-1">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-500">
                    <Check size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Project Submitted!</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                    We'll review your project <strong>{formData.title}</strong> and get back to you with a detailed proposal within 24 hours. A confirmation invoice and chat channel have been created.
                </p>
            </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        {step < 4 && (
          <button 
            onClick={() => { setStep(s => Math.max(1, s - 1)); setError(null); }}
            disabled={step === 1 || isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${step === 1 ? 'opacity-0' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <ChevronLeft size={20} /> Back
          </button>
        )}

        {step < 4 && (
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-cobalt-600 dark:hover:bg-cobalt-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 dark:shadow-cobalt-600/20 transition-all disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                    {step === 3 ? 'Submit Project' : 'Continue'}
                    {step !== 3 && <ChevronRight size={20} />}
                </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default NewProjectWizard;