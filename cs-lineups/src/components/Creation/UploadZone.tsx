import React, { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface UploadZoneProps {
    label: string;
    file: File | null;
    onFileSelect: (file: File | null) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ label, file, onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
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
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{label}</span>

            {file ? (
                <div className="relative w-full p-2 rounded-lg border border-glass-border bg-black/40 flex items-center justify-between group">
                    <span className="text-sm text-white truncate pr-6" title={file.name}>{file.name}</span>
                    <button
                        onClick={() => onFileSelect(null)}
                        className="p-1 hover:bg-white/10 rounded-full text-secondary hover:text-white transition-colors"
                    >
                        <X size={14} />
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
                    <Upload className="text-secondary" size={16} />
                    <span className="text-xs text-secondary font-medium">Choose File</span>
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={handleChange} />
                </label>
            )}
        </div>
    );
};
