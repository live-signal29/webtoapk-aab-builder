import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Upload, Check, Lock, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  // Form State
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // File Upload / Previews
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState('/default-icon.png'); // Path to default icon
  
  const [splashFile, setSplashFile] = useState(null);
  const [splashPreview, setSplashPreview] = useState('/default-splash.png'); // Path to default splash

  // Package & Versions
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [versionCode, setVersionCode] = useState('1');
  const [versionName, setVersionName] = useState('1.0.0');

  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);

  const iconInputRef = useRef(null);
  const splashInputRef = useRef(null);

  const plans = [
    {
      id: 'free',
      name: 'Free Single Build',
      price: 0,
      buildType: 'apk',
      desc: '1 APK, Default Icon & Package'
    },
    {
      id: 'aab',
      name: 'Play Store AAB',
      price: 3,
      buildType: 'aab',
      desc: '1 AAB File + Custom App Icon'
    },
    {
      id: 'custom',
      name: 'Custom Package or Version',
      price: 8,
      buildType: 'apk',
      desc: 'Custom Icon + Package ID & Versioning',
      badge: 'POPULAR'
    },
    {
      id: 'pro',
      name: 'Pro Bundle',
      price: 15,
      buildType: 'both',
      desc: 'APK + AAB + Custom Icon & Splash Screen'
    }
  ];

  const activePlan = plans.find(p => p.id === selectedPlan);

  // Features unlock logic
  const isIconAllowed = selectedPlan !== 'free'; // Allowed in $3, $8, $15
  const isSplashAllowed = selectedPlan === 'pro'; // Allowed in $15
  const isPackageAllowed = selectedPlan === 'custom' || selectedPlan === 'pro';

  // File Upload Handlers
  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
      toast.success("Custom App Icon uploaded!");
    }
  };

  const handleSplashChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSplashFile(file);
      setSplashPreview(URL.createObjectURL(file));
      toast.success("Custom Splash Screen uploaded!");
    }
  };

  // Helper to upload images to Supabase Storage Bucket
  const uploadImageToStorage = async (file, path) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('app-assets')
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('app-assets')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleStartBuild = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to start build!");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!appName || !websiteUrl) {
      toast.error("Please enter App Name and Website URL!");
      return;
    }

    setLoading(true);

    try {
      let finalIconUrl = null;
      let finalSplashUrl = null;

      // Upload Custom Assets if uploaded and allowed
      if (isIconAllowed && iconFile) {
        finalIconUrl = await uploadImageToStorage(iconFile, 'icons');
      }

      if (isSplashAllowed && splashFile) {
        finalSplashUrl = await uploadImageToStorage(splashFile, 'splash');
      }

      const isFree = activePlan.price === 0;

      // 1. Insert Record into Database
      const { data: buildData, error: dbError } = await supabase
        .from('builds')
        .insert([
          {
            user_id: user.id,
            app_name: appName,
            website_url: websiteUrl,
            package_name: isPackageAllowed ? packageName : 'com.webtoapp.app',
            version_code: isPackageAllowed ? versionCode : '1',
            version_name: isPackageAllowed ? versionName : '1.0.0',
            icon_url: finalIconUrl,
            splash_url: finalSplashUrl,
            build_type: activePlan.buildType,
            payment_status: isFree ? 'paid' : 'pending_payment',
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 2. Free Plan -> Instant Build
      if (isFree) {
        toast.success("Free build queued! Check dashboard in 2 mins.");
        setAppName('');
        setWebsiteUrl('');
        setLoading(false);
        return;
      }

      // 3. Paid Plan -> Generate NOWPayments Link
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
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-4 shadow-2xl">
        
        <form onSubmit={handleStartBuild} className="space-y-4">

          {/* STEP 1: APP NAME */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">1. APP NAME *</label>
            <input
              type="text"
              placeholder="e.g. My Web Store"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* STEP 2: WEBSITE URL */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">2. WEBSITE URL *</label>
            <input
              type="url"
              placeholder="https://yourwebsite.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* STEP 3: APP ICON (With Default vs Custom Preview) */}
          <div className="border border-slate-800/60 rounded-xl p-3 bg-[#070a12]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <ImageIcon size={12} className="text-indigo-400" />
                3. APP ICON
              </label>
              {!isIconAllowed && (
                <span className="text-[9px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <Lock size={10} /> $3+ Plans Only
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Default / Custom Icon Preview Box */}
              <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                {iconFile ? (
                  <img src={iconPreview} alt="Custom Icon" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <span className="text-[8px] font-bold text-slate-400 block leading-tight">DEFAULT</span>
                    <span className="text-[7px] text-slate-500">LOGO</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={iconInputRef}
                  onChange={handleIconChange}
                  className="hidden"
                  disabled={!isIconAllowed}
                />
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  disabled={!isIconAllowed}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    !isIconAllowed
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : iconFile
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20'
                  }`}
                >
                  <Upload size={12} />
                  {iconFile ? 'Change Icon' : 'Upload Custom Icon'}
                </button>
                <p className="text-[9px] text-slate-500 mt-1">
                  {iconFile ? '✔ Custom icon attached' : 'Default WebToApp icon will be used in $0 plan'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 4: SPLASH SCREEN (Pro Plan $15 Feature) */}
          <div className="border border-slate-800/60 rounded-xl p-3 bg-[#070a12]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles size={12} className="text-purple-400" />
                4. SPLASH SCREEN
              </label>
              {!isSplashAllowed && (
                <span className="text-[9px] text-purple-400/90 bg-purple-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <Lock size={10} /> Pro Plan ($15)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Default / Custom Splash Preview */}
              <div className="relative w-12 h-16 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                {splashFile ? (
                  <img src={splashPreview} alt="Splash" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-1">
                    <span className="text-[8px] font-bold text-slate-400 block leading-tight">DEFAULT</span>
                    <span className="text-[7px] text-slate-500">SPLASH</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={splashInputRef}
                  onChange={handleSplashChange}
                  className="hidden"
                  disabled={!isSplashAllowed}
                />
                <button
                  type="button"
                  onClick={() => splashInputRef.current?.click()}
                  disabled={!isSplashAllowed}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
                    !isSplashAllowed
                      ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
                      : splashFile
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20'
                  }`}
                >
                  <Upload size={12} />
                  {splashFile ? 'Change Splash' : 'Upload Custom Splash'}
                </button>
                <p className="text-[9px] text-slate-500 mt-1">
                  {splashFile ? '✔ Custom splash screen attached' : 'Default splash screen will be used'}
                </p>
              </div>
            </div>
          </div>

          {/* STEP 5: SELECT BUILD PLAN (Compact List) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">5. SELECT BUILD PLAN</label>

            <div className="space-y-1.5">
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
                    <span className="absolute -top-1.5 right-3 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase">
                      {plan.badge}
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-xs text-white leading-tight">{plan.name}</h3>
                    <p className="text-[9px] text-slate-400">{plan.desc}</p>
                  </div>
                  <div className="text-right pl-2">
                    <span className={`text-sm font-black ${plan.price === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      ${plan.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Extra Package ID inputs if Custom/Pro plan is selected */}
          {isPackageAllowed && (
            <div className="space-y-2 pt-1 bg-[#070a12] p-2.5 rounded-xl border border-amber-500/30">
              <label className="block text-[9px] font-bold text-amber-400 uppercase">PACKAGE ID & VERSIONING</label>
              <input
                type="text"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="com.mycompany.myapp"
                className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Code (1)"
                  value={versionCode}
                  onChange={(e) => setVersionCode(e.target.value)}
                  className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Name (1.0.0)"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full bg-[#05070c] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 6: START BUILD BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xl disabled:opacity-50 mt-3"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Smartphone size={16} /> START {activePlan.name.toUpperCase()}
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
