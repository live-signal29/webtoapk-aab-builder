import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import WebToAppConverter from './components/WebToAppConverter';
import BuildHistory from './components/BuildHistory';
import AuthModal from './components/AuthModal';
import { LogOut, User, Layers } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('converter'); // 'converter' or 'history'

  useEffect(() => {
    // Check Active Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2 font-bold text-lg text-white">
          <Layers className="text-indigo-500" size={24} />
          <span>WebToApp Studio</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                onClick={() => setActiveTab(activeTab === 'converter' ? 'history' : 'converter')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl transition"
              >
                {activeTab === 'converter' ? 'My App Builds' : 'Converter Dashboard'}
              </button>

              <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                <span className="text-xs text-slate-400 hidden sm:inline">{user.email}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setIsAuthOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5"
            >
              <User size={14} /> Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* Dynamic Tab View */}
      {activeTab === 'converter' ? (
        <WebToAppConverter user={user} onOpenAuth={() => setIsAuthOpen(true)} />
      ) : (
        <BuildHistory user={user} />
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onSuccess={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}
