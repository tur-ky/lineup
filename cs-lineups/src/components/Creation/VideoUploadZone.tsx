import React, { useCallback, useState } from 'react';
import { X, Video } from 'lucide-react';

interface VideoUploadZoneProps {
    file: File | null;
    onFileSelect: (file: File | null) => void;
}

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ACCEPTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'image/gif'];
const ACCEPTED_EXTENSIONS = ['.mp4', '.webm', '.gif'];

export const VideoUploadZone: React.FC<VideoUploadZoneProps> = ({ file, onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const validateAndSelectFile = useCallback((selectedFile: File) => {
        // Size validation
        if (selectedFile.size > MAX_VIDEO_SIZE_BYTES) {
            alert(`Video file size must be under ${MAX_VIDEO_SIZE_MB}MB. Selected file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`);
            return;
        }

        // Format validation
        const isValidFormat = ACCEPTED_VIDEO_FORMATS.includes(selectedFile.type);
        const hasValidExtension = ACCEPTED_EXTENSIONS.some(ext => selectedFile.name.toLowerCase().endsWith(ext));

        if (!isValidFormat && !hasValidExtension) {
            alert(`Invalid video format. Please select a .mp4, .webm, or .gif file.`);
            return;
        }

        // Create preview URL for local playback
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
        onFileSelect(selectedFile);

        console.log("Video asset loaded:", url);
    }, [onFileSelect]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    }, [validateAndSelectFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    const handleRemove = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        onFileSelect(null);
    }, [previewUrl, onFileSelect]);

    // Cleanup preview URL on unmount
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const isGif = file?.type === 'image/gif' || file?.name.toLowerCase().endsWith('.gif');

    return (
        <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Video Context (Optional)</label>

            {file ? (
                <div className="relative w-full p-2 rounded-lg border border-glass-border bg-black/40 flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                        {/* Thumbnail Preview */}
                        <div className="w-16 h-10 bg-black/50 rounded overflow-hidden flex-shrink-0 border border-white/10 flex items-center justify-center">
                            {previewUrl ? (
                                isGif ? (
                                    <img
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        alt="GIF preview"
                                    />
                                ) : (
                                    <video
                                        src={previewUrl}
                                        className="w-full h-full object-cover"
                                        muted
                                        loop
                                        preload="metadata"
                                    />
                                )
                            ) : (
                                <Video className="text-secondary opacity-50" size={20} />
                            )}
                        </div>

                        {/* File Info */}
                        <div className="flex flex-col justify-center min-w-0">
                            <span className="text-xs text-white truncate" title={file.name}>{file.name}</span>
                        </div>
                    </div>

                    {/* Remove button */}
                    <button
                        onClick={handleRemove}
                        style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                        className="text-white hover:opacity-60 transition-opacity bg-transparent cursor-pointer p-0 flex-shrink-0 ml-2"
                        title="Remove video"
                    >
                        <X size={16} color="white" />
                    </button>
                </div>
            ) : (
                <label
                    className={`w-full py-3 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors gap-2
                ${isDragging
                            ? 'border-accent-primary bg-accent-primary/10'
                            : 'border-white/10 bg-black/20 hover:border-white/20'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Video className="text-secondary" size={16} />
                    <span className="text-xs text-secondary font-medium">Choose Video</span>
                    <span className="text-[10px] text-secondary/60">(.mp4, .webm, .gif)</span>
                    <input 
                        type="file" 
                        className="hidden"
                        accept={ACCEPTED_EXTENSIONS.join(',')}
                        onChange={handleChange} 
                    />
                </label>
            )}
            {file && (
                <span className="text-[9px] text-secondary/60 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)}MB / {MAX_VIDEO_SIZE_MB}MB
                </span>
            )}
        </div>
    );
};
