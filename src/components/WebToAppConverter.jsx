import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Package, Settings2, Zap, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [selectedPlan, setSelectedPlan] = useState('free'); // 'free', 'aab', 'custom', 'pro'
  const [loading, setLoading] = useState(false);

  const NOWPAYMENTS_API_KEY = "0F2K452-EVR466V-PA9G1";

  const plans = [
    {
      id: 'free',
      name: 'Free Single Build',
      price: 0,
      buildType: 'apk',
      desc: '1 APK File, Standard Package Name'
    },
    {
      id: 'aab',
      name: 'Play Store AAB',
      price: 3,
      buildType: 'aab',
      desc: '1 AAB Build for Google Play Store'
    },
    {
      id: 'custom',
      name: 'Custom Package or Version',
      price: 8,
      buildType: 'apk',
      desc: 'Custom Package ID or Version Edit',
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
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const activePlan = plans.find(p => p.id === selectedPlan);
      const isFree = activePlan.price === 0;

      // 1. Database Entry
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

      // 2. Free Plan -> Direct Build
      if (isFree) {
        toast.success("Free build submitted! Your APK will be ready in 2-3 minutes.");
        setLoading(false);
        return;
      }

      // 3. Paid Plan -> NOWPayments Invoice
      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: activePlan.price,
          price_currency: 'usd',
          order_id: buildData.id.toString(),
          order_description: `WebToApp ${activePlan.name} (${appName})`,
          success_url: `${window.location.origin}/dashboard?status=success`,
          cancel_url: `${window.location.origin}/?status=cancelled`
        })
      });

      const invoiceData = await response.json();

      if (!invoiceData || !invoiceData.invoice_url) {
        throw new Error("Failed to generate payment link.");
      }

      window.location.href = invoiceData.invoice_url;

    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Select Build Plan</h2>

        <form onSubmit={handleStartBuild} className="space-y-6">
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  selectedPlan === plan.id
                    ? 'bg-[#101929] border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'bg-[#0a0d14] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider uppercase">
                    {plan.badge}
                  </span>
                )}
                <div>
                  <h3 className="font-bold text-sm text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{plan.desc}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${plan.price === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    ${plan.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">App Name</label>
              <input
                type="text"
                placeholder="My Web App"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {(selectedPlan === 'custom' || selectedPlan === 'pro') && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Package ID</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-4 py-3 text-sm text-indigo-400 font-mono focus:outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Smartphone size={18} /> Start {selectedPlan.toUpperCase()} Build
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
