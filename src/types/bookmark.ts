export type BookmarkType = 'video' | 'webpage' | 'movie';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  type: BookmarkType;
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

export interface VideoInfo {
  title: string;
  thumbnail: string;
  platform: string;
}

export interface WebPageInfo {
  title: string;
  thumbnail: string;
  description?: string;
}

export interface MovieInfo {
  title: string;
  poster: string;
  year?: string;
}
