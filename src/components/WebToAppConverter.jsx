import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Globe, Layers, Zap, Upload, Lock, RotateCcw, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Modern High-Res Default Branding Assets
const DEFAULT_ICON_URL = "https://cdn-icons-png.flaticon.com/512/2586/2586488.png";
const DEFAULT_SPLASH_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop";

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [selectedPlan, setSelectedPlan] = useState('free_0');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    websiteUrl: '',
    appName: '',
    packageName: 'com.webtoapp.app',
    appVersion: '1.0.0',
    buildType: 'apk',
    oneSignalId: '',
    admobId: '',
    iconFile: null,
    splashFile: null,
  });

  // Previews State
  const [iconPreview, setIconPreview] = useState(DEFAULT_ICON_URL);
  const [splashPreview, setSplashPreview] = useState(DEFAULT_SPLASH_URL);

  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === 'free_0') {
      setFormData(p => ({ ...p, buildType: 'apk', packageName: 'com.webtoapp.app', appVersion: '1.0.0' }));
      toast.success("Free Plan: Standard APK format selected");
    } else if (planKey === 'aab_3') {
      setFormData(p => ({ ...p, buildType: 'aab', packageName: 'com.webtoapp.app', appVersion: '1.0.0' }));
      toast.success("$3 Plan: AAB format for Play Store selected");
    } else if (planKey === 'custom_8') {
      toast.success("$8 Plan: Custom Package Name OR Version unlocked");
    } else if (planKey === 'pro_15') {
      setFormData(p => ({ ...p, buildType: 'both' }));
      toast.success("$15 Pro Plan: All features & customizations unlocked!");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === 'packageName' || name === 'appVersion') && (selectedPlan === 'free_0' || selectedPlan === 'aab_3')) {
      toast.error("Upgrade to $8 or $15 plan to change Package Name or Version!");
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Live File Selection & Local URL Preview Generation
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fileType]: file }));
      const objectUrl = URL.createObjectURL(file);
      if (fileType === 'iconFile') {
        setIconPreview(objectUrl);
        toast.success('Custom App Icon uploaded!');
      } else {
        setSplashPreview(objectUrl);
        toast.success('Custom Splash Screen uploaded!');
      }
    }
  };

  // Reset File Back to Default Asset
  const handleResetAsset = (fileType) => {
    if (fileType === 'iconFile') {
      setFormData(prev => ({ ...prev, iconFile: null }));
      setIconPreview(DEFAULT_ICON_URL);
      toast('Restored Default App Icon', { icon: '🔄' });
    } else {
      setFormData(prev => ({ ...prev, splashFile: null }));
      setSplashPreview(DEFAULT_SPLASH_URL);
      toast('Restored Default Splash Screen', { icon: '🔄' });
    }
  };

  const uploadFileToSupabase = async (file, pathPrefix) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${pathPrefix}_${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('app-assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('app-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmitBuild = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login first to submit build!");
      onOpenAuth();
      return;
    }

    if (!formData.websiteUrl || !formData.appName) {
      toast.error("Website URL and App Name are required!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting conversion request...');

    try {
      const customIconUrl = await uploadFileToSupabase(formData.iconFile, 'icon');
      const customSplashUrl = await uploadFileToSupabase(formData.splashFile, 'splash');

      const finalIconUrl = customIconUrl || DEFAULT_ICON_URL;
      const finalSplashUrl = customSplashUrl || DEFAULT_SPLASH_URL;

      const { error } = await supabase.from('builds').insert([
        {
          user_id: user.id,
          app_name: formData.appName,
          website_url: formData.websiteUrl,
          package_name: formData.packageName,
          app_version: formData.appVersion,
          icon_url: finalIconUrl,
          splash_url: finalSplashUrl,
          onesignal_id: formData.oneSignalId,
          admob_id: formData.admobId,
          build_format: formData.buildType,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      toast.success('App Build requested successfully! Check status in My App Builds.', { id: toastId });
    } catch (err) {
      toast.error(`Error: ${err.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans"
    >
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-xs font-semibold mb-3">
          <Zap size={15} /> Instant Web to Android APK/AAB Converter Studio
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Convert Any Website to Native Android App
        </h1>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          Configure branding, select build options, and download Play Store ready files.
        </p>
      </div>

      <form onSubmit={handleSubmitBuild} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form (Configuration + Live Branding) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: App Config */}
          <motion.div whileHover={{ scale: 1.002 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Globe className="text-indigo-400" size={20} /> 1. Basic Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL *</label>
                <input 
                  type="url" 
                  name="websiteUrl"
                  placeholder="https://yourwebsite.com" 
                  value={formData.websiteUrl}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">App Name *</label>
                  <input 
                    type="text" 
                    name="appName"
                    placeholder="My App" 
                    value={formData.appName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Package Name</span>
                    {(selectedPlan === 'free_0' || selectedPlan === 'aab_3') && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock size={10} /> $8/$15 Plan</span>
                    )}
                  </label>
                  <input 
                    type="text" 
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleInputChange}
                    disabled={selectedPlan === 'free_0' || selectedPlan === 'aab_3'}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm transition ${
                      (selectedPlan === 'free_0' || selectedPlan === 'aab_3') ? 'opacity-50 cursor-not-allowed' : 'focus:border-indigo-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Step 2: Visual Branding & Live Studio Previews */}
          <motion.div whileHover={{ scale: 1.002 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-indigo-400" size={20} /> 2. Visual Branding & Live Preview
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize your app icon and splash screen or use default branding.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* App Icon Visual Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center relative">
                <span className="text-xs font-semibold text-slate-300 mb-3 self-start flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-indigo-400" /> App Icon
                </span>
                
                {/* Live Icon Box */}
                <div className="relative group">
                  <img 
                    src={iconPreview} 
                    alt="App Icon Preview" 
                    className="w-24 h-24 rounded-2xl shadow-2xl object-cover border-2 border-indigo-500/30 bg-slate-900 p-1 transition group-hover:scale-105"
                  />
                  {formData.iconFile && (
                    <button 
                      type="button"
                      onClick={() => handleResetAsset('iconFile')}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition"
                      title="Reset to Default"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>

                <div className="mt-4 w-full">
                  <span className="text-[11px] text-slate-400 block mb-2 font-mono">
                    {formData.iconFile ? 'Custom Icon Active' : 'Default Studio Icon'}
                  </span>
                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 text-xs font-medium px-4 py-2 rounded-xl transition block w-full text-center">
                    <Upload size={13} className="inline mr-1.5" /> Upload Custom Icon
                    <input 
                      type="file" 
                      accept="image/png" 
                      onChange={(e) => handleFileChange(e, 'iconFile')} 
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Splash Screen Mobile Live Frame */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center relative">
                <span className="text-xs font-semibold text-slate-300 mb-3 self-start flex items-center gap-1.5">
                  <Smartphone size={14} className="text-indigo-400" /> Splash Screen
                </span>

                {/* Mobile Phone Mockup Screen */}
                <div className="relative w-24 h-40 rounded-[1.2rem] border-4 border-slate-800 bg-slate-900 overflow-hidden shadow-2xl transition hover:scale-105">
                  {/* Speaker Bar */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-800 rounded-full z-10"></div>
                  
                  <img 
                    src={splashPreview} 
                    alt="Splash Screen Preview" 
                    className="w-full h-full object-cover"
                  />

                  {formData.splashFile && (
                    <button 
                      type="button"
                      onClick={() => handleResetAsset('splashFile')}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full z-20 shadow-lg transition"
                      title="Reset to Default"
                    >
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>

                <div className="mt-4 w-full">
                  <span className="text-[11px] text-slate-400 block mb-2 font-mono">
                    {formData.splashFile ? 'Custom Splash Active' : 'Default Studio Splash'}
                  </span>
                  <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 border border-slate-800 text-xs font-medium px-4 py-2 rounded-xl transition block w-full text-center">
                    <Upload size={13} className="inline mr-1.5" /> Upload Custom Splash
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg" 
                      onChange={(e) => handleFileChange(e, 'splashFile')} 
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

            </div>
          </motion.div>
        </div>

        {/* Right Plan Selection Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" /> Select Pay-Per-Build Plan
            </h2>
            
            <div className="space-y-3">
              
              {/* Free Plan */}
              <div 
                onClick={() => handlePlanSelect('free_0')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'free_0' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Free Single Build</span>
                  <span className="text-base font-black text-emerald-400">$0</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">1 APK File, Standard Package Name</p>
              </div>

              {/* $3 Plan */}
              <div 
                onClick={() => handlePlanSelect('aab_3')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'aab_3' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Play Store AAB</span>
                  <span className="text-base font-black text-indigo-400">$3</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">1 AAB Build, Standard Package Name</p>
              </div>

              {/* $8 Plan */}
              <div 
                onClick={() => handlePlanSelect('custom_8')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  selectedPlan === 'custom_8' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <span className="absolute -top-2 right-3 bg-amber-500 text-slate-950 text-[8px] uppercase font-black px-2 py-0.5 rounded-full">
                  Popular
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Custom Package or Version</span>
                  <span className="text-base font-black text-amber-400">$8</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">1 Build + Edit Package Name OR Version</p>
              </div>

              {/* $15 Plan */}
              <div 
                onClick={() => handlePlanSelect('pro_15')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'pro_15' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Pro Bundle</span>
                  <span className="text-base font-black text-purple-400">$15</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">APK + AAB + Full Customization + Push/AdMob</p>
              </div>

            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-xl transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {!user ? <Lock size={16} /> : <Smartphone size={16} />}
              {loading ? 'Generating App...' : user ? 'Start Conversion' : 'Login to Build App'}
            </motion.button>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
