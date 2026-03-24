import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { dashboardAPI, scanAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, scansRes] = await Promise.all([
          dashboardAPI.getStats(),
          scanAPI.getHistory()
        ]);
        setStats(statsRes.data);
        setRecentScans(scansRes.data.slice(0, 3));
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserName(user.name?.split(' ')[0] || 'User');
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary selection:text-on-primary">
      <SideNavBar />
      <main className="md:ml-64 min-h-screen">
        <TopAppBar title="Field Overview" />
        
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-12">
          <section className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">
              Welcome, {userName}.
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-2xl leading-relaxed">
              Your crops are showing optimal resilience. AI analysis suggests a{' '}
              <span className="text-primary font-bold">2.4% increase</span> in yield potential since last scan.
            </p>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">analytics</span>
              </div>
              <p className="text-secondary-fixed-dim text-xs font-bold uppercase tracking-widest mb-4">Total Scans</p>
              <h3 className="text-4xl font-headline font-black text-on-surface">{stats?.total_scans || 245}</h3>
              <div className="mt-4 flex items-center gap-2 text-primary text-xs">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>12% from last month</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">coronavirus</span>
              </div>
              <p className="text-secondary-fixed-dim text-xs font-bold uppercase tracking-widest mb-4">Diseases Detected</p>
              <h3 className="text-4xl font-headline font-black text-error">{stats?.diseases_detected || 12}</h3>
              <div className="mt-4 flex items-center gap-2 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-sm">history</span>
                <span>Stability maintained</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">spa</span>
              </div>
              <p className="text-secondary-fixed-dim text-xs font-bold uppercase tracking-widest mb-4">Healthy Plants</p>
              <h3 className="text-4xl font-headline font-black text-on-surface">{stats?.healthy_plants || 218}</h3>
              <div className="mt-4 flex items-center gap-2 text-primary text-xs">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>89% of total crop</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-8 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl">verified</span>
              </div>
              <p className="text-secondary-fixed-dim text-xs font-bold uppercase tracking-widest mb-4">Accuracy</p>
              <h3 className="text-4xl font-headline font-black text-on-surface">
                {stats?.accuracy || '98.4'}<span className="text-xl">%</span>
              </h3>
              <div className="mt-4 flex items-center gap-2 text-primary text-xs">
                <span className="material-symbols-outlined text-sm">bolt</span>
                <span>High Confidence</span>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-10 rounded-xl relative group cursor-pointer overflow-hidden min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent"></div>
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-bold uppercase mb-4 tracking-wider">
                  Fast Diagnostic
                </span>
                <h2 className="text-3xl font-headline font-bold text-on-surface mb-2">Scan Your Plant</h2>
                <p className="text-on-surface-variant mb-6 max-w-md">
                  Instantly identify pests, diseases, and nutrient deficiencies with our neural engine.
                </p>
                <Link to="/scan">
                  <button className="bg-primary text-on-primary px-6 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined">add_a_photo</span>
                    Begin Analysis
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <Link to="/chat" className="bg-surface-container-highest p-8 rounded-xl flex-1 group cursor-pointer hover:bg-surface-bright transition-colors">
                <div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-tertiary-container">forum</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Open AI Chat</h3>
                <p className="text-on-surface-variant text-sm">
                  Consult our virtual agronomist for treatment plans and weather forecasts.
                </p>
              </Link>

              <Link to="/history" className="bg-surface-container-highest p-8 rounded-xl flex-1 group cursor-pointer hover:bg-surface-bright transition-colors">
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-secondary-container">history_edu</span>
                </div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-2">View History</h3>
                <p className="text-on-surface-variant text-sm">
                  Review past diagnostics and track health progress across seasons.
                </p>
              </Link>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Recent Scans</h2>
                <p className="text-on-surface-variant text-sm mt-1">Real-time telemetry from your primary fields.</p>
              </div>
              <Link to="/history" className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline">
                View All Scans
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="bg-surface-container-low rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-high/50 border-b border-outline-variant/10">
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Plant Type</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Confidence</th>
                      <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {recentScans.length > 0 ? (
                      recentScans.map((scan) => {
                        const isHealthy = scan.disease?.toLowerCase().includes('healthy');
                        const diseaseName = scan.disease
                          ? scan.disease.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          : 'Unknown';
                        const confPct = Math.round((scan.confidence || 0) * 100);
                        return (
                          <tr key={scan.id} className="hover:bg-surface-container-highest transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container-highest">
                                  {scan.image_url && (
                                    <img className="w-full h-full object-cover" src={scan.image_url} alt={diseaseName} />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-on-surface">{diseaseName}</p>
                                  <p className="text-xs text-on-surface-variant">Field Sector</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                                isHealthy
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-error/10 text-error'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-primary' : 'bg-error'}`}></span>
                                {isHealthy ? 'Healthy' : diseaseName}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-on-surface-variant text-sm">
                              {scan.created_at
                                ? new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : '—'}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 bg-surface-container-highest h-1 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${isHealthy ? 'bg-primary' : 'bg-error'}`}
                                    style={{ width: `${confPct}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-on-surface-variant w-8 text-right">{confPct}%</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <Link to={`/scan/${scan.id}`} className="text-on-surface-variant hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">arrow_forward</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-12 text-center text-on-surface-variant">
                          No recent scans. Start by scanning your first plant!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div className="h-24 md:hidden"></div>
        </div>
      </main>
      <BottomNavBar />
    </div>
  );
};

export default DashboardPage;
