import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, Bell, Shield, Palette, Save, Loader2, Check, Database } from 'lucide-react';
import * as api from '../lib/api';

interface SettingsPageProps {
  user: User;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, isDarkMode, toggleTheme }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [currency, setCurrency] = useState('USD');
  
  // Profile Form State
  const [fullName, setFullName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('user_currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    // 1. Save local preferences
    localStorage.setItem('user_currency', currency);

    // 2. Save to Database
    const success = await api.updateUserProfile(user.id, {
        full_name: fullName
    });

    setIsSaving(false);
    
    if (success) {
       setSaveSuccess(true);
       // Refresh page state slightly or wait for global auth listener
       setTimeout(() => setSaveSuccess(false), 3000);
    } else {
        alert("Failed to update profile. Please try again.");
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm("This will generate sample projects and invoices. Continue?")) return;
    
    setIsSeeding(true);
    try {
        await api.generateSampleData(user.id, user.name);
        alert("Sample data generated successfully! Check your Dashboard.");
    } catch (e) {
        alert("Failed to generate data.");
    } finally {
        setIsSeeding(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto h-screen overflow-y-auto pt-16 lg:pt-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-cobalt-600/10 text-blue-600 dark:text-white font-medium'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-6 lg:p-8 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-4">Profile Information</h3>
              <div className="flex items-center gap-6">
                <img src={user.avatarUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-navy-700" />
                <button className="px-4 py-2 border border-slate-200 dark:border-navy-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800">
                  Change Photo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg p-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed" 
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Display Currency</label>
                   <select 
                     value={currency}
                     onChange={(e) => setCurrency(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                   >
                     <option value="USD">USD ($)</option>
                     <option value="EUR">EUR (€)</option>
                     <option value="GBP">GBP (£)</option>
                     <option value="GHS">GHS (₵)</option>
                     <option value="NGN">NGN (₦)</option>
                   </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bio</label>
                  <textarea rows={4} className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tell us about yourself..."></textarea>
                </div>
              </div>

              {/* Data Management Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-navy-800">
                   <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Data Management</h4>
                   <button 
                     onClick={handleSeedData}
                     disabled={isSeeding}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                   >
                       {isSeeding ? <Loader2 size={16} className="animate-spin" /> : <Database size={16} />}
                       Generate Sample Data
                   </button>
                   <p className="text-xs text-slate-400 mt-2">Populates your dashboard with sample projects and invoices for testing.</p>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  id="save-btn"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      saveSuccess 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSaving ? (
                      <Loader2 size={18} className="animate-spin" />
                  ) : saveSuccess ? (
                      <Check size={18} />
                  ) : (
                      <Save size={18} />
                  )}
                  <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {['Email me when a project is updated', 'Email me when I receive a message', 'Send push notifications for new invoices', 'Weekly newsletter'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-navy-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-4">Theme Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark themes</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                  <span className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-navy-800 pb-4">Security</h3>
                <button className="text-red-500 font-medium hover:text-red-600 transition-colors">Change Password</button>
                <button className="block text-red-500 font-medium hover:text-red-600 transition-colors">Enable Two-Factor Authentication</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;