import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Download, Clock, CheckCircle2, AlertCircle, RefreshCw, Package, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyAppBuilds({ user }) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuilds = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('builds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuilds(data || []);
    } catch (error) {
      toast.error(`Error fetching builds: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <Smartphone size={48} className="text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Please Sign In</h2>
        <p className="text-xs text-slate-400 max-w-sm">
          You need to be logged in to view your requested app builds and download links.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="text-indigo-400" size={24} /> My App Builds
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track status and download your compiled APK & AAB files.</p>
        </div>
        <button 
          onClick={fetchBuilds}
          className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading your builds...</div>
      ) : builds.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-sm">No app builds requested yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {builds.map((build) => (
            <div key={build.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                    {build.build_format?.toUpperCase() || 'APK'}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    build.status === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                      : build.status === 'failed'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {build.status === 'completed' && <CheckCircle2 size={12} />}
                    {build.status === 'pending' && <Clock size={12} className="animate-spin" />}
                    {build.status === 'failed' && <AlertCircle size={12} />}
                    {build.status?.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{build.app_name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-2 truncate">{build.website_url}</p>
                <p className="text-[11px] text-slate-500 font-mono">Package: {build.package_name}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  {new Date(build.created_at).toLocaleDateString()}
                </span>
                
                {build.download_url ? (
                  <a 
                    href={build.download_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                  >
                    <Download size={13} /> Download File
                  </a>
                ) : (
                  <span className="text-slate-500 text-[11px] italic">Processing file...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
