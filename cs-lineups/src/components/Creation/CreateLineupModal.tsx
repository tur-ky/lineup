import React, { useState } from 'react';
import { UploadZone } from './UploadZone';
import { supabase } from '../../lib/supabase';
// import { Pin } from '../Map/Pin';
import { NewLineupState, Lineup } from '../../types/app';
import { X, Save } from 'lucide-react';

interface CreateLineupModalProps {
    onClose: () => void;
    activeMap: string;
    initialLanding?: { x: number; y: number };
    initialOrigin?: { x: number; y: number };
    onSuccess?: () => void;
    initialData?: Lineup; // For editing
}

const THROW_TYPES = [
    { id: 'throw', label: 'THROW (M1)', group: 'action' },
    { id: 'lob', label: 'LOB (M1+M2)', group: 'action' },
    { id: 'toss', label: 'TOSS (M2)', group: 'action' },
    { id: 'jump', label: 'JUMP', group: 'move' },
    { id: 'walk', label: 'WALK', group: 'move' },
    { id: 'run', label: 'RUN', group: 'move' },
    { id: 'crouch', label: 'CROUCH', group: 'move' },
];

export const CreateLineupModal: React.FC<CreateLineupModalProps> = ({ onClose, activeMap, initialLanding, initialOrigin, onSuccess, initialData }) => {
    const [loading, setLoading] = useState(false);

    // Initial parsing of throw_type string back to toggles
    const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
        if (initialData?.throw_type) {
            const newToggles: Record<string, boolean> = {};
            const parts = initialData.throw_type.split('+');
            parts.forEach(part => {
                const p = part.trim().toUpperCase();
                if (p === 'THROW') newToggles['throw'] = true;
                else if (p === 'LOB') newToggles['lob'] = true;
                else if (p === 'TOSS') newToggles['toss'] = true;
                else if (p === 'JUMP') newToggles['jump'] = true;
                else if (p === 'RUNNING') newToggles['run'] = true;
                else if (p === 'W') newToggles['walk'] = true;
                else if (p === 'CROUCH') newToggles['crouch'] = true;
            });
            return newToggles;
        }
        return {};
    });

    const [state, setState] = useState<NewLineupState>({
        landing: initialData ? { x: initialData.landing_x, y: initialData.landing_y } : (initialLanding || null),
        origin: initialData ? { x: initialData.origin_x || 0, y: initialData.origin_y || 0 } : (initialOrigin || null),
        title: initialData?.title || '',
        side: initialData?.side || 't',
        type: initialData?.utility_type || 'smoke',
        description: initialData?.description || '',
        throw_type: initialData?.throw_type || '',
        images: { pos: null, aim: null, result: null }
    });

    // Helper function to generate throw_type string from current toggles
    const generateThrowType = () => {
        const moves = [];
        if (toggles.crouch) moves.push('CROUCH');
        if (toggles.walk) moves.push('W');
        if (toggles.run) moves.push('RUNNING');
        if (toggles.jump) moves.push('JUMP');

        const action = toggles.throw ? 'THROW' : toggles.lob ? 'LOB' : toggles.toss ? 'TOSS' : '';

        if (moves.includes('RUNNING') && moves.includes('JUMP')) {
            return `RUNNING JUMP${action ? '+' + action : ''}`;
        } else {
            return [...moves, action].filter(Boolean).join('+');
        }
    };

    const handleToggle = (id: string, group: string) => {
        setToggles(prev => {
            const next = { ...prev };
            // If action group, mutual exclusion
            if (group === 'action') {
                THROW_TYPES.filter(t => t.group === 'action').forEach(t => delete next[t.id]);
            }
            // Toggle
            if (prev[id]) delete next[id];
            else next[id] = true;
            return next;
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Upload Images
            const uploadImage = async (file: File | null, path: string, existingPath?: string | null) => {
                if (!file) return existingPath || null; // Return existing if no new file
                const ext = file.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${ext}`;
                const fullPath = `${path}/${fileName}`;
                const { error } = await supabase.storage.from('lineup-images').upload(fullPath, file);
                if (error) throw error;
                return fullPath;
            };

            const [posPath, aimPath, resultPath] = await Promise.all([
                uploadImage(state.images.pos, 'pos', initialData?.image_pos_path),
                uploadImage(state.images.aim, 'aim', initialData?.image_aim_path),
                uploadImage(state.images.result, 'result', initialData?.image_result_path),
            ]);

            // Generate throw_type from current toggles at save time
            const throw_type = generateThrowType();

            const payload = {
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
                description: state.description,
                throw_type: throw_type
            };

            if (initialData?.id) {
                // Update
                const { error } = await supabase.from('lineups').update(payload).eq('id', initialData.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from('lineups').insert(payload);
                if (error) throw error;
            }

            onClose();
            onSuccess?.();
        } catch (e) {
            console.error("Error saving lineup:", e);
            alert("Failed to save lineup. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#121212] w-[500px] max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#1a1a1a]">
                    <h2 className="text-lg font-bold">{initialData ? 'Edit Lineup' : 'Create New Lineup'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto grow custom-scrollbar bg-[#121212]">
                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Title</label>
                            <input
                                type="text"
                                value={state.title}
                                onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g. A Site Stairs Smoke"
                                style={{ color: 'white' }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-accent-primary outline-none text-sm !text-white placeholder-gray-500 mb-2"
                            />
                            {/* Description Input */}
                            <input
                                type="text"
                                value={state.description}
                                onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Description (e.g. Aim at the corner...)"
                                style={{ color: 'white' }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 focus:border-accent-primary outline-none text-xs !text-gray-300 placeholder-gray-600"
                            />
                        </div>

                        {/* Type & Action (Replacing Side) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Utility</label>
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
                                <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Action</label>
                                <div className="flex flex-wrap gap-2">
                                    {THROW_TYPES.filter(t => t.group === 'action').map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => handleToggle(type.id, type.group)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: toggles[type.id] ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                                borderColor: toggles[type.id] ? 'white' : 'rgba(255, 255, 255, 0.2)',
                                                boxShadow: toggles[type.id] ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                                            }}
                                            className="flex-1 px-2 py-2 rounded border text-[10px] font-bold transition-all uppercase whitespace-nowrap hover:!text-white hover:!border-white/50"
                                        >
                                            {type.label.replace(' (', '\n(')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Movement Toggles */}
                        <div>
                            <label className="text-gray-400 text-xs uppercase font-bold mb-2 block">Movement</label>
                            <div className="flex flex-wrap gap-2">
                                {THROW_TYPES.filter(t => t.group === 'move').map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleToggle(type.id, type.group)}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: toggles[type.id] ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                            borderColor: toggles[type.id] ? 'white' : 'rgba(255, 255, 255, 0.2)',
                                            boxShadow: toggles[type.id] ? '0 0 10px rgba(255, 255, 255, 0.2)' : 'none'
                                        }}
                                        className="px-3 py-1.5 rounded border text-xs font-bold transition-all hover:!text-white hover:!border-white/50"
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            {state.throw_type && (
                                <div className="mt-2 text-xs text-accent-primary font-mono bg-accent-primary/10 inline-block px-2 py-1 rounded border border-accent-primary/20">
                                    {state.throw_type}
                                </div>
                            )}
                        </div>

                        {/* Screenshots */}
                        <div className="space-y-2 pt-2">
                            <label className="text-gray-400 text-xs uppercase font-bold block">Screenshots</label>
                            <div className="grid grid-cols-1 gap-2">
                                <UploadZone label="Position" file={state.images.pos} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, pos: f } }))} />
                                <UploadZone label="Aim Point" file={state.images.aim} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, aim: f } }))} />
                                <UploadZone label="Result" file={state.images.result} onFileSelect={(f) => setState(p => ({ ...p, images: { ...p.images, result: f } }))} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-[#1a1a1a]">
                    <button onClick={handleSubmit} disabled={loading} className="btn btn-primary w-full flex items-center justify-center gap-2">
                        {loading ? 'Saving...' : (initialData ? <><Save size={16} /> Save Changes</> : 'Create Lineup')}
                    </button>
                </div>
            </div>
        </div>
    );
};
