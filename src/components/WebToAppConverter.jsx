import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Globe, Layers, Zap, Upload, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [selectedPlan, setSelectedPlan] = useState('free_0');
  const [loading, setLoading] = useState(false);

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

  // Handle Plan selection & Form Rules
  const handlePlanSelect = (planKey) => {
    setSelectedPlan(planKey);
    if (planKey === 'free_0') {
      setFormData(p => ({ ...p, buildType: 'apk', packageName: 'com.webtoapp.app', appVersion: '1.0.0' }));
      toast.success("Free Plan: Standard APK format selected");
    } else if (planKey === 'aab_3') {
      setFormData(p => ({ ...p, buildType: 'aab', packageName: 'com.webtoapp.app', appVersion: '1.0.0' }));
      toast.success("$3 Plan: AAB format for Play Store selected");
    } else if (planKey === 'custom_8') {
      toast.success("$8 Plan: Custom Package Name OR Version allowed");
    } else if (planKey === 'pro_15') {
      setFormData(p => ({ ...p, buildType: 'both' }));
      toast.success("$15 Pro Plan: All options unlocked!");
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

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fileType]: file }));
      toast.success(`${fileType === 'iconFile' ? 'App Icon' : 'Splash Screen'} selected!`);
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
      const iconUrl = await uploadFileToSupabase(formData.iconFile, 'icon');
      const splashUrl = await uploadFileToSupabase(formData.splashFile, 'splash');

      const { error } = await supabase.from('builds').insert([
        {
          user_id: user.id,
          app_name: formData.appName,
          website_url: formData.websiteUrl,
          package_name: formData.packageName,
          app_version: formData.appVersion,
          icon_url: iconUrl,
          splash_url: splashUrl,
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
      <div className="max-w-5xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-sm font-medium mb-4">
          <Zap size={16} /> Pay-Per-Build Web to APK / AAB Converter
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Convert Any Website to Native Android App
        </h1>
        <p className="text-slate-400 mt-2 text-base md:text-lg">
          Generate installable APK & Play Store AAB files instantly.
        </p>
      </div>

      <form onSubmit={handleSubmitBuild} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1 */}
          <motion.div whileHover={{ scale: 1.005 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Globe className="text-indigo-400" size={20} /> 1. App Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Website URL *</label>
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
                  <label className="block text-xs font-medium text-slate-300 mb-1">App Name *</label>
                  <input 
                    type="text" 
                    name="appName"
                    placeholder="My App Name" 
                    value={formData.appName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Package Name</span>
                    {(selectedPlan === 'free_0' || selectedPlan === 'aab_3') && (
                      <span className="text-[10px] text-amber-400 flex items-center gap-1"><Lock size={10} /> $8/$15 Plan Only</span>
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

          {/* Step 2 */}
          <motion.div whileHover={{ scale: 1.005 }} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="text-indigo-400" size={20} /> 2. Custom Branding & Format
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-center transition bg-slate-950/50">
                <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                <span className="block text-xs font-medium text-slate-300">App Icon (.PNG)</span>
                <input 
                  type="file" 
                  accept="image/png" 
                  onChange={(e) => handleFileChange(e, 'iconFile')} 
                  className="mt-2 text-[10px] text-slate-400 block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
                />
              </div>

              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-center transition bg-slate-950/50">
                <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                <span className="block text-xs font-medium text-slate-300">Splash Screen</span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={(e) => handleFileChange(e, 'splashFile')} 
                  className="mt-2 text-[10px] text-slate-400 block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Pricing Selection */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4">Select Build Plan</h2>
            <div className="space-y-3">
              
              {/* $0 Plan */}
              <div 
                onClick={() => handlePlanSelect('free_0')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'free_0' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Free Single Build</span>
                  <span className="text-base font-extrabold text-emerald-400">$0</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">APK File Only, Default Package Name</p>
              </div>

              {/* $3 Plan */}
              <div 
                onClick={() => handlePlanSelect('aab_3')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'aab_3' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Play Store AAB</span>
                  <span className="text-base font-extrabold text-indigo-400">$3</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">1 AAB Build, Default Package Name</p>
              </div>

              {/* $8 Plan */}
              <div 
                onClick={() => handlePlanSelect('custom_8')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  selectedPlan === 'custom_8' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <span className="absolute -top-2 right-3 bg-amber-500 text-slate-950 text-[8px] uppercase font-black px-2 py-0.5 rounded-full">
                  Popular
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Custom Package or Version</span>
                  <span className="text-base font-extrabold text-amber-400">$8</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">1 AAB/APK Build + Custom Package Name OR Version</p>
              </div>

              {/* $15 Plan */}
              <div 
                onClick={() => handlePlanSelect('pro_15')}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'pro_15' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Pro Bundle</span>
                  <span className="text-base font-extrabold text-purple-400">$15</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">APK + AAB + Custom Package AND Version + Push/AdMob</p>
              </div>

            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {!user ? <Lock size={16} /> : <Smartphone size={16} />}
              {loading ? 'Processing Build...' : user ? 'Start Conversion' : 'Login to Build'}
            </motion.button>
          </div>
        </div>

      </form>
    </motion.div>
  );
}
