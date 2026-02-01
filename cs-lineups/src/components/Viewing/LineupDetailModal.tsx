import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lineup } from '../../types/app';
import { X, Copy, Check, ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

interface LineupDetailModalProps {
    lineup: Lineup;
    onClose: () => void;
    onDelete?: () => void;
}

export const LineupDetailModal: React.FC<LineupDetailModalProps> = ({ lineup, onClose, onDelete }) => {
    const [imageUrls, setImageUrls] = useState<{ pos: string; aim: string; result: string } | null>(null);
    const [copied, setCopied] = useState(false);

    // Lightbox State
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    // Resolve Signed URLs for private bucket images
    useEffect(() => {
        const resolveImages = async () => {
            const getUrl = async (path: string | null) => {
                if (!path) return '';
                const { data } = await supabase.storage.from('lineup-images').createSignedUrl(path, 3600); // 1 hour link
                return data?.signedUrl || '';
            };

            const [pos, aim, result] = await Promise.all([
                getUrl(lineup.image_pos_path),
                getUrl(lineup.image_aim_path),
                getUrl(lineup.image_result_path),
            ]);

            setImageUrls({ pos, aim, result });
        };

        resolveImages();
    }, [lineup]);

    const handleShare = () => {
        const shareUrl = `cslineups://view?id=${lineup.id}`; // Deep link format
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openLightbox = (url: string) => {
        setExpandedImage(url);
        setZoom(1);
    };

    const closeLightbox = () => {
        setExpandedImage(null);
        setZoom(1);
    };

    const adjustZoom = (delta: number) => {
        setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this lineup? This cannot be undone.')) return;

        try {
            const pathsToRemove = [lineup.image_pos_path, lineup.image_aim_path, lineup.image_result_path].filter(Boolean) as string[];

            if (pathsToRemove.length > 0) {
                await supabase.storage.from('lineup-images').remove(pathsToRemove);
            }

            const { error } = await supabase.from('lineups').delete().eq('id', lineup.id);
            if (error) throw error;

            onClose();
            onDelete?.();
        } catch (err) {
            console.error('Failed to delete lineup:', err);
            alert('Failed to delete. Please try again.');
        }
    };

    return (
        <React.Fragment>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur animate-in fade-in duration-200" onClick={onClose}>
                <div
                    className="bg-bg-secondary w-[900px] h-[600px] rounded-2xl border border-glass-border shadow-2xl overflow-hidden flex flex-col relative"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-6 border-b border-white/10 z-10 bg-bg-secondary/50 backdrop-blur">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-white tracking-wide">{lineup.title}</h2>
                            <div className="flex gap-1 items-center text-secondary text-sm font-medium">
                                <span className="uppercase">{lineup.side}</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                <span className="uppercase">{lineup.utility_type}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <button
                                onClick={handleShare}
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', padding: 0, color: 'white' }}
                                className="flex items-center gap-2 text-white hover:text-white transition-colors cursor-pointer outline-none"
                                title="Share"
                            >
                                {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                                <span className="font-medium text-sm">{copied ? 'Copied' : 'Share'}</span>
                            </button>
                            <button
                                onClick={handleDelete}
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', padding: 0, color: 'white' }}
                                className="text-white hover:text-red-500 transition-colors cursor-pointer outline-none"
                                title="Delete Lineup"
                            >
                                <Trash2 size={24} />
                            </button>
                            <div className="w-px bg-white/10 h-6 mx-2"></div>
                            <button
                                onClick={onClose}
                                style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', padding: 0, color: 'white' }}
                                className="text-white hover:text-white transition-colors cursor-pointer outline-none"
                                title="Close"
                            >
                                <X size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex grow overflow-hidden">
                        {/* Images - Carousel style (Split 3 ways for MVP) */}
                        <div className="grow grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-black">
                            {/* Aim (Large) */}
                            <div
                                className="row-span-2 relative group overflow-hidden cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); imageUrls?.aim && openLightbox(imageUrls.aim); }}
                            >
                                <span className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-base font-bold z-10">AIM HERE</span>
                                {imageUrls?.aim ? (
                                    <img src={imageUrls.aim} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Aim" />
                                ) : <div className="w-full h-full bg-white/5 animate-pulse" />}
                            </div>

                            {/* Position */}
                            <div
                                className="relative group overflow-hidden cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); imageUrls?.pos && openLightbox(imageUrls.pos); }}
                            >
                                <span className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-base font-bold z-10">POSITION</span>
                                {imageUrls?.pos ? (
                                    <img src={imageUrls.pos} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Position" />
                                ) : <div className="w-full h-full bg-white/5 animate-pulse" />}
                            </div>

                            {/* Result */}
                            <div
                                className="relative group overflow-hidden cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); imageUrls?.result && openLightbox(imageUrls.result); }}
                            >
                                <span className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-base font-bold z-10">RESULT</span>
                                {imageUrls?.result ? (
                                    <img src={imageUrls.result} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Result" />
                                ) : <div className="w-full h-full bg-white/5 animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    {/* Footer / Description */}
                    {lineup.description && (
                        <div className="p-6 border-t border-white/10 bg-bg-secondary min-h-[80px]">
                            <h4 className="text-secondary text-xs font-bold uppercase mb-1">NOTES</h4>
                            <p className="text-sm text-gray-300">{lineup.description}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox Overlay */}
            {expandedImage && (
                <React.Fragment>
                    {/* Backdrop & Image */}
                    <div
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200"
                        style={{ zIndex: 100 }}
                        onClick={closeLightbox}
                        onWheel={(e) => {
                            e.stopPropagation();
                            adjustZoom(e.deltaY > 0 ? -0.25 : 0.25);
                        }}
                    >
                        <img
                            src={expandedImage}
                            alt="Expanded View"
                            className="transition-transform duration-200 max-w-[95vw] max-h-[95vh] object-contain select-none"
                            style={{ transform: `scale(${zoom})` }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Controls Dock - Outside transformed container to ensure fixed positioning works */}
                    <div className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-black/60 backdrop-blur-md px-3 py-6 rounded-full border border-white/10 z-[110] shadow-xl animate-in fade-in duration-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); adjustZoom(-0.25); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                            title="Zoom Out"
                        >
                            <ZoomOut size={20} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); adjustZoom(0.25); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                            title="Zoom In"
                        >
                            <ZoomIn size={20} />
                        </button>
                        <div className="h-px w-full bg-white/10 my-1"></div>
                        <button
                            onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
                            className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors text-white"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
