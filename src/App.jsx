import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import WebToAppConverter from './components/WebToAppConverter';
import MyAppBuilds from './components/MyAppBuilds';
import AuthModal from './components/AuthModal';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check Active Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Global Navbar with Mobile Drawer */}
      <Navbar 
        user={user} 
        onOpenAuth={() => setAuthModalOpen(true)} 
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'builder' ? (
          <WebToAppConverter 
            user={user} 
            onOpenAuth={() => setAuthModalOpen(true)} 
          />
        ) : (
          <MyAppBuilds user={user} />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
