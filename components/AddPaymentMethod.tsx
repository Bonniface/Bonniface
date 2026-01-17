import React, { useState } from 'react';
import { ViewState, PaymentMethod } from '../types';
import { CreditCard, Lock, ChevronLeft, Check, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../lib/api';

interface AddPaymentMethodProps {
  onNavigate: (view: ViewState) => void;
  onSave?: (method: PaymentMethod) => void;
  userId: string;
}

const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({ onNavigate, onSave, userId }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        const newMethod: Omit<PaymentMethod, 'id'> = {
            last4: cardNumber.slice(-4) || '0000',
            brand: 'VISA', // Simple mock detection
            expiry: expiry,
            isDefault: false
        };

        const savedMethod = await api.createPaymentMethod(newMethod, userId);
        
        if (savedMethod) {
            if (onSave) onSave(savedMethod);
            setIsSaved(true);
            setTimeout(() => {
                onNavigate('BILLING');
            }, 1500);
        } else {
            setError("Failed to save card. Please try again.");
        }
    } catch (err) {
        setError("An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto h-screen overflow-y-auto pt-16 lg:pt-8 flex flex-col">
      <button 
        onClick={() => onNavigate('BILLING')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 w-fit transition-colors"
      >
        <ChevronLeft size={20} />
        Back to Billing
      </button>

      <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Add Payment Method</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your credit card details to securely save your payment info.</p>

        {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        {isSaved ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-500 mb-6">
              <Check size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Card Added Successfully</h3>
            <p className="text-slate-500 dark:text-slate-400">Redirecting back to billing...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Card Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000" 
                  className="w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-cobalt-500 transition-colors"
                  required
                  maxLength={19}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                <input 
                  type="text" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY" 
                  className="w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-cobalt-500 transition-colors"
                  required
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">CVC</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123" 
                    className="w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-cobalt-500 transition-colors"
                    required
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cardholder Name</label>
              <input 
                type="text" 
                placeholder="e.g. Sarah Johnson" 
                className="w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white px-4 py-3 rounded-xl border border-slate-200 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-cobalt-500 transition-colors"
                required
              />
            </div>

            <div className="flex gap-4 pt-2">
                <button 
                    type="button"
                    onClick={() => onNavigate('BILLING')}
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
                    {isLoading ? 'Saving...' : 'Save Card'}
                </button>
            </div>
            
            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <Lock size={12} />
                <span>Your payment information is encrypted and secure.</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddPaymentMethod;