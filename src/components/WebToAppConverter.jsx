import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Globe, Layers, Zap, Upload, CheckCircle2, Lock } from 'lucide-react';

export default function WebToAppConverter({ user, onOpenAuth }) {
  const [selectedPlan, setSelectedPlan] = useState('pro_7');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    websiteUrl: '',
    appName: '',
    packageName: 'com.mycompany.app',
    appVersion: '1.0.0',
    buildType: 'both', // 'apk', 'aab', 'both'
    oneSignalId: '',
    admobId: '',
    iconFile: null,
    splashFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fileType]: file }));
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
      onOpenAuth();
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Upload Assets
      const iconUrl = await uploadFileToSupabase(formData.iconFile, 'icon');
      const splashUrl = await uploadFileToSupabase(formData.splashFile, 'splash');

      // 2. Insert Record in Supabase DB
      const { data, error } = await supabase.from('builds').insert([
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

      setMessage({ type: 'success', text: 'Build request submitted successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-4 py-1.5 rounded-full text-indigo-400 text-sm font-medium mb-4">
          <Zap size={16} /> Instant Web to Android Converter
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Convert Website into APK & AAB
        </h1>
        <p className="text-slate-400 mt-2 text-base md:text-lg">
          Turn your web application into a native Android App ready for Google Play Store.
        </p>
      </div>

      {message && (
        <div className={`max-w-5xl mx-auto mb-6 p-4 rounded-xl text-sm border ${
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmitBuild} className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Grid: Configuration Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Basic Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
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
                    placeholder="My Web App" 
                    value={formData.appName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Package Name</label>
                  <input 
                    type="text" 
                    name="packageName"
                    placeholder="com.company.app" 
                    value={formData.packageName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Branding Assets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="text-indigo-400" size={20} /> 2. App Branding & Output Format
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* App Icon Upload */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-center transition bg-slate-950/50">
                <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                <span className="block text-xs font-medium text-slate-300">App Icon (.PNG)</span>
                <span className="text-[10px] text-slate-500">512x512 px</span>
                <input 
                  type="file" 
                  accept="image/png" 
                  onChange={(e) => handleFileChange(e, 'iconFile')} 
                  className="mt-2 text-[10px] text-slate-400 block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
                />
              </div>

              {/* Splash Upload */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-center transition bg-slate-950/50">
                <Upload className="mx-auto text-slate-500 mb-2" size={24} />
                <span className="block text-xs font-medium text-slate-300">Splash Screen</span>
                <span className="text-[10px] text-slate-500">1080x1920 px</span>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  onChange={(e) => handleFileChange(e, 'splashFile')} 
                  className="mt-2 text-[10px] text-slate-400 block w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:bg-indigo-600 file:text-white"
                />
              </div>
            </div>

            {/* Output Choice */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Build Output Format</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'apk', label: 'APK Only', desc: 'Direct Install' },
                  { id: 'aab', label: 'AAB Only', desc: 'Play Store' },
                  { id: 'both', label: 'APK + AAB', desc: 'Recommended' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, buildType: item.id }))}
                    className={`p-3 rounded-xl text-left border transition ${
                      formData.buildType === item.id 
                        ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Grid: Plan Selection & Action */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-6">
            <h2 className="text-lg font-bold text-white mb-4">Choose Pricing Plan</h2>
            <div className="space-y-3">
              
              {/* $3 Plan */}
              <div 
                onClick={() => setSelectedPlan('starter_3')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'starter_3' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Starter</span>
                  <span className="text-base font-extrabold text-indigo-400">$3</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Single APK Build, Standard Queue</p>
              </div>

              {/* $7 Plan */}
              <div 
                onClick={() => setSelectedPlan('pro_7')}
                className={`p-4 rounded-xl border cursor-pointer transition relative ${
                  selectedPlan === 'pro_7' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full">
                  Best Value
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">Pro</span>
                  <span className="text-base font-extrabold text-indigo-400">$7</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">APK + AAB Files, Custom Branding</p>
              </div>

              {/* $15 Plan */}
              <div 
                onClick={() => setSelectedPlan('vip_15')}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedPlan === 'vip_15' ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">VIP Plan</span>
                  <span className="text-base font-extrabold text-indigo-400">$15</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Unlimited Builds, Priority Queue, Push Setup</p>
              </div>

            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {!user ? <Lock size={16} /> : <Smartphone size={16} />}
              {loading ? 'Submitting Build...' : user ? 'Start Conversion' : 'Login to Start Build'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
