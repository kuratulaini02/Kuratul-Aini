import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Check, Loader2, X } from 'lucide-react';
import { uploadImageToStorage } from '../../lib/supabase';

interface ImageUploaderProps {
  bucket: 'avatars' | 'projects';
  currentImageUrl: string;
  onImageUploaded: (url: string) => void;
  label?: string;
  aspectRatio?: 'square' | 'video';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  bucket,
  currentImageUrl,
  onImageUploaded,
  label = 'Unggah Gambar',
  aspectRatio = 'square',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WebP, dsb).');
      return;
    }

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 5MB.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);

    // Instant local preview
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);

    try {
      const finalUrl = await uploadImageToStorage(bucket, file);
      setPreviewUrl(finalUrl);
      onImageUploaded(finalUrl);
    } catch (err: any) {
      setErrorMsg('Gagal mengunggah gambar: ' + (err.message || 'Kesalahan jaringan'));
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">{label}</label>}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Preview Box */}
        <div
          className={`relative overflow-hidden bg-slate-100 border border-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center ${
            aspectRatio === 'square' ? 'w-24 h-24' : 'w-40 aspect-video'
          }`}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-400" />
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 w-full p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <UploadCloud className="w-6 h-6 mx-auto text-blue-600 mb-1" />
          <p className="text-xs sm:text-sm font-medium text-slate-800">
            Klik untuk memilih atau drag & drop gambar
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Bucket: <code className="text-blue-600 font-mono">{bucket}</code> (Maks. 5MB)
          </p>
        </div>
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          <span>{errorMsg}</span>
        </p>
      )}
    </div>
  );
};
