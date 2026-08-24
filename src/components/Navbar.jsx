import React, { useState } from 'react';
import { Layers, User, LogOut, Menu, X, Smartphone, Package, Sparkles } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout, activeTab, setActiveTab }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('builder')}>
            <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Layers size={22} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-none">WebToApp</span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Studio Pro</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('builder')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeTab === 'builder' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              App Builder
            </button>
            <button 
              onClick={() => setActiveTab('builds')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${activeTab === 'builds' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white'}`}
            >
              My App Builds
            </button>
          </div>

          {/* User Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <User size={14} className="text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 max-w-[120px] truncate">{user.email}</span>
                <button onClick={onLogout} className="text-slate-500 hover:text-red-400 transition ml-2" title="Logout">
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/20"
              >
                Sign In / Register
              </button>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <button onClick={() => setDrawerOpen(true)} className="md:hidden text-slate-300 hover:text-white p-2 bg-slate-950 border border-slate-800 rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Professional Mobile Drawer Sidebar */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-all">
          <div className="bg-slate-900 border-l border-slate-800 w-80 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-bold text-white text-sm">Navigation Menu</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { setActiveTab('builder'); setDrawerOpen(false); }}
                  className={`w-full text-left font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition ${
                    activeTab === 'builder' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Smartphone size={18} /> App Builder Studio
                </button>

                <button 
                  onClick={() => { setActiveTab('builds'); setDrawerOpen(false); }}
                  className={`w-full text-left font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition ${
                    activeTab === 'builds' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Package size={18} /> My App Builds & Downloads
                </button>
              </div>
            </div>

            {/* Drawer Account Profile Section */}
            <div className="border-t border-slate-800 pt-4">
              {user ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-indigo-400" />
                    <p className="text-xs text-slate-300 font-mono truncate">{user.email}</p>
                  </div>
                  <button 
                    onClick={() => { onLogout(); setDrawerOpen(false); }}
                    className="w-full bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition"
                  >
                    <LogOut size={14} /> Sign Out Account
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { onOpenAuth(); setDrawerOpen(false); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
