import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import WebToAppConverter from './components/WebToAppConverter';
import MyAppBuilds from './components/MyAppBuilds';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('builder');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

        <Navbar 
          user={user} 
          onOpenAuth={() => setAuthModalOpen(true)} 
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <main className="flex-1">
          {activeTab === 'builder' ? (
            <WebToAppConverter 
              user={user} 
              onOpenAuth={() => setAuthModalOpen(true)} 
              onBuildSuccess={() => setActiveTab('builds')}
            />
          ) : (
            <MyAppBuilds user={user} onBackToBuilder={() => setActiveTab('builder')} />
          )}
        </main>
      </div>

      {/* SEO & Legal Policies Footer */}
      <Footer />

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
    </div>
  );
}
