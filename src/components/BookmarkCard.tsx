'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Copy, ExternalLink, Trash2, Globe, Clock, Tag, Edit } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import { getDomainName } from '@/lib/extractors';
import SafeImage from './SafeImage';

interface BookmarkCardProps {
  bookmark: Bookmark;
  viewMode: 'grid' | 'list';
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
}

export default function BookmarkCard({ bookmark, viewMode, onDelete, onEdit }: BookmarkCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleImageError = () => {
    console.log(`Image failed to load: ${bookmark.thumbnail}`);
    setImageError(true);
  };

  const getDomainIcon = () => {
    return <Globe className="w-4 h-4" />;
  };

  const getDomainBadgeColor = () => {
    return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-all duration-200 group">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0">
                    <SafeImage
              src={bookmark.thumbnail}
              alt={bookmark.title}
              fill
              className="object-cover"
              onError={handleImageError}
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  {getDomainIcon()}
                </div>
              }
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                  {bookmark.url}
                </p>
                {bookmark.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleCopyUrl}
                  className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title={copied ? 'Copied!' : 'Copy URL'}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onEdit(bookmark)}
                  className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  title="Edit bookmark"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(bookmark.id)}
                  className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDomainBadgeColor()}`}>
                  {getDomainIcon()}
                  <span className="ml-1">{getDomainName(bookmark.url)}</span>
                </div>
                
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDate(bookmark.createdAt)}
                </div>
              </div>

              {/* Tags */}
              {bookmark.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-slate-400" />
                  <div className="flex space-x-1">
                    {bookmark.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        +{bookmark.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
      {/* Main poster - taller aspect ratio */}
      <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-700">
        <SafeImage
          src={bookmark.thumbnail}
          alt={bookmark.title}
          fill
          className="object-cover"
          onError={handleImageError}
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
              <div className="text-slate-400 text-center">
                {getDomainIcon()}
                <p className="text-xs mt-2">{getDomainName(bookmark.url)}</p>
              </div>
            </div>
          }
        />

        {/* Domain badge - only visible on hover */}
        <div className={`absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDomainBadgeColor()} backdrop-blur-sm`}>
          {getDomainIcon()}
          <span className="ml-1">{getDomainName(bookmark.url)}</span>
        </div>

        {/* Hover overlay with title and date */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
              {bookmark.title}
            </h3>
            <div className="flex items-center text-sm text-white/80">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(bookmark.createdAt)}
            </div>
          </div>
        </div>

        {/* Actions overlay - only visible on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopyUrl();
            }}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/40 transition-colors"
            title={copied ? 'Copied!' : 'Copy URL'}
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-black/20 backdrop-blur-sm text-white rounded-lg hover:bg-black/40 transition-colors"
            title="Open link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(bookmark);
            }}
            className="p-2 bg-purple-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-purple-600/90 transition-colors"
            title="Edit bookmark"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(bookmark.id);
            }}
            className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600/90 transition-colors"
            title="Delete bookmark"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
