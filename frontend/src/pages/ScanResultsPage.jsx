import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { scanAPI, chatAPI } from '../services/api';

const STORAGE_KEY = 'agrosight_last_scan';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (name) => {
  if (!name) return 'Unknown';
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const severityBg = (s) => {
  if (!s) return 'bg-surface-container-low border-outline-variant/20';
  const l = s.toLowerCase();
  if (l === 'high') return 'bg-error-container/20 border-error/20 text-error';
  if (l === 'moderate') return 'bg-secondary-container/20 border-secondary/20 text-secondary';
  return 'bg-primary/10 border-primary/20 text-primary';
};

// ─── component ───────────────────────────────────────────────────────────────
const ScanResultsPage = () => {
  const { id } = useParams();
  const location = useLocation();

  // Priority: navigation state → sessionStorage → fetch by id
  const getInitial = () => {
    if (location.state?.result) return location.state.result;
    try {
      const s = sessionStorage.getItem(STORAGE_KEY);
      if (s) return JSON.parse(s);
    } catch { /* ignore */ }
    return null;
  };

  const [result, setResult] = useState(getInitial);
  const [loading, setLoading] = useState(!getInitial() && !!id);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  // Inline chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Scroll to top when result loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Persist to sessionStorage whenever result changes
  useEffect(() => {
    if (!result) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch { /* quota — ignore */ }
  }, [result]);

  // Fetch by id if nothing in state/storage
  useEffect(() => {
    if (!result && id) {
      scanAPI.getById(id)
        .then((res) => setResult(res.data))
        .catch(() => setError('Could not load scan result.'))
        .finally(() => setLoading(false));
    }
  }, [id]); // eslint-disable-line

  // Scroll inline chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-on-surface-variant">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background antialiased">
        <SideNavBar />
        <div className="md:ml-64 min-h-screen">
          <TopAppBar title="Scan Analysis" />
          <main className="p-6 md:p-12 max-w-4xl mx-auto text-center py-24">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4 block">error_outline</span>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-4">
              {error || 'No results found'}
            </h2>
            <p className="text-on-surface-variant mb-8">
              The scan result could not be loaded. Please try scanning again.
            </p>
            <Link
              to="/scan"
              className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-8 py-4 rounded-md hover:scale-[1.02] transition-all inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              New Scan
            </Link>
          </main>
        </div>
        <BottomNavBar />
      </div>
    );
  }

  const isHealthy = result.disease?.toLowerCase().includes('healthy');
  const confidencePct = result.confidence
    ? Math.round(Math.min(result.confidence, 0.99) * 100)
    : 0;
  const diseaseName = fmt(result.disease);

  const prevention = Array.isArray(result.prevention) && result.prevention.length
    ? result.prevention
    : [
        'Improve drainage in low-lying field areas to reduce humidity.',
        'Avoid late planting to bypass peak spore dispersal periods.',
        'Use certified disease-free seeds for next planting cycle.',
      ];

  const organicTreatments = result.solution?.organic
    ? [result.solution.organic]
    : ['Copper-based fungicides applied at first sign of lesions.', 'Strict crop rotation with non-host species.'];

  const chemicalTreatments = result.solution?.chemical
    ? [result.solution.chemical]
    : ['Triazole-based fungicide application for rapid curative action.', 'Follow local EPA regulations and safety guidelines.'];

  const chatPrefill = `Tell me more about ${diseaseName} — what causes it, how to treat it, and how to prevent it from spreading.`;

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/30 overflow-x-hidden">
      <SideNavBar />
      <main className="md:ml-64 min-h-screen">
        <TopAppBar title="Scan Analysis" />

        <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 pb-32">

          {/* ── Hero ─────────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left: disease info */}
            <div className="lg:col-span-7 space-y-6">
              {/* Severity badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase ${
                isHealthy ? 'bg-primary/10 text-primary border-primary/20' : severityBg(result.severity_level)
              }`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${
                  isHealthy ? 'bg-primary' : result.severity_level?.toLowerCase() === 'high' ? 'bg-error' : 'bg-secondary'
                }`} />
                {isHealthy ? 'Plant Healthy' : `${result.severity_level || 'Moderate'} Severity Alert`}
              </div>

              {/* Disease name */}
              <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-on-surface leading-tight tracking-tighter">
                {isHealthy ? (
                  <>Plant is <span className="text-primary italic">Healthy</span></>
                ) : (
                  <>
                    {diseaseName.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-primary italic">{diseaseName.split(' ').slice(-1)}</span>
                  </>
                )}
              </h2>

              {/* AI Explanation — shown inline below disease name */}
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl font-body">
                {isHealthy
                  ? 'AI analysis confirms your plant is in excellent health. No diseases or deficiencies detected. Continue your current care routine.'
                  : `AI analysis has identified ${diseaseName} with ${confidencePct}% confidence. ${
                      result.severity_level?.toLowerCase() === 'high'
                        ? 'Immediate intervention is required to prevent significant yield loss.'
                        : 'Timely treatment is recommended to prevent further spread.'
                    } See the full AI explanation and ask follow-up questions below.`}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/chat"
                  state={{ prefill: chatPrefill }}
                  className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-6 py-3 rounded-md font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary/10"
                >
                  <span className="material-symbols-outlined text-base">psychology</span>
                  Ask AI Expert
                </Link>
                <Link
                  to="/scan"
                  className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-md font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">add_a_photo</span>
                  New Scan
                </Link>
                <Link
                  to="/history"
                  className="bg-surface-container-highest text-on-surface px-6 py-3 rounded-md font-bold text-sm border border-outline-variant/20 hover:bg-surface-bright transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">history</span>
                  History
                </Link>
              </div>
            </div>

            {/* Right: confidence card + image */}
            <div className="lg:col-span-5 space-y-6">
              {/* Confidence card */}
              <div className="bg-surface-variant/40 backdrop-blur-xl p-8 rounded-xl border-t border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">AI Confidence Score</p>
                      <h3 className="text-5xl font-black text-primary tracking-tighter">{confidencePct}%</h3>
                    </div>
                    <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(169,255,204,0.4)] transition-all duration-1000"
                      style={{ width: `${confidencePct}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] uppercase text-on-surface-variant">Sample ID</p>
                      <p className="text-sm font-mono text-on-surface">
                        AG-{result.id ?? Math.floor(Math.random() * 9000 + 1000)}-X
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-on-surface-variant">Detected At</p>
                      <p className="text-sm font-mono text-on-surface">
                        {result.created_at
                          ? new Date(result.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scanned image */}
              {result.image_url && !imgError ? (
                <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-low group cursor-zoom-in">
                  <img
                    className="w-full h-auto max-h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                    src={result.image_url}
                    alt={diseaseName}
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : imgError ? (
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low flex items-center justify-center h-40">
                  <div className="text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl block mb-2">broken_image</span>
                    <p className="text-xs">Image unavailable</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* ── Visual Analysis — GradCAM + Area Stats ───────────────────── */}
          {(result.gradcam_url || result.affected_area_pct > 0) && (
            <section className="space-y-6">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface whitespace-nowrap">
                  Visual Analysis
                </h3>
                <div className="h-px flex-1 bg-outline-variant/20 hidden md:block" />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold hidden md:block">
                  GradCAM · Activation Heatmap
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Image comparison */}
                <div className="bg-surface-container-low rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Original vs Heatmap</p>
                    <span className="text-[10px] text-on-surface-variant/60">Jet colormap overlay</span>
                  </div>
                  <div className="grid grid-cols-2 gap-0">
                    {/* Original */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold uppercase tracking-wider">
                        Original
                      </div>
                      {result.image_url && !imgError ? (
                        <img
                          src={result.image_url}
                          alt="Original scan"
                          className="w-full h-48 object-cover"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-48 bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant">image</span>
                        </div>
                      )}
                    </div>
                    {/* GradCAM */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white font-bold uppercase tracking-wider">
                        GradCAM
                      </div>
                      {result.gradcam_url ? (
                        <img
                          src={result.gradcam_url}
                          alt="GradCAM heatmap"
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-surface-container-highest flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-on-surface-variant">blur_on</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Colormap legend */}
                  <div className="px-6 py-3 flex items-center gap-3">
                    <span className="text-[10px] text-on-surface-variant">Low activation</span>
                    <div className="flex-1 h-2 rounded-full" style={{
                      background: 'linear-gradient(to right, #00007f, #0000ff, #00ffff, #00ff00, #ffff00, #ff7f00, #ff0000)'
                    }} />
                    <span className="text-[10px] text-on-surface-variant">High activation</span>
                  </div>
                </div>

                {/* Area stats */}
                <div className="space-y-4">
                  {/* Affected area */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
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
                      <span className={`text-3xl font-black tracking-tighter ${
                        (result.affected_area_pct || 0) > 40 ? 'text-error' :
                        (result.affected_area_pct || 0) > 20 ? 'text-secondary' : 'text-primary'
                      }`}>
                        {result.affected_area_pct ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (result.affected_area_pct || 0) > 40 ? 'bg-error' :
                          (result.affected_area_pct || 0) > 20 ? 'bg-secondary' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(result.affected_area_pct || 0, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {(result.affected_area_pct || 0) > 40
                        ? 'Severe infection. Large portions of the leaf surface show active disease markers. Immediate treatment required.'
                        : (result.affected_area_pct || 0) > 20
                        ? 'Moderate infection. Disease is established and spreading. Treat within 48 hours.'
                        : (result.affected_area_pct || 0) > 5
                        ? 'Early-stage infection detected. Localised lesions visible. Early treatment will prevent spread.'
                        : 'Minimal or no visible infection area. Plant appears healthy or in very early stage.'}
                    </p>
                  </div>

                  {/* Spread risk */}
                  <div className="bg-surface-container-low rounded-xl p-6 space-y-4">
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
                      <span className={`text-3xl font-black tracking-tighter ${
                        (result.spread_risk_pct || 0) > 25 ? 'text-error' :
                        (result.spread_risk_pct || 0) > 12 ? 'text-secondary' : 'text-primary'
                      }`}>
                        {result.spread_risk_pct ?? 0}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          (result.spread_risk_pct || 0) > 25 ? 'bg-error' :
                          (result.spread_risk_pct || 0) > 12 ? 'bg-secondary' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min((result.spread_risk_pct || 0) * 2, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      {(result.spread_risk_pct || 0) > 25
                        ? 'High spread risk. Active infection front detected across a wide area. Neighbouring plants are at risk.'
                        : (result.spread_risk_pct || 0) > 12
                        ? 'Moderate spread risk. Disease is advancing beyond the initial lesion zone. Isolate affected plants.'
                        : 'Low spread risk. Infection appears contained. Monitor closely over the next 3–5 days.'}
                    </p>
                  </div>

                  {/* Projection */}
                  <div className="bg-surface-container-low rounded-xl p-6">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold mb-4">7-Day Damage Projection</p>
                    <div className="space-y-2">
                      {(() => {
                        const base = result.affected_area_pct || 0;
                        const risk = result.spread_risk_pct || 0;
                        const growthRate = isHealthy ? 0 : Math.min(risk * 0.8, 8);
                        return [1, 3, 7].map((day) => {
                          const projected = Math.min(base + growthRate * day, 95);
                          return (
                            <div key={day} className="flex items-center gap-3">
                              <span className="text-[10px] text-on-surface-variant w-12 shrink-0">Day {day}</span>
                              <div className="flex-1 bg-surface-container-highest h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-primary to-error transition-all duration-700"
                                  style={{ width: `${projected}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-on-surface-variant w-10 text-right shrink-0">
                                {projected.toFixed(1)}%
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <p className="text-[10px] text-on-surface-variant/50 mt-3">
                      Projection based on current spread rate. Treat immediately to halt progression.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Intervention Strategy ─────────────────────────────────────── */}
          {!isHealthy && (
            <section className="space-y-8">
              <div className="flex items-center gap-6">
                <h3 className="text-2xl font-bold font-headline tracking-tight text-on-surface whitespace-nowrap">
                  Intervention Strategy
                </h3>
                <div className="h-px flex-1 bg-outline-variant/20 hidden md:block" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Organic */}
                <div className="bg-surface-container-low p-8 rounded-xl space-y-5 hover:bg-surface-container transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">eco</span>
                  </div>
                  <h4 className="text-xl font-bold text-on-surface">Organic</h4>
                  <ul className="space-y-3">
                    {organicTreatments.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">check_circle</span>
                        <span className="text-on-surface-variant text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical */}
                <div className="bg-surface-container-low p-8 rounded-xl space-y-5 hover:bg-surface-container transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">science</span>
                  </div>
                  <h4 className="text-xl font-bold text-on-surface">Chemical</h4>
                  <ul className="space-y-3">
                    {chemicalTreatments.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-sm text-primary mt-0.5 shrink-0">check_circle</span>
                        <span className="text-on-surface-variant text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div className="bg-surface-container-low p-8 rounded-xl space-y-5 hover:bg-surface-container transition-colors group">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined">shield</span>
                  </div>
                  <h4 className="text-xl font-bold text-on-surface">Prevention</h4>
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

          {/* ── Healthy maintenance card ──────────────────────────────────── */}
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

          {/* ── AI Explanation + Inline Chat ─────────────────────────── */}
          <section className="space-y-0 rounded-2xl overflow-hidden border border-outline-variant/15 shadow-xl">

            {/* AI Explanation header */}
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
              {result.ai_explanation ? (
                <p className="text-[#d9e6dd] leading-relaxed">{result.ai_explanation}</p>
              ) : (
                <p className="text-[#d9e6dd] leading-relaxed">
                  {isHealthy
                    ? `Your plant appears healthy with no signs of disease or deficiency. AI confidence is ${confidencePct}%. Continue your current care routine and monitor regularly.`
                    : `I've detected ${diseaseName} with ${confidencePct}% confidence. ${
                        result.severity_level?.toLowerCase() === 'high'
                          ? 'This is a high-severity condition requiring immediate intervention to prevent significant yield loss.'
                          : 'Timely treatment is recommended to prevent further spread to healthy plants.'
                      } Review the intervention strategy below and feel free to ask me anything.`}
                </p>
              )}

              {/* Quick-ask chips */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  `What causes ${diseaseName}?`,
                  `How do I treat ${diseaseName}?`,
                  `How to prevent ${diseaseName}?`,
                  'Is it contagious to other plants?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendChat(q)}
                    disabled={chatLoading}
                    className="px-3 py-1.5 rounded-full bg-surface-container-highest/60 hover:bg-primary/20 border border-outline-variant/20 hover:border-primary/30 text-xs text-on-surface-variant hover:text-primary transition-all disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat messages */}
            {chatMessages.length > 0 && (
              <div className="bg-background/60 px-8 py-6 space-y-6 max-h-96 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  msg.role === 'user' ? (
                    <div key={i} className="flex justify-end">
                      <div className="bg-primary-container text-on-primary-container px-5 py-3 rounded-t-2xl rounded-bl-2xl max-w-[80%] text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="flex justify-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-primary/20 mt-1">
                        <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                      </div>
                      <div className="glass-effect px-5 py-4 rounded-t-2xl rounded-br-2xl max-w-[85%] text-sm text-[#d9e6dd] leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  )
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

            {/* Chat input */}
            <div className="bg-surface-container px-6 py-4 border-t border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative group">
                  <div className="absolute -inset-0.5 bg-primary/10 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative bg-surface-container-highest rounded-xl flex items-center px-4 py-2.5 gap-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline/50"
                      placeholder={`Ask anything about ${diseaseName}...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={handleChatKey}
                      disabled={chatLoading}
                    />
                  </div>
                </div>
                <button
                  onClick={() => sendChat()}
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 shrink-0"
                >
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
                <Link
                  to="/chat"
                  state={{ prefill: chatPrefill }}
                  className="shrink-0 bg-surface-container-highest text-on-surface-variant hover:text-primary px-4 py-3 rounded-xl border border-outline-variant/20 hover:border-primary/30 transition-all text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                  title="Open full chat"
                >
                  <span className="material-symbols-outlined text-base">open_in_full</span>
                  <span className="hidden sm:inline">Full Chat</span>
                </Link>
              </div>
              <p className="text-[10px] text-on-surface-variant/40 mt-2 text-center">
                AgroSight AI · Powered by Gemini
              </p>
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
