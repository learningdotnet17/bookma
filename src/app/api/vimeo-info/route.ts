import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Fetch from Vimeo oEmbed API
    const response = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`,
      {
        headers: {
          'User-Agent': 'BookMa/1.0 (Bookmark Manager)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Vimeo API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      title: data.title || 'Vimeo Video',
      thumbnail: data.thumbnail_url || `/api/placeholder/400/300?text=Vimeo Video`
    });

  } catch (error) {
    console.error('Error fetching Vimeo info:', error);
    return NextResponse.json(
      { 
        title: 'Vimeo Video',
        thumbnail: `/api/placeholder/400/300?text=Vimeo Video`
      },
      { status: 200 } // Return 200 with fallback data instead of error
    );
  }
}
