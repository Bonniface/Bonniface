import React from 'react';
import { Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-8 px-6 border-t border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center">
                <img 
                  src="/assets/boni_avatar.jpg" 
                  alt="Bonniface Logo" 
                  className="w-8 h-8 rounded-lg object-cover shadow-lg"
                 
                />
                <span className="font-bold text-slate-900 dark:text-white text-xl ml-3 tracking-wide">Bonniface</span>
                </div>
                <div className="text-slate-500 text-sm">© 2025 Bonniface. Creative Development & AI.</div>
                <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors p-2 bg-slate-100 dark:bg-navy-900 rounded-full hover:bg-blue-50 dark:hover:bg-navy-800"><Twitter size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors p-2 bg-slate-100 dark:bg-navy-900 rounded-full hover:bg-blue-50 dark:hover:bg-navy-800"><Linkedin size={18} /></a>
                <a href="#" className="text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors p-2 bg-slate-100 dark:bg-navy-900 rounded-full hover:bg-blue-50 dark:hover:bg-navy-800"><Mail size={18} /></a>
                </div>
        </div>
    </footer>
  );
};