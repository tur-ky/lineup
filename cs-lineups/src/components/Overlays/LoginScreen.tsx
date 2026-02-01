import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, LogIn } from 'lucide-react';
import { open } from '@tauri-apps/plugin-shell';

interface LoginScreenProps {
    onClose: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleLogin = async (provider: 'discord' | 'google') => {
        setLoading(true);
        console.log(`Stubbing login for ${provider}...`);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: 'cslineups://auth-callback', // Deep link back to app
                    skipBrowserRedirect: true,
                },
            });
            if (error) throw error;

            if (data?.url) {
                console.log("Opening auth URL in system browser:", data.url);
                await open(data.url);
            } else {
                console.error("No auth URL returned from Supabase");
            }
        } catch (e) {
            console.error("Login failed:", e);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-bg-secondary w-[400px] p-8 rounded-2xl border border-glass-border shadow-2xl flex flex-col items-center gap-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-secondary hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent-primary to-purple-500 flex items-center justify-center shadow-lg shadow-accent-primary/50 mb-2">
                    <LogIn size={32} className="text-white" />
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
                    <p className="text-secondary text-sm">Sign in to create lineups and save favorites.</p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => handleLogin('discord')}
                        disabled={loading}
                        className="btn w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 border-none shadow-lg shadow-[#5865F2]/20"
                    >
                        Continue with Discord
                    </button>
                    <button
                        onClick={() => handleLogin('google')}
                        disabled={loading}
                        className="btn w-full bg-white text-black hover:bg-gray-200 py-3 border-none"
                    >
                        Continue with Google
                    </button>
                </div>

                <p className="text-xs text-secondary/50 mt-4 text-center">
                    By continuing, you agree to our nothingness policy because this is a demo app.
                </p>
            </div>
        </div>
    );
};
