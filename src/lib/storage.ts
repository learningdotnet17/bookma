import { Bookmark, BookmarkCollection } from '@/types/bookmark';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'bookmarks.json');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load bookmarks from JSON file
export async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const collection: BookmarkCollection = JSON.parse(data);
    return collection.bookmarks || [];
  } catch (error) {
    // File doesn't exist or is invalid, return empty array
    return [];
  }
}

// Save bookmarks to JSON file
export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await ensureDataDir();
  const collection: BookmarkCollection = {
    bookmarks,
    lastUpdated: new Date().toISOString(),
  };
  await fs.writeFile(DATA_FILE, JSON.stringify(collection, null, 2), 'utf-8');
}

// Add a new bookmark
export async function addBookmark(bookmark: Bookmark): Promise<void> {
  const bookmarks = await loadBookmarks();
  bookmarks.push(bookmark);
  await saveBookmarks(bookmarks);
}

// Update an existing bookmark
export async function updateBookmark(id: string, updates: Partial<Bookmark>): Promise<void> {
  const bookmarks = await loadBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);
  if (index !== -1) {
    bookmarks[index] = { ...bookmarks[index], ...updates, updatedAt: new Date().toISOString() };
    await saveBookmarks(bookmarks);
  }
}

// Delete a bookmark
export async function deleteBookmark(id: string): Promise<void> {
  const bookmarks = await loadBookmarks();
  const filtered = bookmarks.filter(b => b.id !== id);
  await saveBookmarks(filtered);
}

// Search bookmarks
export function searchBookmarks(bookmarks: Bookmark[], query: string): Bookmark[] {
  const lowercaseQuery = query.toLowerCase();
  return bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(lowercaseQuery) ||
    bookmark.url.toLowerCase().includes(lowercaseQuery) ||
    bookmark.description?.toLowerCase().includes(lowercaseQuery) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}

// Filter bookmarks by tags
export function filterByTags(bookmarks: Bookmark[], tags: string[]): Bookmark[] {
  if (tags.length === 0) return bookmarks;
  return bookmarks.filter(bookmark =>
    tags.some(tag => bookmark.tags.includes(tag))
  );
}

// Get all unique tags
export function getAllTags(bookmarks: Bookmark[]): string[] {
  const allTags = bookmarks.flatMap(bookmark => bookmark.tags);
  return Array.from(new Set(allTags)).sort();
}
