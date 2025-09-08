'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Tag, Image as ImageIcon, Globe } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import { extractLinkInfo, getDomainName } from '@/lib/extractors';
import { v4 as uuidv4 } from 'uuid';
import ThumbnailSelector from './ThumbnailSelector';
import BookmarkletInfo from './BookmarkletInfo';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bookmark: Bookmark) => void;
  prefillData?: {title?: string; url?: string; thumbnail?: string} | null;
}

export default function AddBookmarkModal({ isOpen, onClose, onAdd, prefillData }: AddBookmarkModalProps) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: '',
    thumbnail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);

  // Prefill form when modal opens or prefillData changes
  useEffect(() => {
    if (isOpen && prefillData) {
      setFormData(prev => ({
        ...prev,
        url: prefillData.url || prev.url,
        title: prefillData.title || prev.title,
        thumbnail: prefillData.thumbnail || prev.thumbnail
      }));
    }
  }, [isOpen, prefillData]);

  if (!isOpen) return null;


  const resetForm = () => {
    setFormData({
      url: prefillData?.url || '',
      title: prefillData?.title || '',
      description: '',
      tags: '',
      thumbnail: prefillData?.thumbnail || ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
  };

  const handleExtractInfo = async () => {
    if (!formData.url) {
      setError('Please enter a URL first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const extractedData = await extractLinkInfo(formData.url);

      setFormData(prev => ({
        ...prev,
        title: extractedData.title || prev.title,
        thumbnail: extractedData.thumbnail || prev.thumbnail,
        description: extractedData.description || prev.description
      }));
    } catch (error) {
      setError('Failed to extract information from URL');
      console.error('Extraction error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      setError('Please fill in all required fields');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const bookmark: Bookmark = {
      id: uuidv4(),
      title: formData.title,
      url: formData.url,
      thumbnail: formData.thumbnail || '/api/placeholder/400/300',
      tags: tagsArray,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAdd(bookmark);
    handleClose();
  };


  const handleThumbnailSelect = (url: string) => {
    setFormData(prev => ({ ...prev, thumbnail: url }));
  };

  const openThumbnailSelector = () => {
    setShowThumbnailSelector(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Add Web Link
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* URL Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={handleExtractInfo}
                  disabled={isLoading || !formData.url}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Extract'
                  )}
                </button>
              </div>
            </div>

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Bookmark title"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
              />
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="funny, tutorial, work (comma-separated)"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Separate tags with commas
              </p>
            </div>

            {/* Thumbnail Section */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Thumbnail
              </label>
              
              {formData.thumbnail ? (
                <div className="flex space-x-4">
                  <div className="relative w-24 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="Current thumbnail"
                      className="w-full h-full object-cover"
                      onError={() => setFormData(prev => ({ ...prev, thumbnail: '/api/placeholder/400/300' }))}
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <button
                      type="button"
                      onClick={openThumbnailSelector}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>Search & Change</span>
                      </div>
                    </button>
                    
                    {/* Manual URL input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Or paste image URL here..."
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            const target = e.target as HTMLInputElement;
                            const url = target.value.trim();
                            if (url && url.startsWith('http')) {
                              setFormData(prev => ({ ...prev, thumbnail: url }));
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const url = input?.value?.trim();
                          if (url && url.startsWith('http')) {
                            setFormData(prev => ({ ...prev, thumbnail: url }));
                            input.value = '';
                          }
                        }}
                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                      className="text-xs text-red-600 hover:text-red-700 transition-colors"
                    >
                      Remove thumbnail
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search button */}
                  <button
                    type="button"
                    onClick={openThumbnailSelector}
                    disabled={isLoading}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>Search for Thumbnail</span>
                    </div>
                  </button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">or</span>
                    </div>
                  </div>
                  
                  {/* Manual URL input with drag & drop */}
                  <div 
                    className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg p-3 transition-colors hover:border-blue-400 dark:hover:border-blue-500"
                    onDrop={(e) => {
                      e.preventDefault();
                      const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
                      if (url && url.startsWith('http')) {
                        setFormData(prev => ({ ...prev, thumbnail: url }));
                      }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Paste image URL here or drag image from browser..."
                        className="flex-1 px-3 py-2 border-0 focus:ring-0 outline-none bg-transparent text-slate-900 dark:text-white placeholder-slate-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            const target = e.target as HTMLInputElement;
                            const url = target.value.trim();
                            if (url && url.startsWith('http')) {
                              setFormData(prev => ({ ...prev, thumbnail: url }));
                              target.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          const url = input?.value?.trim();
                          if (url && url.startsWith('http')) {
                            setFormData(prev => ({ ...prev, thumbnail: url }));
                            input.value = '';
                          }
                        }}
                        className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                  
                  {/* Pro tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-600 dark:text-blue-400 text-sm">💡</div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">
                        <div className="font-medium mb-1">Pro tip:</div>
                        <div className="text-xs space-y-1">
                          <div>1. Open Google/Bing Images in browser</div>
                          <div>2. Find the perfect image</div>
                          <div>3. Right-click → "Copy image address"</div>
                          <div>4. Paste URL above</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bookmarklet Info */}
                  <BookmarkletInfo />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Link</span>
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>

      {/* Thumbnail Selector Modal */}
      <ThumbnailSelector
        isOpen={showThumbnailSelector}
        onClose={() => setShowThumbnailSelector(false)}
        onSelect={handleThumbnailSelect}
        initialQuery={formData.title}
        currentThumbnail={formData.thumbnail}
      />
    </>
  );
}
