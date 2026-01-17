import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Menu, X, Linkedin, Twitter, Mail, 
  Code2, GraduationCap, BarChart3, Brain, Zap, Terminal, 
  Cpu, LineChart, Database, Target, ShieldCheck, ChevronDown,
  Search, Lightbulb, Rocket, CheckCircle
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import ThreeHero from './ThreeHero';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onLogin: () => void;
  onNavigateToWork: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onNavigateToWork }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track FULL page scroll for 3D interactions (0 to 1)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Calculate progress of the entire page
      const totalScrollable = docHeight - windowHeight;
      const progress = totalScrollable > 0 ? Math.min(Math.max(scrollY / totalScrollable, 0), 1) : 0;
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
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

  // Animation variants
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

  const ProcessStep = ({ number, title, desc, icon: Icon }: any) => (
    <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex gap-6 group"
    >
        <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/30">
                <Icon size={20} />
            </div>
            <div className="w-0.5 h-full bg-slate-800 my-2 group-last:hidden"></div>
        </div>
        <div className="pb-12">
            <span className="text-sm font-bold text-blue-500/50 mb-1 block">STEP {number}</span>
            <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
            <p className="text-slate-400 leading-relaxed max-w-md">
                {desc}
            </p>
        </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
        <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onLogin={onLogin} 
        />

        {/* 3D Background Layer - Fixed position to serve as dynamic background */}
        <div className="fixed inset-0 w-full h-full z-0">
             <ThreeHero scrollProgress={scrollProgress} />
        </div>

        {/* Gradient Overlay for Readability */}
        <div className="fixed inset-0 w-full h-full pointer-events-none z-0 bg-gradient-to-b from-navy-950/20 via-transparent to-navy-950/80"></div>

        {/* Navigation - Glassmorphism */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-navy-950/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                        B
                    </div>
                    <span className="font-bold text-xl text-white tracking-tight">Bonniface</span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <button onClick={() => scrollToSection('services')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</button>
                    <button onClick={() => scrollToSection('process')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Process</button>
                    <button onClick={onNavigateToWork} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Portfolio</button>
                    <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</button>
                    <button onClick={handleGetStarted} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                        Client Login
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-navy-900/95 backdrop-blur-xl border-b border-navy-800 p-4 space-y-4 absolute w-full">
                    <button onClick={() => scrollToSection('services')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Services</button>
                    <button onClick={() => scrollToSection('process')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Process</button>
                    <button onClick={onNavigateToWork} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">Portfolio</button>
                    <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 px-4 hover:bg-white/5 rounded-lg">About</button>
                    <button onClick={handleGetStarted} className="block w-full text-center py-3 bg-blue-600 rounded-lg text-white font-medium">Get Started</button>
                </div>
            )}
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 z-10">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="text-left"
                >
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
                
                {/* Right side area preserved for 3D element visibility */}
                <div className="hidden lg:block h-[500px]"></div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ delay: 2, duration: 2, repeat: Infinity }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
            >
                <span className="text-xs uppercase tracking-widest">Scroll to Discover</span>
                <ChevronDown size={20} />
            </motion.div>
        </section>

        {/* About Section - "Collaboration" Area with 3D Secondary Object */}
        <section id="about" className="py-24 px-6 relative z-10 bg-navy-950/80 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                {/* Left side empty for 3D secondary object (Torus) */}
                <div className="hidden md:block h-[400px]"></div>

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

        {/* Services Section */}
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

        {/* Process Section - NEW */}
        <section id="process" className="py-24 px-6 relative z-10 bg-navy-950/80 backdrop-blur-sm border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16">
                    <span className="text-blue-500 font-bold tracking-wider uppercase text-sm">How I Work</span>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">The Process</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <ProcessStep 
                            number="01" 
                            title="Discovery & Strategy" 
                            desc="We begin by diving deep into your goals, data structure, and user needs to architect a robust solution plan."
                            icon={Search}
                        />
                        <ProcessStep 
                            number="02" 
                            title="Design & Modeling" 
                            desc="I create high-fidelity UI prototypes and preliminary data models to validate our approach before coding."
                            icon={Lightbulb}
                        />
                        <ProcessStep 
                            number="03" 
                            title="Development" 
                            desc="Agile execution of the frontend and AI backend, with weekly check-ins to ensure we stay aligned."
                            icon={Code2}
                        />
                        <ProcessStep 
                            number="04" 
                            title="Deployment & Handoff" 
                            desc="Seamless deployment to your infrastructure, followed by comprehensive training and documentation."
                            icon={Rocket}
                        />
                    </div>
                    {/* The right side is intentionally empty to allow the Neural Network 3D scene to be visible here */}
                    <div className="hidden md:flex items-center justify-center relative">
                        {/* Optional: Add a subtle glowing element or text here if needed, but 3D scene takes precedence */}
                    </div> 
                </div>
            </div>
        </section>

        {/* CTA Section */}
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
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-white">B</div>
                    <span className="font-bold text-white">Bonniface</span>
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