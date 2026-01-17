import React from 'react';
import { ArrowLeft, ExternalLink, Github, ChevronDown } from 'lucide-react';

interface MyWorkPageProps {
  onBack: () => void;
}

const projects = [
  {
    id: 1,
    title: "Behavior Detection",
    subtitle: "Machine Learning & Computer Vision",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop",
    link: "#",
    github: "#"
  },
  {
    id: 2,
    title: "Galamsey Detection",
    subtitle: "Satellite Imagery Analysis Dashboard",
    img: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=2070&auto=format&fit=crop",
    link: "#",
    github: "#"
  },
  {
    id: 3,
    title: "DNA Sequences as NLP",
    subtitle: "Exploiting Deep Learning Algorithms",
    img: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=2070&auto=format&fit=crop",
    link: "#",
    github: "#"
  }
];

export const MyWorkPage: React.FC<MyWorkPageProps> = ({ onBack }) => {
  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-navy-950 scroll-smooth">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Home</span>
        </button>
        <button 
            onClick={() => window.location.href='mailto:contact@bonniface.com'} 
            className="px-6 py-2 bg-white text-navy-950 font-bold rounded-full hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
        >
            Hire Me
        </button>
      </div>

      {projects.map((project, index) => (
        <section 
            key={project.id}
            className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden"
        >
             {/* Background Image */}
             <div className="absolute inset-0 z-0">
                <img src={project.img} alt={project.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-navy-950/30" />
             </div>

             {/* Content */}
             <div className="relative z-10 text-center px-4 max-w-4xl mx-auto translate-y-[-10%]">
                 <h2 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg animate-in slide-in-from-bottom-8 duration-700">{project.title}</h2>
                 <p className="text-xl md:text-2xl text-blue-200 mb-10 font-light tracking-wide animate-in slide-in-from-bottom-8 duration-700 delay-100">{project.subtitle}</p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in duration-1000 delay-300">
                     <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl shadow-blue-900/50">
                        View Project <ExternalLink size={18} />
                     </button>
                     <button className="px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 rounded-full font-bold flex items-center justify-center gap-2 transition-all hover:scale-105">
                        Source Code <Github size={18} />
                     </button>
                 </div>
             </div>

             {/* Scroll Indicator (except last) */}
             {index < projects.length - 1 && (
                 <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce text-white/50">
                     <ChevronDown size={40} />
                 </div>
             )}
        </section>
      ))}

      {/* Final Contact Section */}
       <section className="h-screen w-full snap-start relative flex items-center justify-center bg-navy-950">
            <div className="text-center px-6">
                 <h2 className="text-5xl font-bold text-white mb-6">Ready to collaborate?</h2>
                 <p className="text-slate-400 text-xl mb-10 max-w-2xl mx-auto">I'm currently available for freelance projects and consulting.</p>
                 <button 
                    onClick={() => window.location.href='mailto:contact@bonniface.com'}
                    className="px-10 py-4 bg-white text-navy-900 text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-2xl shadow-white/10"
                 >
                    Get in Touch
                 </button>
            </div>
       </section>
    </div>
  );
}