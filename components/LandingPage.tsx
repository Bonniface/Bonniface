import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Menu, X, Linkedin, Twitter, Mail, 
  Code2, GraduationCap, BarChart3, Brain, Zap, Terminal, 
  Cpu, LineChart, Database, Target, ShieldCheck, ChevronDown,
  Search, Lightbulb, Rocket, CheckCircle, Video, Users, MessageSquare,
  Github, Phone, PenTool, ChevronRight, Sparkles, Send, MessageCircle, Bot, Music, Globe, Lock
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import ThreeHero from './ThreeHero';
import BookingSection from './BookingSection';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import boniAvatar from '../images/boni_avatar.jpg';

const testimonials = [
  {
    id: 1,
    name: "@svenkataram",
    avatar: "https://i.pravatar.cc/150?u=sven",
    text: "Gotta give incredible kudos to @steipete and his @moltbot - it's one of the first tools I've used that truly feels like magic. I've also set it up so it...",
    color: "text-orange-500"
  },
  {
    id: 2,
    name: "@Hormold",
    avatar: "https://i.pravatar.cc/150?u=horm",
    text: "My @moltbot accidentally Lemonade Insurance because of the interpretation of my response. Truly living in the future.",
    color: "text-orange-500"
  },
  {
    id: 3,
    name: "@karpathy",
    avatar: "https://i.pravatar.cc/150?u=karp",
    text: "Excellent reading thank you. Love oracle and Clawd. The integration is seamless and fast.",
    color: "text-orange-500"
  },
  {
    id: 4,
    name: "@mike_kasberg",
    avatar: "https://i.pravatar.cc/150?u=mike",
    text: "Lol, this is hilarious, the AI is literally answering my emails better than I do. Truly a godsend for busy schedules.",
    color: "text-orange-500"
  },
  {
    id: 5,
    name: "@alex_dev",
    avatar: "https://i.pravatar.cc/150?u=alex",
    text: "Bonniface helped us scale our RAG pipeline in record time. The precision and speed of delivery are unmatched in the industry.",
    color: "text-orange-500"
  },
  {
    id: 6,
    name: "@sarah_j",
    avatar: "https://i.pravatar.cc/150?u=sarah",
    text: "The dashboard design is stunning. It's rare to find a developer who understands both deep learning and high-end UI/UX.",
    color: "text-orange-500"
  }
];

const integrations = [
  { name: 'Supabase', icon: Database, color: 'text-emerald-400' },
  { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
  { name: 'Telegram', icon: Send, color: 'text-blue-400' },
  { name: 'Discord', icon: MessageCircle, color: 'text-indigo-400' },
  { name: 'Slack', icon: SlackIcon, color: 'text-pink-500' },
  { name: 'Signal', icon: Lock, color: 'text-blue-500' },
  { name: 'iMessage', icon: MessageCircle, color: 'text-blue-500' },
  { name: 'Claude', icon: Brain, color: 'text-orange-300' },
  { name: 'GPT', icon: Bot, color: 'text-emerald-500' },
  { name: 'Antigravity', icon: Zap, color: 'text-yellow-400' },
  { name: 'Spotify', icon: Music, color: 'text-green-500' },
  { name: 'Hue', icon: Lightbulb, color: 'text-yellow-400' },
  { name: 'Obsidian', icon: Cpu, color: 'text-purple-400' },
  { name: 'Twitter', icon: Twitter, color: 'text-slate-200' },
  { name: 'Browser', icon: Globe, color: 'text-blue-400' },
  { name: 'Gmail', icon: Mail, color: 'text-red-500' },
  { name: 'GitHub', icon: Github, color: 'text-slate-200' }
];

function SlackIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5.042 15.123a2.52 2.52 0 0 1 2.52-2.52h2.52v5.04a2.52 2.52 0 0 1-2.52 2.52 2.52 2.52 0 0 1-2.52-2.52v-2.52zM15.123 18.958a2.52 2.52 0 0 1-2.52 2.52v-2.52h-2.52a2.52 2.52 0 0 1 0-5.04h5.04a2.52 2.52 0 0 1 0 5.04zM18.958 8.877a2.52 2.52 0 0 1-2.52 2.52h-2.52V6.357a2.52 2.52 0 0 1 2.52-2.52 2.52 2.52 0 0 1 2.52 2.52v2.52zM8.877 5.042a2.52 2.52 0 0 1 2.52-2.52v2.52h2.52a2.52 2.52 0 0 1 0 5.04H8.877a2.52 2.52 0 0 1 0-5.04z" />
    </svg>
  );
}

