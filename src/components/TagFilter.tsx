'use client';

import { useState } from 'react';
import { Tag, X, ChevronDown } from 'lucide-react';

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagFilter({ availableTags, selectedTags, onTagsChange }: TagFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
  };

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Filtered by:
          </span>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleClearAll}
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Tag Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Tag className="w-4 h-4 mr-2" />
          Filter by tags
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute z-20 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide px-2 py-1">
                  Available Tags ({availableTags.length})
                </div>
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <Tag className="w-3 h-3 mr-2" />
                      {tag}
                      {selectedTags.includes(tag) && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
