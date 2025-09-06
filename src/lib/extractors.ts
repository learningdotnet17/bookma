import { VideoInfo, WebPageInfo, MovieInfo } from '@/types/bookmark';

// Extract video information from various platforms
export async function extractVideoInfo(url: string): Promise<VideoInfo> {
  try {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const title = await getYouTubeTitle(videoId);
      // Try multiple thumbnail qualities as fallback
      const thumbnailUrls = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`
      ];
      
      return {
        title,
        thumbnail: thumbnailUrls[1], // Use hqdefault as primary
        platform: 'YouTube'
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      const info = await getVimeoInfo(videoId);
      return {
        title: info.title,
        thumbnail: info.thumbnail,
        platform: 'Vimeo'
      };
    }

    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    if (tiktokMatch) {
      return {
        title: 'TikTok Video',
        thumbnail: '/api/placeholder/400/300', // We'll create a placeholder endpoint
        platform: 'TikTok'
      };
    }

    // Instagram
    const instagramMatch = url.match(/instagram\.com\/(p|reel)\/([^\/]+)/);
    if (instagramMatch) {
      return {
        title: 'Instagram Video',
        thumbnail: '/api/placeholder/400/300',
        platform: 'Instagram'
      };
    }

    // Twitter/X
    const twitterMatch = url.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/);
    if (twitterMatch) {
      return {
        title: 'Twitter/X Video',
        thumbnail: '/api/placeholder/400/300',
        platform: 'Twitter/X'
      };
    }

    // Generic video
    return {
      title: 'Video',
      thumbnail: '/api/placeholder/400/300',
      platform: 'Unknown'
    };
  } catch (error) {
    console.error('Error extracting video info:', error);
    return {
      title: 'Video',
      thumbnail: '/api/placeholder/400/300',
      platform: 'Unknown'
    };
  }
}

// Get YouTube video title using oEmbed
async function getYouTubeTitle(videoId: string): Promise<string> {
  try {
    // Use a CORS-friendly approach for client-side requests
    const response = await fetch(`/api/youtube-title?videoId=${videoId}`);
    if (response.ok) {
      const data = await response.json();
      return data.title || 'YouTube Video';
    }
    return 'YouTube Video';
  } catch {
    return 'YouTube Video';
  }
}

// Get Vimeo video info using oEmbed
async function getVimeoInfo(videoId: string): Promise<{ title: string; thumbnail: string }> {
  try {
    const response = await fetch(`/api/vimeo-info?videoId=${videoId}`);
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || 'Vimeo Video',
        thumbnail: data.thumbnail || '/api/placeholder/400/300'
      };
    }
    return {
      title: 'Vimeo Video',
      thumbnail: '/api/placeholder/400/300'
    };
  } catch {
    return {
      title: 'Vimeo Video',
      thumbnail: '/api/placeholder/400/300'
    };
  }
}

// Extract webpage information
export async function extractWebPageInfo(url: string): Promise<WebPageInfo> {
  try {
    // Use a service to extract metadata (in production, you'd want your own endpoint)
    const response = await fetch(`/api/extract-webpage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || new URL(url).hostname,
        thumbnail: data.image || '/api/placeholder/400/300',
        description: data.description
      };
    }
  } catch (error) {
    console.error('Error extracting webpage info:', error);
  }

  // Fallback
  return {
    title: new URL(url).hostname,
    thumbnail: '/api/placeholder/400/300'
  };
}

// Search for movie poster
export async function searchMoviePoster(movieName: string): Promise<MovieInfo> {
  try {
    // Use a movie poster search endpoint
    const response = await fetch(`/api/search-movie-poster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ movieName })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || movieName,
        poster: data.poster || '/api/placeholder/400/600',
        year: data.year
      };
    }
  } catch (error) {
    console.error('Error searching movie poster:', error);
  }

  // Fallback
  return {
    title: movieName,
    poster: '/api/placeholder/400/600'
  };
}

// Detect the type of content from URL
export function detectContentType(url: string): 'video' | 'webpage' | 'movie' {
  const videoPatterns = [
    /youtube\.com\/watch/,
    /youtu\.be\//,
    /vimeo\.com\/\d+/,
    /tiktok\.com\/.+\/video\//,
    /instagram\.com\/(p|reel)\//,
    /twitter\.com\/.+\/status\//,
    /x\.com\/.+\/status\//,
    /\.mp4$/,
    /\.webm$/,
    /\.mov$/,
    /\.avi$/
  ];

  for (const pattern of videoPatterns) {
    if (pattern.test(url)) {
      return 'video';
    }
  }

  return 'webpage';
}
