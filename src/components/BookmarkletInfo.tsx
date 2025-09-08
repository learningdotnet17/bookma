'use client';

import { useState } from 'react';
import { Copy, Info, Check } from 'lucide-react';

export default function BookmarkletInfo() {
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const getBookmarkletCode = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `javascript:(function(){
      const img = document.elementFromPoint(event.clientX, event.clientY);
      if (img && img.tagName === 'IMG') {
        const url = img.src || img.getAttribute('data-src');
        if (url) {
          const title = img.alt || document.title || 'Image from ' + window.location.hostname;
          const bookmarkUrl = '${origin}/add?title=' + encodeURIComponent(title) + '&thumbnail=' + encodeURIComponent(url) + '&url=' + encodeURIComponent(window.location.href);
          window.open(bookmarkUrl, '_blank', 'width=800,height=600');
        } else {
          alert('No image found. Try right-clicking directly on an image.');
        }
      } else {
        alert('Please click directly on an image to add it to bookmarks.');
      }
    })();`.replace(/\s+/g, ' ').trim();
  };

  const bookmarkletCode = getBookmarkletCode();

  const copyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bookmarkletCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!showInfo) {
    return (
      <button
        onClick={() => setShowInfo(true)}
        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center space-x-1"
      >
        <Info className="w-3 h-3" />
        <span>Browser bookmarklet available</span>
      </button>
    );
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="text-green-600 dark:text-green-400 text-sm">🚀</div>
          <div className="text-sm font-medium text-green-700 dark:text-green-300">
            Quick Add Bookmarklet
          </div>
        </div>
        <button
          onClick={() => setShowInfo(false)}
          className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
        >
          ×
        </button>
      </div>
      
      <div className="text-xs text-green-700 dark:text-green-300 space-y-2 mb-3">
        <div><strong>Install once:</strong></div>
        <ol className="list-decimal list-inside space-y-1 ml-2">
          <li>Copy the bookmarklet code below</li>
          <li>Create a new bookmark in your browser</li>
          <li>Paste the code as the URL</li>
          <li>Name it "Add to Bookmarks"</li>
        </ol>
        <div className="mt-2"><strong>Usage:</strong> Click any image on any website, then click the bookmarklet!</div>
      </div>

      <div className="relative">
        <textarea
          value={bookmarkletCode}
          readOnly
          className="w-full h-20 text-xs font-mono bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 rounded p-2 resize-none"
        />
        <button
          onClick={copyBookmarklet}
          className="absolute top-2 right-2 p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
      
      {copied && (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
          ✓ Copied to clipboard!
        </div>
      )}
    </div>
  );
}
