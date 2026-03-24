import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';
import BottomNavBar from '../components/BottomNavBar';
import { scanAPI } from '../services/api';

const HistoryPage = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchScans = async () => {
      try {
        const response = await scanAPI.getHistory();
        setScans(response.data);
      } catch (error) {
        console.error('Error fetching scan history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchScans();
  }, []);

  const filteredScans = scans.filter(scan => {
    const isHealthy = scan.disease?.toLowerCase().includes('healthy');
    const conf = scan.confidence || 0;
    if (filter === 'healthy') return isHealthy;
    if (filter === 'issues') return !isHealthy;
    if (filter === 'high-confidence') return conf >= 0.9;
    return true;
  });

  const handleDelete = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) return;
    try {
      await scanAPI.delete(scanId);
      setScans(scans.filter(s => s.id !== scanId));
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant">Loading scan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background antialiased selection:bg-primary/30">
      <SideNavBar />
      <div className="md:ml-64 min-h-screen flex flex-col">
        <TopAppBar title="Scan History" />
        
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto">
          {/* Filter Pills */}
          <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filter === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilter('healthy')}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'healthy'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Healthy Only
            </button>
            <button
              onClick={() => setFilter('issues')}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'issues'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              Issues Detected
            </button>
            <button
              onClick={() => setFilter('high-confidence')}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === 'high-confidence'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              High Confidence
            </button>
          </div>

          {/* Log Section Title */}
          <div className="mb-8 border-l-4 border-primary pl-6 py-1">
            <h3 className="text-3xl font-black font-headline text-on-surface">Diagnostic Record</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Detailed analysis history of crop health and vitality.
            </p>
          </div>

          {/* Bento Grid List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredScans.length > 0 ? (
              filteredScans.map((scan) => {
                const isHealthy = scan.disease?.toLowerCase().includes('healthy');
                const confPct = Math.round((scan.confidence || 0) * 100);
                const diseaseName = scan.disease
                  ? scan.disease.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                  : 'Unknown';

                return (
                  <div
                    key={scan.id}
                    className="group relative bg-surface-container-low rounded-xl overflow-hidden hover:bg-surface-container-high transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row p-6 items-center gap-8">
                      <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0">
                        {scan.image_url ? (
                          <img
                            alt={diseaseName}
                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                            src={scan.image_url}
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant">image</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-xl font-bold font-headline text-on-surface">{diseaseName}</h4>
                              <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded ${
                                isHealthy
                                  ? 'bg-on-primary-fixed-variant/30 text-primary-fixed'
                                  : 'bg-error-container/30 text-error'
                              }`}>
                                {isHealthy ? 'Healthy' : 'Warning'}
                              </span>
                            </div>
                            <p className="text-sm text-on-surface-variant flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {scan.created_at
                                ? new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Unknown date'}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-tighter">Confidence</p>
                              <p className={`text-xl font-black ${isHealthy ? 'text-primary' : 'text-secondary'}`}>
                                {confPct}%
                              </p>
                            </div>
                            <div className="h-12 w-[1px] bg-outline-variant/20 hidden md:block"></div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                              isHealthy
                                ? 'bg-on-primary-fixed-variant/10 border-primary/10'
                                : 'bg-error-container/10 border-error/20'
                            }`}>
                              <span className={`material-symbols-outlined filled ${isHealthy ? 'text-primary' : 'text-error'}`}>
                                {isHealthy ? 'check_circle' : 'warning'}
                              </span>
                              <span className={`font-bold ${isHealthy ? 'text-primary' : 'text-error'}`}>
                                {isHealthy ? 'Healthy' : diseaseName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col gap-2 w-full md:w-auto">
                        <Link
                          to={`/scan/${scan.id}`}
                          className="flex-1 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest rounded-lg text-on-surface hover:bg-primary hover:text-on-primary transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(scan.id)}
                          className="flex-1 md:w-10 md:h-10 flex items-center justify-center bg-surface-container-highest rounded-lg text-on-surface hover:bg-error hover:text-on-error transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">history</span>
                <p className="text-on-surface-variant text-lg">No scans found matching your filter.</p>
              </div>
            )}
          </div>

          {/* AI Insight Card */}
          {scans.length > 0 && (
            <div className="mt-16 p-8 bg-surface-variant/40 backdrop-blur-[12px] rounded-xl relative border-t border-primary/20">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                </div>
                <div>
                  <h5 className="text-lg font-bold font-headline text-on-surface mb-2">Diagnostic Summary</h5>
                  <p className="text-on-surface-variant leading-relaxed">
                    Based on your recent scans, {Math.round((scans.filter(s => s.disease?.toLowerCase().includes('healthy')).length / scans.length) * 100)}% of crops are maintaining optimal health levels. 
                    {scans.some(s => !s.disease?.toLowerCase().includes('healthy')) && (
                      <span> We've detected recurring patterns that may require attention. Recommended action: Review affected crops and consider preventive measures.</span>
                    )}
                  </p>
                  <button className="mt-6 text-primary text-sm font-bold flex items-center gap-2 hover:underline">
                    View Detailed Intelligence Report
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <BottomNavBar />
    </div>
  );
};

export default HistoryPage;
