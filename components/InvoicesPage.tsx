import React from 'react';
import { Invoice, User, UserRole, ViewState, PaymentMethod } from '../types';
import { Download, Search, Filter, CreditCard, Plus, Trash2 } from 'lucide-react';

interface InvoicesPageProps {
  user: User;
  invoices: Invoice[];
  paymentMethods?: PaymentMethod[];
  onNavigate?: (view: ViewState) => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = ({ user, invoices, paymentMethods = [], onNavigate }) => {
  const isAdmin = user.role === UserRole.ADMIN;
  
  const filteredInvoices = isAdmin 
    ? invoices 
    : invoices.filter(inv => inv.clientName === user.name);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500';
      case 'Pending': return 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500';
      case 'Overdue': return 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-screen overflow-y-auto pt-16 lg:pt-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{isAdmin ? 'Invoices' : 'Billing & Invoices'}</h2>
          <p className="text-slate-500 dark:text-slate-400">{isAdmin ? 'Manage all client invoices.' : 'View your payment history and manage methods.'}</p>
        </div>
        
        {!isAdmin && onNavigate && (
           <button 
             onClick={() => onNavigate('ADD_PAYMENT_METHOD')}
             className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md transition-colors"
           >
             <Plus size={18} />
             <span>Add Payment Method</span>
           </button>
        )}
      </div>

      {!isAdmin && (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="p-5 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex flex-col justify-between h-36 relative group transition-all hover:shadow-md">
                      <div className="flex justify-between items-start">
                          <CreditCard className="text-blue-600 dark:text-blue-400" size={24} />
                          {pm.isDefault && (
                            <span className="bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Default</span>
                          )}
                      </div>
                      <div>
                          <p className="font-mono text-slate-900 dark:text-white text-lg tracking-wider mb-1">•••• •••• •••• {pm.last4}</p>
                          <div className="flex justify-between items-end">
                              <p className="text-xs text-slate-500 dark:text-slate-400">Expires {pm.expiry}</p>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{pm.brand}</p>
                          </div>
                      </div>
                      <button className="absolute top-4 right-4 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Trash2 size={16} />
                      </button>
                  </div>
                ))}
                
                {/* Add New Card Placeholder */}
                <button 
                    onClick={() => onNavigate && onNavigate('ADD_PAYMENT_METHOD')}
                    className="p-5 border border-dashed border-slate-300 dark:border-navy-700 rounded-2xl flex flex-col items-center justify-center h-36 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-navy-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all gap-2 group"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center transition-colors">
                        <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium">Add New Card</span>
                </button>
            </div>
        </div>
      )}

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-navy-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">Invoice History</h3>
            <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                    type="text" 
                    placeholder="Search invoices..." 
                    className="w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-navy-700 focus:outline-none focus:border-blue-500 dark:focus:border-cobalt-500 text-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-navy-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 text-sm font-medium">
                    <Filter size={16} />
                </button>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-navy-950/50 border-b border-slate-200 dark:border-navy-800">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project ID</th>
                {isAdmin && <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>}
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors group">
                  <td className="p-4 font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{inv.id}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{inv.projectId}</td>
                  {isAdmin && <td className="p-4 text-sm text-slate-900 dark:text-white">{inv.clientName}</td>}
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{inv.date}</td>
                  <td className="p-4 font-mono text-sm text-slate-900 dark:text-white font-semibold">${inv.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-cobalt-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-navy-800" title="Download PDF">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;