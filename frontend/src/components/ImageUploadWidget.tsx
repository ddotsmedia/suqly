'use client';

import { useState, useRef } from 'react';
import { Upload, X, ChevronUp, ChevronDown } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  crop: { x: number; y: number };
  zoom: number;
}

interface ImageUploadWidgetProps {
  onImagesUploaded: (images: { id: string; file: File; preview: string }[]) => void;
  maxImages?: number;
}

export function ImageUploadWidget({
  onImagesUploaded,
  maxImages = 10,
}: ImageUploadWidgetProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [croppingIndex, setCroppingIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    addFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (files: File[]) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages = files.map((file) => ({
      id: Math.random().toString(36),
      file,
      preview: URL.createObjectURL(file),
      crop: { x: 0, y: 0 },
      zoom: 1,
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const reorderImage = (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex((img) => img.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    setImages(newImages);
  };

  const handleUpload = async () => {
    if (images.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setIsUploading(true);
    try {
      onImagesUploaded(
        images.map((img) => ({
          id: img.id,
          file: img.file,
          preview: img.preview,
        })),
      );
      setImages([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {croppingIndex === null ? (
        <>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drag images here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:underline"
              >
                click to browse
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {maxImages} images, JPEG/PNG/WebP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {images.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, idx) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.preview}
                      alt={`preview-${idx}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                      <button
                        onClick={() => reorderImage(img.id, 'up')}
                        className="flex-1 bg-black/50 text-white p-1 rounded text-xs hover:bg-black/70"
                        disabled={idx === 0}
                      >
                        <ChevronUp className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={() => reorderImage(img.id, 'down')}
                        className="flex-1 bg-black/50 text-white p-1 rounded text-xs hover:bg-black/70"
                        disabled={idx === images.length - 1}
                      >
                        <ChevronDown className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isUploading ? 'Uploading...' : `Upload ${images.length} Image${images.length !== 1 ? 's' : ''}`}
              </button>
            </>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full h-96 bg-gray-900">
            <Cropper
              image={images[croppingIndex].preview}
              crop={images[croppingIndex].crop}
              zoom={images[croppingIndex].zoom}
              aspect={1}
              onCropChange={(crop) => {
                const newImages = [...images];
                newImages[croppingIndex].crop = crop;
                setImages(newImages);
              }}
              onZoomChange={(zoom) => {
                const newImages = [...images];
                newImages[croppingIndex].zoom = zoom;
                setImages(newImages);
              }}
            />
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={images[croppingIndex].zoom}
            onChange={(e) => {
              const newImages = [...images];
              newImages[croppingIndex].zoom = parseFloat(e.target.value);
              setImages(newImages);
            }}
            className="w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setCroppingIndex(null)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
