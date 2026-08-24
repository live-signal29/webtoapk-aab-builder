import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Package, Sparkles, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [buildType, setBuildType] = useState('apk'); // 'apk' ($5) ya 'aab' ($15)
  const [loading, setLoading] = useState(false);

  // Aap ki NOWPayments API Key
  const NOWPAYMENTS_API_KEY = "0F2K452-EVR466V-PA9G1EY-XH9FH90";

  const handleStartBuildAndPay = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to continue");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!appName || !websiteUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const amount = buildType === 'aab' ? 15 : 5;

      // 1. Supabase mein Pending-Payment Record create karein
      const { data: buildData, error: dbError } = await supabase
        .from('builds')
        .insert([
          {
            user_id: user.id,
            app_name: appName,
            website_url: websiteUrl,
            package_name: packageName,
            build_type: buildType,
            payment_status: 'pending_payment',
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. NOWPayments Automated Invoice Request create karein
      const response = await fetch('https://api.nowpayments.io/v1/invoice', {
        method: 'POST',
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_amount: amount,
          price_currency: 'usd',
          order_id: buildData.id.toString(),
          order_description: `WebToApp ${buildType.toUpperCase()} App Build (${appName})`,
          success_url: `${window.location.origin}/dashboard?status=success`,
          cancel_url: `${window.location.origin}/?status=cancelled`
        })
      });

      const invoiceData = await response.json();

      if (!invoiceData || !invoiceData.invoice_url) {
        throw new Error("Failed to generate payment link from NOWPayments");
      }

      toast.loading("Redirecting to Binance / Crypto Checkout...");

      // 3. User ko Automated NOWPayments Page par redirect karein
      window.location.href = invoiceData.invoice_url;

    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600/20 text-indigo-400 p-3 rounded-2xl border border-indigo-500/30">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Convert Web to Android App</h1>
            <p className="text-xs text-slate-400">Automated Instant Build System</p>
          </div>
        </div>

        <form onSubmit={handleStartBuildAndPay} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">App Name</label>
            <input 
              type="text" 
              placeholder="e.g. My Web App" 
              value={appName} 
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Website URL</label>
            <input 
              type="url" 
              placeholder="https://your-website.com" 
              value={websiteUrl} 
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Package ID</label>
            <input 
              type="text" 
              value={packageName} 
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 font-mono focus:outline-none"
            />
          </div>

          {/* Build Type Selection */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Select Build Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setBuildType('apk')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                  buildType === 'apk' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={24} className={buildType === 'apk' ? 'text-indigo-400' : ''} />
                <span className="font-bold text-sm">Android APK</span>
                <span className="text-[11px] text-indigo-400 font-mono font-bold">$5 USD</span>
              </button>

              <button
                type="button"
                onClick={() => setBuildType('aab')}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition ${
                  buildType === 'aab' 
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/10' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Package size={24} className={buildType === 'aab' ? 'text-indigo-400' : ''} />
                <span className="font-bold text-sm">Play Store AAB</span>
                <span className="text-[11px] text-indigo-400 font-mono font-bold">$15 USD</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Invoice...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Pay ${buildType === 'aab' ? '15' : '5'} with Binance / Crypto <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
