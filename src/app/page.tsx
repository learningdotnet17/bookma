'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import BookmarkCard from '@/components/BookmarkCard';
import AddBookmarkModal from '@/components/AddBookmarkModal';
import EditBookmarkModal from '@/components/EditBookmarkModal';
import SearchBar from '@/components/SearchBar';
import TagFilter from '@/components/TagFilter';

export default function Home() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Load bookmarks on component mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Filter bookmarks when search or tags change
  useEffect(() => {
    let filtered = bookmarks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(bookmark =>
        selectedTags.some(tag => bookmark.tags.includes(tag))
      );
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, selectedTags]);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBookmark = async (bookmark: Bookmark) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookmark),
      });

      if (response.ok) {
        const newBookmark = await response.json();
        setBookmarks(prev => [newBookmark, ...prev]);
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to add bookmark:', error);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const response = await fetch(`/api/bookmarks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setIsEditModalOpen(true);
  };

  const handleSaveBookmark = async (updatedBookmark: Bookmark) => {
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBookmark),
      });

      if (response.ok) {
        const savedBookmark = await response.json();
        setBookmarks(prev => 
          prev.map(b => b.id === savedBookmark.id ? savedBookmark : b)
        );
        setIsEditModalOpen(false);
        setEditingBookmark(null);
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error);
    }
  };

  const getAllTags = () => {
    const allTags = bookmarks.flatMap(bookmark => bookmark.tags);
    return Array.from(new Set(allTags)).sort();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BookMa
              </h1>
              <span className="text-slate-500 dark:text-slate-400 text-sm">
                Your beautiful bookmark manager
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* Add Bookmark Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} className="mr-2" />
                Add Bookmark
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <SearchBar onSearch={setSearchQuery} />
          <TagFilter
            availableTags={getAllTags()}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
          />
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Bookmarks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{bookmarks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Grid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtered Results</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredBookmarks.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Tags</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{getAllTags().length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bookmarks Grid/List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookmarks.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {filteredBookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                viewMode={viewMode}
                onDelete={handleDeleteBookmark}
                onEdit={handleEditBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No bookmarks found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {bookmarks.length === 0 
                ? "Start by adding your first bookmark!"
                : "Try adjusting your search or filters."
              }
            </p>
            {bookmarks.length === 0 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Bookmark
              </button>
            )}
          </div>
        )}
      </main>

      {/* Add Bookmark Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBookmark}
      />

      {/* Edit Bookmark Modal */}
      <EditBookmarkModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBookmark(null);
        }}
        onSave={handleSaveBookmark}
        bookmark={editingBookmark}
      />
    </div>
  );
}