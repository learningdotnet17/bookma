import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { movieName } = await request.json();

    if (!movieName) {
      return NextResponse.json({ error: 'Movie name is required' }, { status: 400 });
    }

    // Search for movie poster using Google Images search
    // Note: This is a simplified approach. In production, you might want to use
    // a proper movie database API like TMDB or OMDB
    const searchQuery = encodeURIComponent(`${movieName} movie poster`);
    
    // Use a custom Google Image search approach
    const searchUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m`;
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract image URLs from Google Images results
        const imageMatches = html.match(/"ou":"([^"]+)"/g);
        
        if (imageMatches && imageMatches.length > 0) {
          // Get the first few image URLs
          const imageUrls = imageMatches
            .slice(0, 5)
            .map(match => match.match(/"ou":"([^"]+)"/)?.[1])
            .filter(Boolean)
            .filter(url => url && (url.includes('jpg') || url.includes('jpeg') || url.includes('png')));

          if (imageUrls.length > 0) {
            // Return the first valid image
            return NextResponse.json({
              title: movieName,
              poster: imageUrls[0],
              year: null // We could extract year if needed
            });
          }
        }
      }
    } catch (error) {
      console.error('Google search failed:', error);
    }

    // Fallback: Try Bing Image Search
    try {
      const bingSearchUrl = `https://www.bing.com/images/search?q=${searchQuery}&form=HDRSC2&first=1`;
      
      const bingResponse = await fetch(bingSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)'
        }
      });

      if (bingResponse.ok) {
        const html = await bingResponse.text();
        
        // Extract image URLs from Bing Images results
        const imageMatches = html.match(/murl&quot;:&quot;([^&]+)&quot;/g);
        
        if (imageMatches && imageMatches.length > 0) {
          const imageUrls = imageMatches
            .slice(0, 3)
            .map(match => match.match(/murl&quot;:&quot;([^&]+)&quot;/)?.[1])
            .filter(Boolean)
            .map(url => decodeURIComponent(url || ''))
            .filter(url => url && (url.includes('jpg') || url.includes('jpeg') || url.includes('png')));

          if (imageUrls.length > 0) {
            return NextResponse.json({
              title: movieName,
              poster: imageUrls[0],
              year: null
            });
          }
        }
      }
    } catch (error) {
      console.error('Bing search failed:', error);
    }

    // Final fallback: return placeholder
    return NextResponse.json({
      title: movieName,
      poster: `/api/placeholder/400/600?text=${encodeURIComponent(movieName)}`,
      year: null
    });

  } catch (error) {
    console.error('Error searching movie poster:', error);
    return NextResponse.json(
      { error: 'Failed to search movie poster' },
      { status: 500 }
    );
  }
}
