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
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: 'cslineups://auth-callback',
                    skipBrowserRedirect: true,
                },
            });
            if (error) throw error;

            if (data?.url) {
                await open(data.url);
            } else {
                console.error('No auth URL returned from Supabase');
            }
        } catch (e) {
            console.error('Login failed:', e);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="modal-card w-[400px] p-8 flex flex-col items-center gap-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 action-icon-button" title="Close login">
                    <X size={18} />
                </button>

                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: '#ffffff', color: '#000000', boxShadow: '0 14px 28px rgba(0, 0, 0, 0.32)' }}
                >
                    <LogIn size={28} />
                </div>

                <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span className="sidebar-kicker">Account</span>
                    <h2 className="text-2xl font-bold">Sign in to save lineups</h2>
                    <p className="text-secondary text-sm">Use the same compact, dark card language as the ebook player while keeping your map workflow in place.</p>
                </div>

                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => handleLogin('discord')}
                        disabled={loading}
                        className="btn w-full"
                        style={{ background: '#1a1a1a', color: '#ffffff', borderColor: 'rgba(255,255,255,0.08)', borderStyle: 'solid' }}
                    >
                        Continue with Discord
                    </button>
                    <button
                        onClick={() => handleLogin('google')}
                        disabled={loading}
                        className="btn btn-primary w-full"
                    >
                        Continue with Google
                    </button>
                </div>

                <p className="text-xs text-secondary/50" style={{ textAlign: 'center' }}>
                    OAuth opens in your system browser and returns here through the app deep link.
                </p>
            </div>
        </div>
    );
};
