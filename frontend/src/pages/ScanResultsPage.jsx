import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { scanAPI, chatAPI } from '../services/api';

const STORAGE_KEY = 'agrosight_last_scan';

const fmt = (name) => {
  if (!name) return 'Unknown';
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const sevColor = (s) => {
  const l = (s || '').toLowerCase();
  if (l === 'high')     return { badge: 'bg-error/10 text-error border-error/20',         dot: 'bg-error',     bar: 'bg-error' };
  if (l === 'moderate') return { badge: 'bg-secondary/10 text-secondary border-secondary/20', dot: 'bg-secondary', bar: 'bg-secondary' };
  return                       { badge: 'bg-primary/10 text-primary border-primary/20',   dot: 'bg-primary',   bar: 'bg-primary' };
};

const AnimatedBar = ({ pct, colorClass, height = 'h-2' }) => {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(Math.min(pct, 100)), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div className={`w-full bg-surface-container-highest ${height} rounded-full overflow-hidden`}>
      <div className={`${height} rounded-full ${colorClass} transition-all duration-1000 ease-out`} style={{ width: `${w}%` }} />
    </div>
  );
};

const ScanResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const getInitial = () => {
    if (location.state?.result) return location.state.result;
    try { const s = sessionStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch { /**/ }
    return null;
  };

  const [result, setResult]             = useState(getInitial);
  const [loading, setLoading]           = useState(!getInitial() && !!id);
  const [error, setError]               = useState('');
  const [imgError, setImgError]         = useState(false);
  const [heatTab, setHeatTab]           = useState('heatmap');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const chatEndRef   = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  useEffect(() => {
    if (!result) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result)); } catch { /**/ }
  }, [result]);

  useEffect(() => {
    if (!result && id) {
      scanAPI.getById(id)
        .then((res) => setResult(res.data))
        .catch(() => setError('Could not load scan result.'))
        .finally(() => setLoading(false));
    }
  }, [id]); // eslint-disable-line

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const sendChat = async (text) => {
    const msg = (text || chatInput).trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const res = await chatAPI.ask(msg);
      setChatMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setChatLoading(false); }
  };

  const handleChatKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-on-surface-variant">Loading analysis results...</p>
      </div>
    </div>
  );

  if (error || !result) return (
    <div className="min-h-screen bg-background antialiased">
      <SideNavBar />
      <div className="md:ml-64 min-h-screen">
        <TopAppBar title="Scan Analysis" />
        <main className="p-6 md:p-12 max-w-4xl mx-auto text-center py-24">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">error_outline</span>
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">{error || 'No results found'}</h2>
          <p className="text-on-surface-variant mb-8">The scan result could not be loaded. Please try scanning again.</p>
          <Link to="/scan" className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-md hover:scale-[1.02] transition-all inline-flex items-center gap-2">
            <span className="material-symbols-outlined">add_a_photo</span>New Scan
          </Link>
        </main>
      </div>
      <BottomNavBar />
    </div>
  );

  const isHealthy     = result.disease?.toLowerCase().includes('healthy');
  const confPct       = result.confidence ? Math.round(Math.min(result.confidence, 0.99) * 100) : 0;
  const diseaseName   = fmt(result.disease);
  const sev           = sevColor(isHealthy ? 'low' : result.severity_level);
  const affectedPct   = result.affected_area_pct ?? 0;
  const spreadPct     = result.spread_risk_pct ?? 0;
  const growthRate    = isHealthy ? 0 : Math.min(spreadPct * 0.8, 8);

  const prevention         = Array.isArray(result.prevention) && result.prevention.length ? result.prevention
    : ['Improve drainage to reduce humidity.', 'Avoid late planting to bypass peak spore dispersal.', 'Use certified disease-free seeds.'];
  const organicTreatments  = result.solution?.organic  ? [result.solution.organic]  : ['Apply neem oil spray and remove infected parts.', 'Strict crop rotation with non-host species.'];
  const chemicalTreatments = result.solution?.chemical ? [result.solution.chemical] : ['Triazole-based fungicide for rapid curative action.', 'Follow local EPA regulations and safety guidelines.'];
  const chatPrefill        = `Tell me more about ${diseaseName} — what causes it, how to treat it, and how to prevent it from spreading.`;

  const affectedLabel = affectedPct > 40 ? 'Severe — immediate treatment required'
    : affectedPct > 20 ? 'Moderate — treat within 48 hours'
    : affectedPct > 5  ? 'Early stage — localised lesions detected'
    : isHealthy        ? 'No infection detected'
    : 'Minimal — monitor closely';

  const spreadLabel = spreadPct > 25 ? 'High — neighbouring plants at risk'
    : spreadPct > 12 ? 'Moderate — isolate affected plants'
    : 'Low — infection appears contained';

  const affectedBarColor = affectedPct > 40 ? 'bg-error' : affectedPct > 20 ? 'bg-secondary' : 'bg-primary';
  const spreadBarColor   = spreadPct > 25   ? 'bg-error' : spreadPct > 12   ? 'bg-secondary' : 'bg-primary';

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/30 overflow-x-hidden">
      <SideNavBar />
      <main className="md:ml-64 min-h-screen">
        <TopAppBar title="Scan Analysis" />
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-32">

          {/* ── HERO ──────────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase ${sev.badge}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${sev.dot}`} />
                {isHealthy ? 'Plant Healthy' : `${result.severity_level || 'Moderate'} Severity Alert`}
              </div>

              <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-on-surface leading-tight tracking-tighter">
                {isHealthy
                  ? <>Plant is <span className="text-primary italic">Healthy</span></>
                  : <>{diseaseName.split(' ').slice(0, -1).join(' ')}{' '}<span className="text-primary italic">{diseaseName.split(' ').slice(-1)}</span></>}
              </h2>

              <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl">
                {isHealthy
                  ? 'AI analysis confirms your plant is in excellent health. No diseases or deficiencies detected.'
                  : `AI analysis identified ${diseaseName} with ${confPct}% confidence. ${result.severity_level?.toLowerCase() === 'high' ? 'Immediate intervention required.' : 'Timely treatment recommended.'}`}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/chat" state={{ prefill: chatPrefill }} className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/10">
                  <span className="material-symbols-outlined text-base">psychology</span>Ask AI Expert
                </Link>
                <Link to="/scan" className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-md font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">add_a_photo</span>New Scan
                </Link>
                <Link to="/history" className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-md font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">history</span>History
                </Link>
              </div>
            </div>

            {/* Confidence card + image */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-surface-variant/40 backdrop-blur-xl p-8 rounded-xl border-t border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">AI Confidence Score</p>
                      <h3 className="text-5xl font-black text-primary tracking-tighter">{confPct}%</h3>
                    </div>
                    <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <AnimatedBar pct={confPct} colorClass="bg-primary shadow-[0_0_15px_rgba(169,255,204,0.4)]" />
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] uppercase text-on-surface-variant">Sample ID</p>
                      <p className="text-sm font-mono text-on-surface">AG-{result.id ?? Math.floor(Math.random() * 9000 + 1000)}-X</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-on-surface-variant">Detected At</p>
                      <p className="text-sm font-mono text-on-surface">
                        {result.created_at ? new Date(result.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {result.image_url && !imgError && (
                <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low">
                  <img className="w-full h-auto object-contain" src={result.image_url} alt={diseaseName} onError={() => setImgError(true)} />
                </div>
              )}
            </div>
          </section>

          {/* ── VISUAL ANALYSIS — GradCAM + Area Stats ────────────────────── */}
          {(result.gradcam_url || affectedPct > 0) && (
            <section className="space-y-6">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface whitespace-nowrap">Visual Analysis</h3>
                <div className="h-px flex-1 bg-outline-variant/20 hidden md:block" />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold hidden md:block">GradCAM · Activation Heatmap</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image tabs */}
                <div className="bg-surface-container-low rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex gap-2">
                    {['original', 'heatmap'].map((tab) => (
                      <button key={tab} onClick={() => setHeatTab(tab)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${heatTab === tab ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    {heatTab === 'original' ? (
                      result.image_url
                        ? <img src={result.image_url} alt="Original" className="w-full h-auto object-contain" />
                        : <div className="w-full h-48 bg-surface-container-highest flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span></div>
                    ) : (
                      result.gradcam_url
                        ? <img src={result.gradcam_url} alt="GradCAM heatmap" className="w-full h-auto object-contain" />
                        : <div className="w-full h-48 bg-surface-container-highest flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-on-surface-variant">blur_on</span></div>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center gap-3">
                    <span className="text-[10px] text-on-surface-variant">Low</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right,#00007f,#0000ff,#00ffff,#00ff00,#ffff00,#ff7f00,#ff0000)' }} />
                    <span className="text-[10px] text-on-surface-variant">High</span>
                  </div>
                </div>

                {/* Stats column */}
                <div className="space-y-4">
                  {/* Affected area */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-error text-lg">crisis_alert</span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Affected Area</p>
                          <p className="text-[10px] text-on-surface-variant/60">High-activation pixels</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black tracking-tighter ${affectedBarColor.replace('bg-', 'text-')}`}>{affectedPct}%</span>
                    </div>
                    <AnimatedBar pct={affectedPct} colorClass={affectedBarColor} height="h-3" />
                    <p className="text-xs text-on-surface-variant">{affectedLabel}</p>
                  </div>

                  {/* Spread risk */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-secondary text-lg">trending_up</span>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Spread Risk</p>
                          <p className="text-[10px] text-on-surface-variant/60">Advancing infection front</p>
                        </div>
                      </div>
                      <span className={`text-3xl font-black tracking-tighter ${spreadBarColor.replace('bg-', 'text-')}`}>{spreadPct}%</span>
                    </div>
                    <AnimatedBar pct={Math.min(spreadPct * 2, 100)} colorClass={spreadBarColor} height="h-3" />
                    <p className="text-xs text-on-surface-variant">{spreadLabel}</p>
                  </div>

                  {/* 7-day projection */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-3">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">7-Day Damage Projection</p>
                    {[1, 3, 7].map((day) => {
                      const proj = Math.min(affectedPct + growthRate * day, 95);
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-[10px] text-on-surface-variant w-12 shrink-0">Day {day}</span>
                          <AnimatedBar pct={proj} colorClass="bg-gradient-to-r from-primary to-error" height="h-2" />
                          <span className="text-[10px] text-on-surface-variant w-10 text-right shrink-0">{proj.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                    <p className="text-[10px] text-on-surface-variant/50 mt-1">Projection based on current spread rate. Treat immediately to halt progression.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── INTERVENTION STRATEGY ─────────────────────────────────────── */}
          {!isHealthy && (
            <section className="space-y-6">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface whitespace-nowrap">Intervention Strategy</h3>
                <div className="h-px flex-1 bg-outline-variant/20 hidden md:block" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: 'eco',     color: 'text-tertiary',  bg: 'bg-tertiary/10',  title: 'Organic',    items: organicTreatments },
                  { icon: 'science', color: 'text-primary',   bg: 'bg-primary/10',   title: 'Chemical',   items: chemicalTreatments },
                  { icon: 'shield',  color: 'text-secondary', bg: 'bg-secondary/10', title: 'Prevention', items: prevention },
                ].map(({ icon, color, bg, title, items }) => (
                  <div key={title} className="bg-surface-container-low p-8 rounded-xl space-y-5 hover:bg-surface-container transition-colors group">
                    <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <h4 className="text-xl font-bold text-on-surface">{title}</h4>
                    <ul className="space-y-3">
                      {items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">check_circle</span>
                          <span className="text-on-surface-variant text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── HEALTHY MAINTENANCE ───────────────────────────────────────── */}
          {isHealthy && (
            <section className="bg-surface-container-low rounded-xl p-8 border-l-4 border-primary">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold font-headline text-on-surface mb-4">Maintenance Recommendations</h4>
                  <ul className="space-y-3">
                    {prevention.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">check_circle</span>
                        <span className="text-on-surface-variant text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* ── AI EXPLANATION + INLINE CHAT ──────────────────────────────── */}
          <section className="rounded-2xl overflow-hidden border border-outline-variant/15 shadow-xl">
            <div className="bg-surface-container-low px-8 py-6 border-b border-outline-variant/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">AI Diagnostic Agent</p>
                  <div className="h-0.5 w-6 bg-primary rounded-full mt-0.5" />
                </div>
              </div>
              <p className="text-[#d9e6dd] leading-relaxed">
                {result.ai_explanation || (isHealthy
                  ? `Your plant appears healthy. AI confidence is ${confPct}%. Continue your current care routine.`
                  : `Detected ${diseaseName} with ${confPct}% confidence. ${result.severity_level?.toLowerCase() === 'high' ? 'Immediate intervention required.' : 'Timely treatment recommended.'}`)}
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {[`What causes ${diseaseName}?`, `How do I treat ${diseaseName}?`, `How to prevent ${diseaseName}?`, 'Is it contagious to other plants?'].map((q) => (
                  <button key={q} onClick={() => sendChat(q)} disabled={chatLoading}
                    className="px-3 py-1.5 rounded-full bg-surface-container-highest/60 hover:bg-primary/20 border border-outline-variant/20 hover:border-primary/30 text-xs text-on-surface-variant hover:text-primary transition-all disabled:opacity-40">
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {chatMessages.length > 0 && (
              <div className="bg-background/60 px-8 py-6 space-y-6 max-h-96 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  msg.role === 'user'
                    ? <div key={i} className="flex justify-end"><div className="bg-primary-container text-on-primary-container px-5 py-3 rounded-t-2xl rounded-bl-2xl max-w-[80%] text-sm leading-relaxed">{msg.content}</div></div>
                    : <div key={i} className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-primary/20 mt-1">
                          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <div className="glass-effect px-5 py-4 rounded-t-2xl rounded-br-2xl max-w-[85%] text-sm text-[#d9e6dd] leading-relaxed">{msg.content}</div>
                      </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div className="glass-effect px-5 py-4 rounded-t-2xl rounded-br-2xl flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            <div className="bg-surface-container px-6 py-4 border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-primary/10 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative bg-surface-container-highest rounded-xl flex items-center px-4 py-2.5">
                    <input ref={chatInputRef} type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline/50"
                      placeholder={`Ask anything about ${diseaseName}...`}
                      value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatKey} disabled={chatLoading} />
                  </div>
                </div>
                <button onClick={() => sendChat()} disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
                <Link to="/chat" state={{ prefill: chatPrefill }}
                  className="shrink-0 bg-surface-container-highest text-on-surface-variant hover:text-primary px-4 py-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-all text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-base">open_in_full</span>
                  <span className="hidden sm:inline">Full Chat</span>
                </Link>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 mt-2 text-center">AgroSight AI · Powered by Gemini</p>
            </div>
          </section>

          <div className="h-24 md:hidden" />
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
};

export default ScanResultsPage;