const TestimonialCard: React.FC<{ item: typeof testimonials[0] }> = ({ item }) => (
  <div className="flex-shrink-0 w-[380px] bg-navy-900/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl mx-3 group hover:border-orange-500/30 transition-all duration-300">
      <div className="flex gap-4 items-start">
          <img src={item.avatar} alt={item.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/5 group-hover:ring-orange-500/30 transition-all" />
          <div className="flex-1">
              <p className="text-slate-300 text-sm leading-relaxed mb-3 italic">"{item.text}"</p>
              <span className={`text-sm font-bold ${item.color} group-hover:brightness-125 transition-all`}>{item.name}</span>
          </div>
      </div>
  </div>
);

interface LandingPageProps {
  onLogin: (user?: User) => void;
  onNavigateToWork: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigateToWork }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentZoomIndex, setCurrentZoomIndex] = useState(0);

  const zoomImages = [
    '/assets/zoomImage/header-bg0.png',
    '/assets/zoomImage/header-bg1.png',
    '/assets/zoomImage/header-bg2.png',
    '/assets/zoomImage/header-bg3.png',
    '/assets/zoomImage/header-bg4.png'
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const totalScrollable = docHeight - windowHeight;
      const progress = totalScrollable > 0 ? Math.min(Math.max(scrollY / totalScrollable, 0), 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentZoomIndex((prev) => (prev + 1) % zoomImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  const handleGetStarted = () => {
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const ProcessStep = ({ number, title, desc, icon: Icon, index }: any) => {
    return (
      <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
          className="flex gap-8 group relative"
      >
          <div className="flex flex-col items-center">
              <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                      type: "spring", 
                      stiffness: 260, 
                      damping: 20, 
                      delay: index * 0.15 + 0.2 
                  }}
                  className="w-14 h-14 rounded-2xl border border-blue-500/30 bg-navy-900 flex items-center justify-center text-blue-400 font-bold group-hover:border-blue-500 group-hover:text-white transition-all shadow-xl shadow-blue-500/5 relative z-10"
              >
                  <Icon size={24} className="group-hover:scale-110 transition-transform" />
                  <div className="absolute -inset-1 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              
              {/* Animated Connecting Line */}
              <div className="w-[2px] flex-1 bg-slate-800/50 group-last:hidden my-2 relative overflow-hidden">
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.15 + 0.4 }}
                    className="absolute top-0 left-0 w-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                  />
              </div>
          </div>
          <div className="pb-16 pt-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
              >
                <span className="text-xs font-black text-blue-500/40 mb-2 block tracking-[0.2em] uppercase">Phase {number}</span>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-slate-400 leading-relaxed max-w-md text-base">
                    {desc}
                </p>
              </motion.div>
          </div>
      </motion.div>
    );
  };

  const BrandLogo = ({ name, className }: { name: string, className?: string }) => {
    switch (name) {
      case 'zoom':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
             <path d="M4.5 9h10v6h-10zM16.5 10.5l4-2.5v8l-4-2.5z" />
             <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        );
      case 'slack':
        return (
          <SlackIcon className={className} />
        );
      case 'discord':
         return (
             <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                 <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.56 13.56 0 0 0-.599 1.227 18.253 18.253 0 0 0-5.508 0 13.633 13.633 0 0 0-.603-1.227.071.071 0 0 0-.078-.037 19.8 19.8 0 0 0-4.887 1.515.068.068 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.083.083 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.018.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.018.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
             </svg>
         );
      case 'overleaf':
          return (
             <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                 <path d="M10.8 19.7c-3.1 0-5.2-1.8-6.1-4.4C4.1 13.4 4 11.8 4 11.2c0-1.2.2-2.2.5-3.3.6-2.2 2.2-4.1 4.3-4.9.4-.2.9-.3 1.3-.3 1.1 0 2.1.3 3 .8 1.1.6 2 1.6 2.5 2.7.1.3.2.6.3 1 .1.3.1.5.1.7 0 .1 0 .3-.1.4-.2.5-.6.9-1.1.9-.4 0-.8-.3-1-.6-.2-.4-.6-.8-1-1.1-.5-.3-1.1-.4-1.7-.4-.8 0-1.6.2-2.2.7-.8.6-1.3 1.5-1.5 2.5-.1.5-.2 1-.2 1.5 0 .5 0 .9.1 1.4.3 1.5 1.4 2.6 2.9 2.9 1 .2 2-.1 2.8-.8.3-.3.6-.6.8-1 .1-.2.4-.3.6-.3.5 0 .9.4.9.9v.1c0 .2-.1.5-.2.7-.4.9-1 1.6-1.8 2.1-1.1.8-2.3 1-3.4.9z"/>
                 <path d="M20 7v10c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2z" fillOpacity="0.2"/>
             </svg>
          );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onLogin={onLogin} 
        />

        <div className="fixed inset-0 w-full h-full z-0">
             <ThreeHero scrollProgress={scrollProgress} />
        </div>

        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-gradient-to-b from-navy-950/20 via-transparent to-navy-950/80"></div>

        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-950/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center">
                    <img 
                        src={boniAvatar} 
                        alt="Bonniface Logo" 
                        className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-blue-500/20"
                    />
                    <span className="font-bold text-[28px] text-white ml-3 tracking-wide">Bonniface</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollToSection('services')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</button>
                    <button onClick={() => scrollToSection('process')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Process</button>
                    <button onClick={() => scrollToSection('booking')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Booking</button>
                    <button onClick={onNavigateToWork} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Portfolio</button>
                    <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</button>
                    <button onClick={handleGetStarted} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                        Client Login
                    </button>
                </div>

                <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-navy-900/95 backdrop-blur-xl border-b border-navy-800 p-4 space-y-4 absolute w-full">
                    <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Services</button>
                    <button onClick={() => scrollToSection('process')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Process</button>
                    <button onClick={() => scrollToSection('booking')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Booking</button>
                    <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">About</button>
                    <button onClick={handleGetStarted} className="block w-full text-center py-3 bg-blue-600 rounded-lg text-white font-medium">Get Started</button>
                </div>
            )}
        </nav>

        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-12 px-6 z-10 gap-16">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="text-left">
                    <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Creative Developer & AI Consultant
                    </motion.div>
                    <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Crafting <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Digital Intelligence</span>
                    </motion.h1>
                    <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-400 max-w-lg mb-10 leading-relaxed">
                        I build immersive web experiences and implement AI solutions that transform data into actionable strategy.
                    </motion.p>
                    <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4">
                        <button onClick={handleGetStarted} className="px-8 py-4 bg-white text-navy-950 rounded-xl font-bold transition-all hover:scale-105 shadow-xl shadow-white/5 flex items-center justify-center gap-2">
                            Start Project <ArrowRight size={20} />
                        </button>
                        <button onClick={onNavigateToWork} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all backdrop-blur-sm">
                            View Portfolio
                        </button>
                    </motion.div>
                </motion.div>
                <div className="hidden lg:block h-[300px]"></div>
            </div>

            {/* Testimonials integrated into hero */}
            <div className="w-full max-w-[100vw] overflow-hidden">
                 <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-between items-end">
                    <div className="flex items-center gap-3">
                        <span className="text-orange-600 font-bold text-3xl opacity-80">&gt;</span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">What People Say</h2>
                    </div>
                </div>
                
                <div className="flex flex-col gap-6 relative">
                    <div className="flex overflow-hidden relative">
                        <motion.div 
                            className="flex whitespace-nowrap"
                            animate={{ x: [0, -1920] }}
                            transition={{ 
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 30,
                                    ease: "linear"
                                }
                            }}
                        >
                            {[...testimonials, ...testimonials].map((item, i) => (
                                <TestimonialCard key={`row1-${i}`} item={item} />
                            ))}
                        </motion.div>
                    </div>

                    <div className="flex overflow-hidden relative">
                        <motion.div 
                            className="flex whitespace-nowrap"
                            initial={{ x: -1920 }}
                            animate={{ x: [ -1920, 0] }}
                            transition={{ 
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 35,
                                    ease: "linear"
                                }
                            }}
                        >
                            {[...testimonials, ...testimonials].map((item, i) => (
                                <TestimonialCard key={`row2-${i}`} item={item} />
                            ))}
                        </motion.div>
                    </div>
                    
                    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-navy-950 to-transparent z-20"></div>
                    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-navy-950 to-transparent z-20"></div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 10, 0] }} transition={{ delay: 2, duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-2 text-slate-500 mt-4">
                <span className="text-xs uppercase tracking-widest">Scroll to Discover</span>
                <ChevronDown size={20} />
            </motion.div>
        </section>

        {/* Works With Everything - Integrations Section */}
        <section id="integrations" className="py-24 relative z-10 bg-navy-950">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center gap-3 mb-12">
                    <span className="text-orange-600 font-bold text-3xl opacity-80">&gt;</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Works With Everything</h2>
                </div>

                <div className="flex flex-wrap gap-4 mb-16 justify-center">
                    {integrations.map((item, i) => (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 px-6 py-3 rounded-full bg-navy-900/50 border border-white/5 hover:border-white/20 hover:bg-navy-900 transition-all cursor-default group"
                        >
                            <item.icon size={20} className={`${item.color} group-hover:scale-110 transition-transform`} />
                            <span className="text-slate-300 font-medium">{item.name}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 pt-8">
                    <button className="flex items-center gap-2 text-orange-500 hover:text-orange-400 font-bold transition-colors group">
                        View all 50+ integrations <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="w-1 h-1 rounded-full bg-slate-700 hidden md:block"></div>
                    <button className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold transition-colors group">
                        See what people built <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>

        <section id="about" className="py-24 px-6 relative z-10 bg-navy-950/80 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                <div className="hidden md:block relative h-[500px] w-full max-w-md mx-auto group">
                     <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl rotate-6 opacity-20 group-hover:rotate-3 transition-transform duration-700 blur-lg"></div>
                     <img 
                         src={boniAvatar} 
                         alt="Bonniface Profile" 
                         className="relative w-full h-full object-cover rounded-2xl shadow-2xl border border-white/10 z-10 grayscale hover:grayscale-0 transition-all duration-700"
                     />
                </div>
                <div className="space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Bridging Code, <br/>Design, & Intelligence.</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        In a world saturated with data, clarity is power. I combine advanced data science with creative frontend development to build tools that are not just functional, but intuitive and beautiful.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            { icon: Target, title: "Precision", desc: "Pixel-perfect implementation." },
                            { icon: Zap, title: "Performance", desc: "Optimized for speed & scale." },
                            { icon: Brain, title: "Intelligence", desc: "AI-driven decision making." },
                            { icon: ShieldCheck, title: "Reliability", desc: "Robust & secure architecture." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                <item.icon className="text-blue-400 mb-3" size={24} />
                                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                <p className="text-sm text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        <section id="services" className="py-24 px-6 relative z-10">
             <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-blue-500 font-bold tracking-wider uppercase text-sm">Services</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">Technical Expertise</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { icon: Code2, title: "Creative Development", desc: "3D web experiences, interactive dashboards, and modern React applications.", price: "from $2.5k" },
                        { icon: Brain, title: "AI Engineering", desc: "Custom LLM integration, RAG pipelines, and intelligent automation agents.", price: "from $5k" },
                        { icon: BarChart3, title: "Data Visualization", desc: "Turning complex datasets into compelling, interactive visual stories.", price: "from $3k" },
                        { icon: GraduationCap, title: "Research & Analysis", desc: "Statistical modeling, academic research support, and feasibility studies.", price: "Custom" },
                        { icon: Zap, title: "Workflow Automation", desc: "Streamlining business processes with custom AI-powered tools.", price: "from $2k" },
                        { icon: Terminal, title: "Technical Consulting", desc: "Architecture review, tech stack selection, and digital transformation.", price: "$150/hr" },
                        { icon: Cpu, title: "ML Model Dev", desc: "Training and deploying custom machine learning models for specific tasks.", price: "Custom" },
                        { icon: LineChart, title: "Business Intelligence", desc: "PowerBI/Tableau dashboards and automated reporting systems.", price: "from $1.5k" },
                        { icon: Database, title: "Backend Systems", desc: "Scalable API development, database design, and cloud infrastructure.", price: "from $4k" },
                    ].map((service, i) => (
                        <div key={i} className="bg-navy-900/50 backdrop-blur-md border border-white/5 p-8 rounded-2xl hover:border-blue-500/50 hover:bg-navy-900/80 transition-all group">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <service.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">{service.desc}</p>
                            <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                <span className="text-slate-500 text-xs font-mono">STARTING AT</span>
                                <span className="text-blue-400 font-semibold">{service.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </section>

        <section id="booking" className="bg-slate-50 dark:bg-navy-950/40 relative z-10">
            <BookingSection user={null} onBooked={() => {}} />
        </section>

        <section id="process" className="py-24 px-6 relative z-10 bg-navy-950/80 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <span className="text-blue-500 font-bold tracking-wider uppercase text-sm">How I Work</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">The Process</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col">
                        <ProcessStep number="01" title="Discovery & Strategy" desc="We begin by diving deep into your goals, data structure, and user needs to architect a robust solution plan." icon={Search} index={0} />
                        <ProcessStep number="02" title="Design & Modeling" desc="I create high-fidelity UI prototypes and preliminary data models to validate our approach before coding." icon={Lightbulb} index={1} />
                        <ProcessStep number="03" title="Development" desc="Agile execution of the frontend and AI backend, with weekly check-ins to ensure we stay aligned." icon={Code2} index={2} />
                        <ProcessStep number="04" title="Deployment & Handoff" desc="Seamless deployment to your infrastructure, followed by comprehensive training and documentation." icon={Rocket} index={3} />
                    </div>
                    <div className="hidden md:flex items-center justify-center relative"></div> 
                </div>
            </div>
        </section>

        <section className="py-24 px-6 relative z-10 bg-navy-900/30">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-xl"></div>
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-navy-900 group aspect-video">
                        <div className="absolute top-0 left-0 right-0 h-8 bg-navy-950/80 border-b border-white/5 flex items-center px-4 gap-2 z-20 backdrop-blur-sm">
                            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                        </div>
                        {zoomImages.map((img, index) => (
                            <img 
                                key={img}
                                src={img} 
                                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop"; }}
                                alt={`Client Zoom Meeting ${index + 1}`} 
                                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentZoomIndex ? 'opacity-100' : 'opacity-0'}`}
                            />
                        ))}
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg z-20">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-white text-sm font-medium">Live Weekly Sync</span>
                        </div>
                    </div>
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                    <span className="text-blue-500 font-bold tracking-wider uppercase text-sm">Collaboration</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Direct Access, <br/>Real-Time Alignment.</h2>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">Direct Access, <br/>Real-Time Alignment.</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        I believe great software is built through conversation, not just tickets. We schedule regular Zoom syncs to review milestones, demo features live, and pivot quickly based on your feedback.
                    </p>
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                 <Video size={20} />
                             </div>
                             <span className="text-slate-300 font-medium">Weekly Video Sprint Reviews</span>
                        </div>
                        <div className="flex flex-col gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 shrink-0">
                                    <MessageSquare size={20} />
                                </div>
                                <span className="text-slate-300 font-medium">Direct Access for Academic & Coding</span>
                            </div>
                            <div className="pl-14 flex flex-wrap gap-2 sm:gap-3 opacity-90">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium" title="Zoom"><BrandLogo name="zoom" className="w-3.5 h-3.5" /> Zoom</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium" title="WhatsApp"><BrandLogo name="whatsapp" className="w-3.5 h-3.5" /> WhatsApp</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium" title="Overleaf"><BrandLogo name="overleaf" className="w-3.5 h-3.5" /> Overleaf</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium" title="Slack"><BrandLogo name="slack" className="w-3.5 h-3.5" /> Slack</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium" title="Discord"><BrandLogo name="discord" className="w-3.5 h-3.5" /> Discord</div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-300 text-xs font-medium" title="GitHub"><Github size={14} /> GitHub</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                                 <Users size={20} />
                             </div>
                             <span className="text-slate-300 font-medium">Interactive Strategy Workshops</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-24 px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 relative overflow-hidden shadow-2xl shadow-blue-900/50">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Have an ambitious idea?</h2>
                    <p className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
                        Let's push the boundaries of what's possible with web technology and AI.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <button onClick={handleGetStarted} className="px-8 py-4 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
                            Schedule Discovery
                        </button>
                        <button onClick={onNavigateToWork} className="px-8 py-4 bg-blue-800/50 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors border border-white/20 backdrop-blur-sm">
                            View My Work
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <footer className="py-12 px-6 border-t border-white/5 bg-navy-950 relative z-10">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center">
                    <img src={boniAvatar} alt="Bonniface Logo" className="w-8 h-8 rounded-lg object-cover shadow-lg" />
                    <span className="font-bold text-white text-xl ml-3 tracking-wide">Bonniface</span>
                 </div>
                 <div className="text-slate-500 text-sm">© 2025 Bonniface. Creative Development & AI.</div>
                 <div className="flex gap-4">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Twitter size={18} /></a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Linkedin size={18} /></a>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10"><Mail size={18} /></a>
                 </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;