'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { uploadImageToS3, deleteProductImage, validateImage, type UploadedImage } from '@/lib/upload';

interface ImageUploaderProps {
  productId: string;
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ productId, images, onImagesChange }: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter((file) => {
      const error = validateImage(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    for (const file of validFiles) {
      try {
        const newImage = await uploadImageToS3(file, productId);
        onImagesChange([...images, newImage]);
        toast.success(`${file.name} subido`);
      } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.status === 400
          ? 'S3 no está configurado en el backend'
          : `Error al subir ${file.name}`;
        toast.error(msg);
      }
    }
    setUploading(false);
  }, [productId, images, onImagesChange]);

  const handleDelete = async (imageId: string, url: string) => {
    try {
      await deleteProductImage(productId, imageId);
      onImagesChange(images.filter((img) => img.id !== imageId));
      toast.success('Imagen eliminada');
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          dragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-primary-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Subiendo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">Arrastra imágenes o haz clic para subir</p>
            <p className="text-xs">JPG, PNG, WebP, GIF · máx 5MB</p>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, idx) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <img
                src={image.url}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDelete(image.id, image.url)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-600 text-white">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-4">
          <ImageIcon className="w-5 h-5" />
          <p>No hay imágenes todavía</p>
        </div>
      )}
    </div>
  );
}
