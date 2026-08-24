import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Smartphone, Package, QrCode, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebToAppConverter({ user, onOpenAuth, onBuildSuccess }) {
  const [appName, setAppName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [packageName, setPackageName] = useState('com.webtoapp.app');
  const [buildType, setBuildType] = useState('apk'); // 'apk' ya 'aab'
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Apna Binance / Bitget USDT TRC20 Wallet Address yahan dalein
  const usdtWalletAddress = "TYYourBinanceOrBitgetUSDTAddressHere123456";

  const handleCopy = () => {
    navigator.clipboard.writeText(usdtWalletAddress);
    setCopied(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartBuild = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to start build!");
      onOpenAuth();
      return;
    }
    if (!appName || !websiteUrl) {
      toast.error("Please fill all required fields");
      return;
    }
    setShowPaymentModal(true);
  };

  const handleSubmitBuildWithPayment = async () => {
    if (!txHash || txHash.length < 10) {
      toast.error("Please enter a valid Transaction Hash (TxID)");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('builds')
        .insert([
          {
            user_id: user.id,
            app_name: appName,
            website_url: websiteUrl,
            package_name: packageName,
            build_type: buildType,
            payment_status: 'paid', // Direct approval for automated worker
            status: 'pending',
            tx_hash: txHash
          }
        ]);

      if (error) throw error;

      toast.success(`${buildType.toUpperCase()} build request submitted successfully!`);
      setShowPaymentModal(false);
      if (onBuildSuccess) onBuildSuccess();
    } catch (err) {
      toast.error(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
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
            <p className="text-xs text-slate-400">Generate APK or Play Store Ready AAB Bundle</p>
          </div>
        </div>

        <form onSubmit={handleStartBuild} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">App Name</label>
            <input 
              type="text" 
              placeholder="e.g. Live Signals - Gold" 
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

          {/* Build Format Selection */}
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
                <span className="text-[11px] text-slate-400 font-mono">$5 USDT</span>
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
                <span className="text-[11px] text-slate-400 font-mono">$15 USDT</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/20"
          >
            Proceed to Payment & Build <ArrowRight size={16} />
          </button>
        </form>
      </div>

      {/* Binance/Bitget Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">Pay with Binance / Bitget USDT</h3>
            <p className="text-xs text-slate-400 mb-4">
              Send <span className="font-bold text-indigo-400">{buildType === 'aab' ? '$15' : '$5'} USDT (TRC20)</span> to the address below:
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-slate-500 font-mono uppercase">USDT TRC20 Address</span>
                <button onClick={handleCopy} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 font-bold">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-200 font-mono break-all">{usdtWalletAddress}</p>
            </div>

            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Transaction Hash / TxID</label>
              <input 
                type="text" 
                placeholder="Paste Binance/Bitget TxID here..." 
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-1/2 bg-slate-950 border border-slate-800 text-slate-400 font-bold py-3 rounded-xl text-xs hover:text-white"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmitBuildWithPayment}
                disabled={submitting}
                className="w-1/2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {submitting ? 'Verifying...' : 'Submit & Start Build'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
