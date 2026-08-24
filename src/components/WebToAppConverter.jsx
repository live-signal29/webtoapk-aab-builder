import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Image as ImageIcon, Sparkles, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [versionCode, setVersionCode] = useState('1');
  const [versionName, setVersionName] = useState('1.0.0');
  const [iconUrl, setIconUrl] = useState('');
  const [splashUrl, setSplashUrl] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Single Build',
      price: 0,
      buildType: 'apk',
      desc: '1 APK, Standard Package & Default Assets'
    },
    {
      id: 'aab',
      name: 'Play Store AAB',
      price: 3,
      buildType: 'aab',
      desc: '1 AAB File for Google Play Store'
    },
    {
      id: 'custom',
      name: 'Custom Package or Version',
      price: 8,
      buildType: 'apk',
      desc: 'Custom Package ID, Version & Custom Icon',
      badge: 'POPULAR'
    },
    {
      id: 'pro',
      name: 'Pro Bundle',
      price: 15,
      buildType: 'both',
      desc: 'APK + AAB + Full Customization (Icon + Splash)'
    }
  ];

  const activePlan = plans.find(p => p.id === selectedPlan);

  // Conditions based on plan level
  const showPackageInput = selectedPlan === 'custom' || selectedPlan === 'pro';
  const showVersionInputs = selectedPlan === 'custom' || selectedPlan === 'pro';
  const showIconInput = selectedPlan === 'custom' || selectedPlan === 'pro';
  const showSplashInput = selectedPlan === 'pro';

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
      const isFree = activePlan.price === 0;

      // Save build details to Supabase
      const { data: buildData, error: dbError } = await supabase
        .from('builds')
        .insert([
          {
            user_id: user.id,
            app_name: appName,
            website_url: websiteUrl,
            package_name: showPackageInput ? packageName : 'com.webtoapp.app',
            version_code: showVersionInputs ? versionCode : '1',
            version_name: showVersionInputs ? versionName : '1.0.0',
            icon_url: showIconInput ? iconUrl : null,
            splash_url: showSplashInput ? splashUrl : null,
            build_type: activePlan.buildType,
            payment_status: isFree ? 'paid' : 'pending_payment',
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      if (isFree) {
        toast.success("Free build queued! Check dashboard in 2 mins.");
        setAppName('');
        setWebsiteUrl('');
        setLoading(false);
        return;
      }

      // Paid Plan via backend invoice API
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

  return (
    <div className="max-w-md mx-auto p-2">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 shadow-2xl">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">SELECT BUILD PLAN</h2>

        <form onSubmit={handleStartBuild} className="space-y-3">
          {/* Plan Selector Grid */}
          <div className="space-y-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative px-3 py-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
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

          {/* Form Fields Section */}
          <div className="space-y-2.5 pt-1">
            {/* Required Common Inputs */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">APP NAME *</label>
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
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">WEBSITE URL *</label>
              <input
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Custom Package Input */}
            {showPackageInput ? (
              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">PACKAGE ID (CUSTOM)</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="com.mycompany.myapp"
                  className="w-full bg-[#05070c] border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none"
                />
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 flex justify-between px-1">
                <span>Package ID:</span>
                <span className="font-mono text-slate-400">com.webtoapp.app (Default)</span>
              </div>
            )}

            {/* Custom Version Code & Name Inputs */}
            {showVersionInputs && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">VERSION CODE</label>
                  <input
                    type="number"
                    value={versionCode}
                    onChange={(e) => setVersionCode(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">VERSION NAME</label>
                  <input
                    type="text"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* App Icon Upload / URL */}
            {showIconInput ? (
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">APP ICON URL (512x512)</label>
                <input
                  type="url"
                  placeholder="https://example.com/icon.png"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  className="w-full bg-[#05070c] border border-indigo-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 flex justify-between px-1">
                <span>App Icon:</span>
                <span className="text-slate-400">Default WebToApp Icon</span>
              </div>
            )}

            {/* Splash Screen Upload / URL (Pro Only) */}
            {showSplashInput ? (
              <div>
                <label className="block text-[10px] font-bold text-purple-400 uppercase mb-1">SPLASH SCREEN URL (PRO)</label>
                <input
                  type="url"
                  placeholder="https://example.com/splash.png"
                  value={splashUrl}
                  onChange={(e) => setSplashUrl(e.target.value)}
                  className="w-full bg-[#05070c] border border-purple-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            ) : selectedPlan === 'custom' ? (
              <div className="text-[10px] text-slate-500 flex justify-between px-1">
                <span>Splash Screen:</span>
                <span className="text-slate-400">Default Splash (Upgrade to Pro for Custom)</span>
              </div>
            ) : null}
          </div>

          {/* Compact Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Smartphone size={16} /> START {activePlan.name}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
