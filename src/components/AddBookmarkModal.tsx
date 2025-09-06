'use client';

import { useState } from 'react';
import { X, Plus, Loader2, Video, Globe, Film, Tag, Image as ImageIcon } from 'lucide-react';
import { Bookmark, BookmarkType } from '@/types/bookmark';
import { extractVideoInfo, extractWebPageInfo, searchMoviePoster, detectContentType } from '@/lib/extractors';
import { v4 as uuidv4 } from 'uuid';
import ThumbnailSelector from './ThumbnailSelector';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (bookmark: Bookmark) => void;
}

export default function AddBookmarkModal({ isOpen, onClose, onAdd }: AddBookmarkModalProps) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    tags: '',
    type: 'webpage' as BookmarkType,
    thumbnail: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      tags: '',
      type: 'webpage',
      thumbnail: ''
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleUrlChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    if (url) {
      try {
        const detectedType = detectContentType(url);
        setFormData(prev => ({ ...prev, type: detectedType }));
      } catch (error) {
        console.error('Error detecting content type:', error);
      }
    }
  };

  const handleExtractInfo = async () => {
    if (!formData.url) {
      setError('Please enter a URL first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let extractedData: any = {};

      if (formData.type === 'video') {
        extractedData = await extractVideoInfo(formData.url);
      } else if (formData.type === 'webpage') {
        extractedData = await extractWebPageInfo(formData.url);
      }

      setFormData(prev => ({
        ...prev,
        title: extractedData.title || prev.title,
        thumbnail: extractedData.thumbnail || extractedData.poster || prev.thumbnail,
        description: extractedData.description || prev.description
      }));
    } catch (error) {
      setError('Failed to extract information from URL');
      console.error('Extraction error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieSearch = async () => {
    if (!formData.title) {
      setError('Please enter a movie title first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const movieData = await searchMoviePoster(formData.title);
      setFormData(prev => ({
        ...prev,
        title: movieData.title || prev.title,
        thumbnail: movieData.poster || prev.thumbnail,
        url: prev.url || `https://www.imdb.com/find?q=${encodeURIComponent(movieData.title)}`
      }));
    } catch (error) {
      setError('Failed to find movie poster');
      console.error('Movie search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || (!formData.url && formData.type !== 'movie')) {
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
      url: formData.url || `https://www.imdb.com/find?q=${encodeURIComponent(formData.title)}`,
      type: formData.type,
      thumbnail: formData.thumbnail || '/api/placeholder/400/300',
      tags: tagsArray,
      description: formData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onAdd(bookmark);
    handleClose();
  };

  const getTypeIcon = (type: BookmarkType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'movie':
        return <Film className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
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
              Add Bookmark
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

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['video', 'webpage', 'movie'] as BookmarkType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type }))}
                    className={`p-3 rounded-lg border transition-all ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {getTypeIcon(type)}
                      <span className="capitalize font-medium">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* URL Field (not shown for movies) */}
            {formData.type !== 'movie' && (
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
            )}

            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={formData.type === 'movie' ? 'Movie name' : 'Bookmark title'}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                {formData.type === 'movie' && (
                  <button
                    type="button"
                    onClick={handleMovieSearch}
                    disabled={isLoading || !formData.title}
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Find Poster'
                    )}
                  </button>
                )}
              </div>
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
              <div className="flex space-x-4">
                {formData.thumbnail && (
                  <div className="relative w-24 h-32 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={formData.thumbnail}
                      alt="Current thumbnail"
                      className="w-full h-full object-cover"
                      onError={() => setFormData(prev => ({ ...prev, thumbnail: '/api/placeholder/400/300' }))}
                    />
                  </div>
                )}
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={openThumbnailSelector}
                    className="w-full px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <ImageIcon className="w-5 h-5" />
                      <span>{formData.thumbnail ? 'Change Thumbnail' : 'Select Thumbnail'}</span>
                    </div>
                  </button>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Click to search and select a thumbnail image
                  </p>
                </div>
              </div>
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
                  <span>Add Bookmark</span>
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
