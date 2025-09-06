import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Fetch from YouTube oEmbed API
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookMa/1.0)'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      return NextResponse.json({
        title: data.title || 'YouTube Video',
        thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
    } else {
      // Fallback when oEmbed fails
      console.warn(`YouTube oEmbed failed (${response.status}), using fallback`);
      return NextResponse.json({
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      });
    }

  } catch (error) {
    console.error('Error fetching YouTube title:', error);
    return NextResponse.json(
      { 
        title: 'YouTube Video',
        thumbnail: `/api/placeholder/400/300?text=YouTube Video`
      },
      { status: 200 } // Return 200 with fallback data instead of error
    );
  }
}
