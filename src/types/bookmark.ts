export interface Bookmark {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  tags: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkCollection {
  bookmarks: Bookmark[];
  lastUpdated: string;
}

export interface ExtractedInfo {
  title: string;
  thumbnail: string;
  description?: string;
}
