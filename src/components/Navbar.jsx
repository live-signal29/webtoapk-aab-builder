import React, { useState } from 'react';
import { Home, Layers, Box, Menu, X, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout, activeTab, setActiveTab }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
    setDrawerOpen(false); // Drawer close Ho jaye
  };

  return (
    <nav className="bg-[#0b0f19] border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('builder')} 
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide leading-none">WebToApp</h1>
            <span className="text-[9px] font-semibold text-indigo-400 tracking-wider uppercase">Studio Pro</span>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex items-center gap-2 bg-[#05070c] p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => handleNavClick('builder')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'builder'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home size={14} /> Home
          </button>
          <button
            onClick={() => handleNavClick('builds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'builds'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box size={14} /> My Builds
          </button>
        </div>

        {/* Action Button & Mobile Drawer Toggle */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-xl bg-[#05070c] border border-slate-800 text-slate-300 hover:text-white transition"
            >
              <Menu size={18} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-lg"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 bg-[#0b0f19] border-l border-slate-800/90 h-full p-5 flex flex-col justify-between z-10 shadow-2xl">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} /> Navigation Menu
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                {/* 1. HOME BUTTON */}
                <button
                  onClick={() => handleNavClick('builder')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-3 transition ${
                    activeTab === 'builder'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#05070c] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Home size={16} /> Home
                </button>

                {/* 2. APP BUILDER STUDIO */}
                <button
                  onClick={() => handleNavClick('builder')}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-3 bg-[#05070c] border border-slate-800 text-slate-300 hover:border-slate-700 transition"
                >
                  <Layers size={16} /> App Builder Studio
                </button>

                {/* 3. MY APP BUILDS */}
                <button
                  onClick={() => handleNavClick('builds')}
                  className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center gap-3 transition ${
                    activeTab === 'builds'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#05070c] border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Box size={16} /> My App Builds & Downloads
                </button>
              </div>
            </div>

            {/* Bottom User Info & Sign Out */}
            {user && (
              <div className="bg-[#05070c] border border-slate-800/80 rounded-2xl p-3 space-y-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <User size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-[10px] font-mono text-slate-400 truncate">{user.email}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setDrawerOpen(false);
                  }}
                  className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <LogOut size={14} /> Sign Out Account
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}
