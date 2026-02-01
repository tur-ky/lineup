import React, { useState } from 'react';
import { UploadZone } from './UploadZone';
import { supabase } from '../../lib/supabase';
// import { Pin } from '../Map/Pin';
import { NewLineupState } from '../../types/app';
import { X } from 'lucide-react';

interface CreateLineupModalProps {
    onClose: () => void;
    activeMap: string;
    initialLanding?: { x: number; y: number };
    initialOrigin?: { x: number; y: number };
}

export const CreateLineupModal: React.FC<CreateLineupModalProps> = ({ onClose, activeMap, initialLanding, initialOrigin }) => {
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState<NewLineupState>({
        landing: initialLanding || null,
        origin: initialOrigin || null,
        title: '',
        side: 't',
        type: 'smoke',
        description: '',
        images: { pos: null, aim: null, result: null }
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Upload Images first
            const uploadImage = async (file: File | null, path: string) => {
                if (!file) return null;
                const ext = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${ext}`;
                const fullPath = `${path}/${fileName}`;
                const { error } = await supabase.storage.from('lineup-images').upload(fullPath, file);
                if (error) throw error;
                return fullPath;
            };

            const [posPath, aimPath, resultPath] = await Promise.all([
                uploadImage(state.images.pos, 'pos'),
                uploadImage(state.images.aim, 'aim'),
                uploadImage(state.images.result, 'result'),
            ]);

            // Insert Record
            const { error } = await supabase.from('lineups').insert({
                title: state.title,
                map_name: activeMap.toLowerCase(),
                side: state.side,
                utility_type: state.type,
                landing_x: state.landing?.x || 0,
                landing_y: state.landing?.y || 0,
                origin_x: state.origin?.x,
                origin_y: state.origin?.y,
                image_pos_path: posPath,
                image_aim_path: aimPath,
                image_result_path: resultPath,
                description: state.description
            });

            if (error) throw error;
            onClose();
            // TODO: Refresh map
        } catch (e) {
            console.error("Error creating lineup:", e);
            alert("Failed to create lineup. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#121212] w-[500px] max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1a]">
                    <h2 className="text-lg font-bold">Create New Lineup</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto grow custom-scrollbar bg-[#121212]">
                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Title</label>
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. A Site Stairs Smoke"
                                style={{ color: 'white' }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-accent-primary outline-none text-sm !text-white placeholder-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Type</label>
                                <select
                                    value={state.type}
                                    onChange={(e) => setState(prev => ({ ...prev, type: e.target.value as any }))}
                                    style={{ color: 'white' }}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm outline-none !text-white [&>option]:bg-[#121212] [&>option]:text-white"
                                >
                                    <option value="smoke">Smoke</option>
                                    <option value="flash">Flash</option>
                                    <option value="molotov">Molotov</option>
                                    <option value="he">HE Grenade</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Side</label>
                                <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                    <button
                                        onClick={() => setState(prev => ({ ...prev, side: 't' }))}
                                        className={`flex-1 text-xs font-bold py-1.5 rounded ${state.side === 't' ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >T</button>
                                    <button
                                        onClick={() => setState(prev => ({ ...prev, side: 'ct' }))}
                                        className={`flex-1 text-xs font-bold py-1.5 rounded ${state.side === 'ct' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >CT</button>
                                </div>
                            </div>
                        </div>

                        {/* Screenshots */}
                        <div className="space-y-2 pt-2">
                            <label className="text-gray-400 text-xs uppercase font-bold block">Screenshots</label>
                            <div className="grid grid-cols-1 gap-2"> {/* Changed to 1 column for filename list or keep 3 but simpler? User said "display the name of the screenshot... it just takes the place of the upload file prompt". */}
                                <UploadZone label="Position" file={state.images.pos} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, pos: f } }))} />
                                <UploadZone label="Aim Point" file={state.images.aim} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, aim: f } }))} />
                                <UploadZone label="Result" file={state.images.result} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, result: f } }))} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-[#1a1a1a]">
                    <button onClick={handleSubmit} disabled={loading} className="btn btn-primary w-full">
                        {loading ? 'Uploading...' : 'Create Lineup'}
                    </button>
                </div>
            </div>
        </div>
    );
};
