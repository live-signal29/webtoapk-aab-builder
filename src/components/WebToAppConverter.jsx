import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Single Build',
      price: 0,
      buildType: 'apk',
      desc: '1 APK, Standard Package'
    },
    {
      id: 'aab',
      name: 'Play Store AAB',
      price: 3,
      buildType: 'aab',
      desc: '1 AAB Build for Play Store'
    },
    {
      id: 'custom',
      name: 'Custom Package or Version',
      price: 8,
      buildType: 'apk',
      desc: 'Custom Package ID / Version Edit',
      badge: 'POPULAR'
    },
    {
      id: 'pro',
      name: 'Pro Bundle',
      price: 15,
      buildType: 'both',
      desc: 'APK + AAB + Full Customization'
    }
  ];

  const handleStartBuild = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to start build!");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!appName || !websiteUrl) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      const activePlan = plans.find(p => p.id === selectedPlan);
      const isFree = activePlan.price === 0;

      // 1. Save build record in Supabase
      const { data: buildData, error: dbError } = await supabase
        .from('builds')
        .insert([
          {
            user_id: user.id,
            app_name: appName,
            website_url: websiteUrl,
            package_name: packageName,
            build_type: activePlan.buildType,
            payment_status: isFree ? 'paid' : 'pending_payment',
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Free Plan -> Instant Build Submit
      if (isFree) {
        toast.success("Free build queued! Check dashboard in 2 mins.");
        setAppName('');
        setWebsiteUrl('');
        setLoading(false);
        return;
      }

      // 3. Paid Plan -> Call backend API route
      const apiRes = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: activePlan.price,
          orderId: buildData.id,
          appName: appName,
          planName: activePlan.name
        })
      });

      const invoiceData = await apiRes.json();

      if (!apiRes.ok || !invoiceData.invoice_url) {
        throw new Error(invoiceData.error || "Failed to generate payment link");
      }

      window.location.href = invoiceData.invoice_url;

    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const activePlanObj = plans.find(p => p.id === selectedPlan);

  return (
    <div className="max-w-md mx-auto p-2">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 shadow-xl">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Select Build Plan</h2>

        <form onSubmit={handleStartBuild} className="space-y-3">
          {/* Compact Category Grid / List */}
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative px-3 py-2 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                  selectedPlan === plan.id
                    ? 'bg-[#101929] border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2 right-3 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-xs text-white leading-tight">{plan.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{plan.desc}</p>
                </div>
                <div className="text-right pl-2">
                  <span className={`text-sm font-black ${plan.price === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    ${plan.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Compact Form Inputs */}
          <div className="space-y-2.5 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">App Name</label>
              <input
                type="text"
                placeholder="My Web App"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {(selectedPlan === 'custom' || selectedPlan === 'pro') && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package ID</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-indigo-400 font-mono focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Action Button visible without excess scrolling */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Smartphone size={16} /> Start {activePlanObj.name}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
