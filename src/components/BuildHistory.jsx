import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Download, RefreshCw, Smartphone, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function BuildHistory({ user }) {
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
    } catch (err) {
      console.error('Error fetching build history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={12} /> Completed
          </span>
        );
      case 'building':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <RefreshCw size={12} className="animate-spin" /> Building...
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertCircle size={12} /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock size={12} /> Pending Queue
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Smartphone className="text-indigo-400" size={24} /> My App Builds
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your conversion status and download output files.
          </p>
        </div>

        <button 
          onClick={fetchBuilds}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs px-3 py-2 rounded-xl transition"
        >
          <RefreshCw size={14} /> Refresh Status
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          Loading build history...
        </div>
      ) : builds.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
          No application builds found. Start by converting a website above!
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs">
                  <th className="p-4">App Info</th>
                  <th className="p-4">URL</th>
                  <th className="p-4">Format</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {builds.map((build) => (
                  <tr key={build.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {build.icon_url ? (
                          <img src={build.icon_url} alt="App Icon" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {build.app_name[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white text-xs">{build.app_name}</div>
                          <div className="text-[10px] text-slate-500">{build.package_name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-xs text-slate-400 max-w-[150px] truncate">
                      <a href={build.website_url} target="_blank" rel="noreferrer" className="hover:underline">
                        {build.website_url}
                      </a>
                    </td>

                    <td className="p-4 uppercase text-[10px] font-bold text-indigo-400">
                      {build.build_format}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(build.status)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {build.apk_download_url && (
                          <a 
                            href={build.apk_download_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition"
                          >
                            <Download size={12} /> APK
                          </a>
                        )}

                        {build.aab_download_url && (
                          <a 
                            href={build.aab_download_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg inline-flex items-center gap-1 transition"
                          >
                            <Download size={12} /> AAB
                          </a>
                        )}

                        {!build.apk_download_url && !build.aab_download_url && (
                          <span className="text-[10px] text-slate-500 italic">Processing</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
