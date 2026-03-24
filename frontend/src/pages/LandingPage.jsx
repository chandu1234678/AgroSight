import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background font-body selection:bg-primary/30">
      {/* TopAppBar */}
      <header className="bg-background fixed top-0 z-50 w-full transition-colors">
        <div className="flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-on-surface font-headline">AgroSight</span>
            <nav className="hidden md:flex gap-6 items-center">
              <a className="text-primary font-semibold text-sm transition-colors hover:bg-surface-variant px-3 py-1 rounded-md" href="#">Home</a>
              <a className="text-on-surface-variant text-sm hover:text-on-surface transition-colors hover:bg-surface-variant px-3 py-1 rounded-md" href="#">Technology</a>
              <a className="text-on-surface-variant text-sm hover:text-on-surface transition-colors hover:bg-surface-variant px-3 py-1 rounded-md" href="#">Solutions</a>
              <a className="text-on-surface-variant text-sm hover:text-on-surface transition-colors hover:bg-surface-variant px-3 py-1 rounded-md" href="#">Pricing</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined">search</span>
            </button>
            <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors active:scale-95 duration-200">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <Link to="/login" className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative min-h-[921px] flex items-center overflow-hidden px-6 lg:px-24">
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-gradient-to-r from-background via-background/80 to-transparent absolute inset-0 z-10"></div>
          </div>
          <div className="relative z-10 max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/15 text-secondary-fixed-dim text-xs font-medium tracking-widest">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                AI-POWERED PRECISION
              </div>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
                AI Crop <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Intelligence</span> for Real Fields
              </h1>
              <p className="font-body text-xl text-on-surface-variant leading-relaxed max-w-lg">
                Detect, diagnose, and act instantly. AgroSight bridges the gap between satellite precision and leaf-level health using proprietary neural networks.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/register" className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-md transition-all scale-100 hover:scale-[1.02] active:scale-95 cta-glow">
                  Get Started
                </Link>
                <Link to="/login" className="bg-surface-container-highest text-on-surface border border-outline-variant/15 font-semibold px-8 py-4 rounded-md transition-all hover:bg-surface-bright active:scale-95">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="px-6 lg:px-24 py-32 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-on-surface">Engineered for the Edge</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto text-lg leading-relaxed">Precision agriculture requires speed and accuracy. Our multi-model architecture delivers results in milliseconds, even offline.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Fast */}
            <div className="group bg-surface-container-low p-8 rounded-xl flex flex-col items-start transition-all hover:bg-surface-container hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-8 border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Fast</h3>
              <p className="text-on-surface-variant leading-relaxed">Edge-optimized models process data locally on your device. Zero latency diagnostics for real-time field scouting.</p>
              <div className="mt-8 pt-8 border-t border-outline-variant/10 w-full group-hover:border-primary/20 transition-colors">
                <a className="text-primary font-bold text-sm inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                  LEARN MORE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
            {/* Feature 2: Accurate */}
            <div className="group bg-surface-container-low p-8 rounded-xl flex flex-col items-start transition-all hover:bg-surface-container hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-8 border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-3xl">biotech</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Accurate</h3>
              <p className="text-on-surface-variant leading-relaxed">Trained on over 10 million agricultural data points. 98.4% precision in identifying pests, diseases, and nutrient deficiencies.</p>
              <div className="mt-8 pt-8 border-t border-outline-variant/10 w-full group-hover:border-primary/20 transition-colors">
                <a className="text-primary font-bold text-sm inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                  VIEW BENCHMARKS <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
            {/* Feature 3: Intelligent */}
            <div className="group bg-surface-container-low p-8 rounded-xl flex flex-col items-start transition-all hover:bg-surface-container hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-8 border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">Intelligent</h3>
              <p className="text-on-surface-variant leading-relaxed">Generative AI insights provide prescriptive actions. Not just "what is wrong," but "exactly how to fix it" based on local weather.</p>
              <div className="mt-8 pt-8 border-t border-outline-variant/10 w-full group-hover:border-primary/20 transition-colors">
                <a className="text-primary font-bold text-sm inline-flex items-center gap-2 group-hover:gap-4 transition-all" href="#">
                  EXPLORE AI <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-24 py-16 bg-surface-container-low">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-t border-outline-variant/10 pt-12">
          <div className="space-y-6">
            <span className="text-2xl font-headline font-black text-primary">AgroSight</span>
            <p className="max-w-xs text-on-surface-variant text-sm leading-relaxed">Precision intelligence for the modern world's oldest industry.</p>
          </div>
        </div>
        <div className="mt-16 text-center text-[10px] text-on-surface-variant font-medium tracking-[0.2em] uppercase opacity-50">
          © 2024 AgroSight Intelligence Systems. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
