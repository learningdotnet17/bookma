# BookMa - Beautiful Bookmark Manager

A modern, beautiful bookmark manager that allows you to save and organize video links, web pages, and movie names with automatic thumbnail/poster extraction.

## Features

✨ **Beautiful UI** - Modern, responsive design with dark mode support
🎬 **Multi-format Support** - Videos, web pages, and movies
🖼️ **Auto Thumbnails** - Automatic extraction of video thumbnails, web page images, and movie posters
🏷️ **Tag System** - Organize bookmarks with tags and filtering
🔍 **Search** - Real-time search across titles, URLs, descriptions, and tags
📋 **Copy to Clipboard** - Quick URL copying functionality
💾 **Local Storage** - Data stored in local JSON file
🌓 **Dark Mode** - Automatic dark/light theme support

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling and responsive design
- **Lucide React** - Beautiful icons
- **Local JSON** - File-based storage

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Adding Bookmarks

1. Click the "Add Bookmark" button
2. Choose content type (Video, Webpage, or Movie)
3. For videos/webpages: Enter URL and click "Extract" to auto-fill details
4. For movies: Enter movie name and click "Find Poster"
5. Add optional description and tags (comma-separated)
6. Click "Add Bookmark"

### Supported Video Platforms

- YouTube
- Vimeo
- TikTok
- Instagram
- Twitter/X
- And more!

### Organizing Bookmarks

- **Search**: Use the search bar to find bookmarks by title, URL, description, or tags
- **Tags**: Filter bookmarks by clicking on tags in the tag filter
- **Views**: Switch between grid and list views
- **Copy URLs**: Click the copy icon to copy URLs to clipboard

## Data Storage

Bookmarks are stored locally in `data/bookmarks.json`. This file is automatically created when you add your first bookmark.

## Deployment

For homelab deployment:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Or use Docker** (create Dockerfile if needed)

## Development

- **Lint code:** `npm run lint`
- **Type check:** `npx tsc --noEmit`

## API Endpoints

- `GET /api/bookmarks` - Get all bookmarks
- `POST /api/bookmarks` - Add new bookmark
- `DELETE /api/bookmarks?id=<id>` - Delete bookmark
- `POST /api/extract-webpage` - Extract webpage metadata
- `POST /api/search-movie-poster` - Search movie posters
- `GET /api/placeholder` - Generate placeholder images

## License

MIT License - feel free to use and modify as needed!