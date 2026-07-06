import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';

interface BackgroundGalleryProps {
  currentValue?: string;
  onSelect: (imagePath: string) => void;
  refreshKey?: number;
}

export function BackgroundGallery({ currentValue, onSelect, refreshKey }: BackgroundGalleryProps) {
  const { t } = useI18n();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    loadImages();
  }, [refreshKey]);

  async function loadImages() {
    if (window.electronAPI) {
      const list = await window.electronAPI.listBackgroundImages();
      setImages(list);
    }
  }

  async function handleAddImages() {
    if (window.electronAPI) {
      const added = await window.electronAPI.addBackgroundImage();
      if (added.length > 0) {
        setImages((prev) => [...prev, ...added]);
      }
    }
  }

  async function handleDelete(imagePath: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(t.backgroundGallery.confirmDelete)) return;
    if (window.electronAPI) {
      await window.electronAPI.deleteBackgroundImage(imagePath);
      setImages((prev) => prev.filter((p) => p !== imagePath));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-surface-400 uppercase tracking-wide">
          {t.backgroundGallery.title}
        </h4>
        <button onClick={handleAddImages} className="btn btn-secondary text-xs px-2 py-1">
          {t.backgroundGallery.addImage}
        </button>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-surface-600 rounded-lg p-4 text-center">
          <p className="text-sm text-surface-500">{t.backgroundGallery.empty}</p>
          <button onClick={handleAddImages} className="text-xs text-primary-400 hover:text-primary-300 mt-1">
            {t.backgroundGallery.addFirst}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {images.map((imagePath) => {
            const isSelected = currentValue === imagePath;
            return (
              <div
                key={imagePath}
                onClick={() => onSelect(imagePath)}
                className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                  isSelected
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-surface-600 hover:border-surface-400'
                }`}
              >
                <img
                  src={imagePath}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-1 rounded">
                    ✓
                  </div>
                )}
                <button
                  onClick={(e) => handleDelete(imagePath, e)}
                  className="absolute top-1 right-1 bg-red-600/80 text-white text-xs w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
