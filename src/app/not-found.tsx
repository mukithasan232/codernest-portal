import Link from 'next/link';
import { Home, Rocket, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712] relative overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 glass border border-white/10 dark:border-white/5 rounded-3xl p-8 md:p-16 text-center max-w-xl mx-4 shadow-2xl backdrop-blur-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]">
          <AlertTriangle className="w-8 h-8 text-cyan-400" />
        </div>
        
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 tracking-tighter mb-4 filter drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight mb-4">
          Page Not Found
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
          The coordinates you entered led to empty space. The page you are looking for has either been moved, deleted, or never existed.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.7)] transition-all hover:-translate-y-1"
        >
          <Home className="w-5 h-5" />
          Return to Mission Control
        </Link>
      </div>
    </div>
  );
}
