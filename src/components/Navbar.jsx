import React, { useState } from 'react';
import { Layers, User, LogOut, Menu, X, Smartphone, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Navbar({ user, onOpenAuth, onLogout, activeTab, setActiveTab }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('builder')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
              <Layers size={22} />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-none">WebToApp</span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">Studio Pro</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('builder')}
              className={`text-xs font-semibold transition ${activeTab === 'builder' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              App Builder
            </button>
            <button 
              onClick={() => setActiveTab('builds')}
              className={`text-xs font-semibold transition ${activeTab === 'builds' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
            >
              My App Builds
            </button>
          </div>

          {/* User Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                <User size={14} className="text-indigo-400" />
                <span className="text-xs font-mono text-slate-300 max-w-[120px] truncate">{user.email}</span>
                <button 
                  onClick={onLogout}
                  className="text-slate-500 hover:text-red-400 transition ml-2"
                  title="Logout"
                >
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
          <button 
            onClick={() => setDrawerOpen(true)}
            className="md:hidden text-slate-400 hover:text-white p-2"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Sidebar */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-800 w-72 h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-white text-base">Menu</span>
                <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => { setActiveTab('builder'); setDrawerOpen(false); }}
                  className="w-full text-left bg-slate-950 border border-slate-800 text-white font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                >
                  <Smartphone size={16} className="text-indigo-400" /> App Builder
                </button>

                <button 
                  onClick={() => { setActiveTab('builds'); setDrawerOpen(false); }}
                  className="w-full text-left bg-slate-950 border border-slate-800 text-white font-medium px-4 py-3 rounded-xl text-sm flex items-center gap-3"
                >
                  <Layers size={16} className="text-indigo-400" /> My App Builds
                </button>
              </div>
            </div>

            {/* Bottom Account Action */}
            <div className="border-t border-slate-800 pt-4">
              {user ? (
                <div>
                  <p className="text-[11px] text-slate-500 font-mono mb-2 truncate">{user.email}</p>
                  <button 
                    onClick={() => { onLogout(); setDrawerOpen(false); }}
                    className="w-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { onOpenAuth(); setDrawerOpen(false); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs"
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
