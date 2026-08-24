import React, { useState } from 'react';
import { ShieldCheck, Lock, FileText, RefreshCw, Mail, Globe } from 'lucide-react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <footer className="bg-[#05070c] border-t border-slate-800/80 text-slate-400 text-xs mt-12 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Grid: Brand & Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          {/* Brand Info */}
          <div>
            <h3 className="text-white font-bold text-sm tracking-wider uppercase mb-2">WebToApp Studio Pro</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Fast, reliable, and automated platform to convert your responsive websites into native Android APK and Google Play Store AAB packages.
            </p>
          </div>

          {/* Legal Links (Required for Payment Gateways & SEO) */}
          <div className="flex flex-col space-y-2 text-center">
            <span className="text-slate-200 font-semibold text-[11px] uppercase tracking-wider">Legal & Policies</span>
            <button onClick={() => setActiveModal('privacy')} className="hover:text-indigo-400 transition text-[11px]">
              Privacy Policy
            </button>
            <button onClick={() => setActiveModal('terms')} className="hover:text-indigo-400 transition text-[11px]">
              Terms of Service
            </button>
            <button onClick={() => setActiveModal('refund')} className="hover:text-indigo-400 transition text-[11px]">
              Refund Policy
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col items-center md:items-end justify-center space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[10px]">
              <ShieldCheck size={14} /> 256-Bit SSL Encrypted
            </div>
            <p className="text-[10px] text-slate-500 text-center md:text-right">
              Automated Cloud Build System • Instant Delivery
            </p>
          </div>
        </div>

        <hr className="border-slate-800/60" />

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} WebToApp Studio Pro. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <Globe size={10} /> Indexed & Verified for Search Engine Optimization
          </p>
        </div>
      </div>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl max-w-lg w-full p-5 max-h-[80vh] overflow-y-auto shadow-2xl text-slate-300 space-y-3">
            
            {activeModal === 'privacy' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-indigo-400" /> Privacy Policy
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Your privacy is critically important to us. WebToApp Studio Pro only collects the necessary information (App Name, Website URL, uploaded assets) required to compile your custom Android APK and AAB files. We do not sell or store your source website credentials or personal data.
                </p>
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-indigo-400" /> Terms of Service
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  By using WebToApp Studio Pro, you confirm that you own or have explicit permission to convert the submitted Website URL. Apps containing harmful content, malware, or violating copyright policies are strictly prohibited.
                </p>
              </>
            )}

            {activeModal === 'refund' && (
              <>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <RefreshCw size={16} className="text-indigo-400" /> Refund Policy
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  Due to the automated digital compilation nature of mobile app builds, refunds are issued if our system fails to deliver your compiled binary file within 24 hours of successful payment confirmation.
                </p>
              </>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-xl text-xs uppercase transition mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
