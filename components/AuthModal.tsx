import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ADMIN_USER } from '../constants';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user?: User) => void; // Callback to parent on successful login
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await (supabase.auth as any).signUp({
          email,
          password,
        });
        if (error) throw error;
        // Depending on Supabase settings, email confirmation might be required.
        // For this UX, we assume success or show a message.
        alert('Account created! Please check your email to confirm.');
        onClose();
      } else {
        const { error } = await (supabase.auth as any).signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onLogin(); // App.tsx listener will also catch this
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await (supabase.auth as any).signInWithOAuth({
        provider: provider,
        options: {
            redirectTo: window.location.origin // Redirect back to this page
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleAdminBackdoor = () => {
    // Secret backdoor to log in as Admin with mock data
    onLogin(ADMIN_USER);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-navy-900 border border-navy-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          {/* Backdoor Button */}
          <button 
            onClick={handleAdminBackdoor} 
            className="absolute top-4 left-4 text-slate-700 hover:text-blue-500 transition-colors z-10 opacity-50 hover:opacity-100"
            title="Demo Admin Login"
          >
            <Key size={16} />
          </button>
          
          <div className="p-8">
            <div className="text-center mb-8">
                <img 
                  src="/assets/boni_avatar.jpg" 
                  alt="Bonniface Logo" 
                  className="w-16 h-16 rounded-xl mx-auto mb-6 object-cover shadow-lg shadow-blue-600/20"
                  onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      e.currentTarget.nextElementSibling?.classList.add('flex');
                  }}
                />
                <div className="hidden w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl mx-auto items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                    <span className="text-2xl font-bold text-white">B</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-400">
                    {isSignUp ? 'Start your journey with Bonniface' : 'Sign in to access your dashboard'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com" 
                            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                        />
                    </div>
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all" 
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="relative py-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-navy-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-navy-900 text-slate-500">Or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                    className="bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                </button>
                <button 
                    onClick={() => handleOAuthLogin('apple')}
                    disabled={isLoading}
                    className="bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.47-1.09-.42-2.09-.48-3.24 0-1.44.58-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.11 3.35-1.11.66 0 1.7.29 2.23.83-.34.22-.64.48-.89.79-1.89 2.26-.14 5.56 2.62 6.77-.52 1.33-1.13 2.72-2.02 4.04-.6.89-1.38 1.95-2.37 1.91zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                   Apple
                </button>
            </div>
            
            <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button 
                        onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                        className="text-blue-500 hover:text-blue-400 font-medium ml-1 transition-colors"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
          </div>
       </div>
    </div>
  );
}