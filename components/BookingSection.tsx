import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import * as api from '../lib/api';
import { User } from '../types';

interface BookingSectionProps {
    user: User | null;
    onBooked?: () => void;
    embedded?: boolean; // If in dashboard, styles change slightly
}

const BookingSection: React.FC<BookingSectionProps> = ({ user, onBooked, embedded = false }) => {
    const [selectedDate, setSelectedDate] = useState<number>(5);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookedSuccess, setBookedSuccess] = useState(false);

    const timeSlots = ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"];
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

    const handleBooking = async () => {
        if (!selectedTime) return;
        if (!user) {
            alert("Please login to book a session.");
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${selectedDate.toString().padStart(2, '0')}`;
            const result = await api.createBooking(user.id, user.name, dateStr, selectedTime);
            if (result) {
                setBookedSuccess(true);
            }
        } catch (e) {
            alert("Booking failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (bookedSuccess) {
        return (
            <div className="bg-white dark:bg-navy-900 rounded-3xl p-12 shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-6">
                    <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Booking Confirmed!</h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8">Your 1-on-1 strategy call is set for {monthName} {selectedDate}th at {selectedTime}.</p>
                <div className="flex gap-4">
                    <button onClick={() => setBookedSuccess(false)} className="text-blue-600 font-bold hover:underline">Book another</button>
                    {onBooked && (
                        <button onClick={onBooked} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors">Return to Bookings</button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${embedded ? 'p-0' : 'py-24 px-6 max-w-7xl mx-auto'}`}>
            <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">Simple Online Booking</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                    Skip the phone tag. Choose a time that works best for you directly from our live calendar. It takes less than 2 minutes to secure your appointment.
                </p>

                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Instant Confirmation</h4>
                            <p className="text-sm text-slate-500">Receive an email and SMS confirmation immediately.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <CalendarIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Flexible Rescheduling</h4>
                            <p className="text-sm text-slate-500">Need to change times? Easily reschedule online up to 24 hours before.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar UI */}
            <div className="bg-white dark:bg-navy-900 rounded-3xl shadow-2xl p-6 md:p-8 border border-slate-100 dark:border-navy-800 animate-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => {
                            if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); } 
                            else { setCurrentMonth(currentMonth - 1); }
                            setSelectedDate(1);
                        }}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-full text-slate-400"
                    >
                        <ChevronLeft />
                    </button>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{monthName} {currentYear}</h3>
                    <button 
                        onClick={() => {
                            if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); } 
                            else { setCurrentMonth(currentMonth + 1); }
                            setSelectedDate(1);
                        }}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-full text-slate-400"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-y-2 text-center mb-6">
                    {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                        <div key={d} className="text-xs font-bold text-slate-400 py-2">{d}</div>
                    ))}
                    {Array.from({length: firstDayOfMonth}).map((_, i) => <div key={`empty-${i}`} />)}
                    {days.map(d => (
                        <button 
                            key={d} 
                            onClick={() => setSelectedDate(d)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all mx-auto ${
                                selectedDate === d 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>

                <div className="border-t border-slate-100 dark:border-navy-800 pt-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-4">Available times for {monthName} {selectedDate}th</p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {timeSlots.map(time => (
                            <button 
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                                    selectedTime === time
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-600'
                                    : 'border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-navy-500'
                                }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>

                    <button 
                        onClick={handleBooking}
                        disabled={!selectedTime || isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Sparkles size={18} /> Confirm Booking</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSection;