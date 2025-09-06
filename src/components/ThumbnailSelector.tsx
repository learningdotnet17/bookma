'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Loader2, Check, X } from 'lucide-react';

interface ThumbnailOption {
  id: number;
  url: string;
  thumbnail: string;
}

interface ThumbnailSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  initialQuery: string;
  currentThumbnail?: string;
}

export default function ThumbnailSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  initialQuery, 
  currentThumbnail 
}: ThumbnailSelectorProps) {
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<ThumbnailOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(currentThumbnail || '');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && initialQuery) {
      searchImages(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Enter' && selectedUrl) {
        e.preventDefault();
        handleSelect();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedUrl]);

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setImageErrors(new Set());

    try {
      const response = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        console.error('Failed to search images');
        setImages([]);
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => new Set([...prev, imageId]));
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Select Thumbnail
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSearch} className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for images..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Images Grid */}
          <div className="p-6 overflow-y-auto max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p className="text-slate-600 dark:text-slate-400">Searching for images...</p>
                </div>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  !imageErrors.has(image.id) && (
                    <div
                      key={image.id}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        selectedUrl === image.url
                          ? 'ring-4 ring-blue-500 shadow-lg scale-105'
                          : 'hover:shadow-lg hover:scale-105'
                      }`}
                      onClick={() => setSelectedUrl(image.url)}
                    >
                      <Image
                        src={image.url}
                        alt="Thumbnail option"
                        fill
                        className="object-cover"
                        onError={() => handleImageError(image.id)}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        unoptimized={true}
                      />
                      {selectedUrl === image.url && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No images found. Try a different search term.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            {/* Keyboard shortcuts hint */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border text-xs font-mono">Enter</kbd>
                  <span>to select</span>
                </div>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded border text-xs font-mono">Esc</kbd>
                  <span>to cancel</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedUrl}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Select Thumbnail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
