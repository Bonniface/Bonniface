import React, { useState } from 'react';
import { User, UserRole, Booking } from '../types';
import BookingSection from './BookingSection';
import { Calendar, Clock, User as UserIcon, Plus, X, ArrowLeft, Loader2 } from 'lucide-react';
import * as api from '../lib/api';

interface BookingsPageProps {
  user: User;
  bookings: Booking[];
}

const BookingsPage: React.FC<BookingsPageProps> = ({ user, bookings }) => {
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const isAdmin = user.role === UserRole.ADMIN;

  const handleCancel = async (bookingId: string) => {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
          setProcessingId(bookingId);
          await api.cancelBooking(bookingId);
          setProcessingId(null);
      }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400';
      case 'Cancelled': return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto h-screen overflow-y-auto pt-16 lg:pt-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pl-12 lg:pl-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {isBookingMode ? 'Schedule Strategy Session' : 'Bookings'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {isBookingMode ? 'Pick a date and time that works for you.' : 'Manage your consultations and discovery calls.'}
          </p>
        </div>
        
        {!isAdmin && (
           <button 
             onClick={() => setIsBookingMode(!isBookingMode)}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md transition-all ${
                 isBookingMode 
                 ? 'bg-slate-200 text-slate-700 dark:bg-navy-800 dark:text-slate-300' 
                 : 'bg-blue-600 hover:bg-blue-700 text-white'
             }`}
           >
             {isBookingMode ? <ArrowLeft size={18} /> : <Plus size={18} />}
             <span>{isBookingMode ? 'Back to List' : 'Book New Session'}</span>
           </button>
        )}
      </div>

      {isBookingMode ? (
          <div className="bg-slate-50 dark:bg-navy-950/20 rounded-3xl p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4">
              <BookingSection user={user} embedded onBooked={() => setIsBookingMode(false)} />
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.length > 0 ? bookings.map((booking) => (
                  <div key={booking.id} className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                              <Calendar size={24} />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                              {booking.status}
                          </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{booking.serviceType}</h3>
                      <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <Clock size={16} />
                              <span>{booking.date} at {booking.time}</span>
                          </div>
                          {isAdmin && (
                              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                  <UserIcon size={16} />
                                  <span>Client: {booking.clientName}</span>
                              </div>
                          )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-navy-800">
                          <button onClick={() => alert('Reschedule functionality coming soon!')} className="flex-1 text-xs font-bold py-2 px-3 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors">
                              Reschedule
                          </button>
                          <button 
                              disabled={processingId === booking.id || booking.status === 'Cancelled'}
                              onClick={() => handleCancel(booking.id)} 
                              className="flex-1 text-xs font-bold py-2 px-3 flex justify-center items-center gap-2 rounded-lg border border-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              {processingId === booking.id ? <Loader2 size={14} className="animate-spin" /> : 'Cancel'}
                          </button>
                      </div>
                  </div>
              )) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                      <Calendar size={48} className="mb-4 opacity-20" />
                      <p>No bookings scheduled yet.</p>
                      {!isAdmin && (
                          <button onClick={() => setIsBookingMode(true)} className="mt-4 text-blue-600 dark:text-blue-400 font-bold hover:underline">
                              Book your first session
                          </button>
                      )}
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default BookingsPage;