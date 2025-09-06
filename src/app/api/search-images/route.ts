import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Use Google Custom Search API for better results
    // For now, we'll use a simplified approach with web scraping
    const searchQuery = encodeURIComponent(`${query} high quality image`);
    
    try {
      // Try Google Images search
      const googleUrl = `https://www.google.com/search?q=${searchQuery}&tbm=isch&tbs=isz:m`;
      
      const response = await fetch(googleUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract image URLs from Google Images results
        const imageMatches = html.match(/"ou":"([^"]+)"/g);
        
        if (imageMatches && imageMatches.length > 0) {
          const imageUrls = imageMatches
            .slice(0, 12) // Get first 12 images
            .map(match => match.match(/"ou":"([^"]+)"/)?.[1])
            .filter(Boolean)
            .filter(url => {
              if (!url) return false;
              const lowercaseUrl = url.toLowerCase();
              return (
                (lowercaseUrl.includes('jpg') || 
                 lowercaseUrl.includes('jpeg') || 
                 lowercaseUrl.includes('png') ||
                 lowercaseUrl.includes('webp')) &&
                !lowercaseUrl.includes('favicon') &&
                !lowercaseUrl.includes('logo') &&
                url.length < 500 // Avoid extremely long URLs
              );
            })
            .slice(0, 8); // Return max 8 images

          if (imageUrls.length > 0) {
            return NextResponse.json({
              images: imageUrls.map((url, index) => ({
                id: index,
                url: url,
                thumbnail: url
              }))
            });
          }
        }
      }
    } catch (error) {
      console.error('Google search failed:', error);
    }

    // Fallback: Try Bing Image Search
    try {
      const bingUrl = `https://www.bing.com/images/search?q=${searchQuery}&form=HDRSC2&first=1`;
      
      const bingResponse = await fetch(bingUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (bingResponse.ok) {
        const html = await bingResponse.text();
        
        // Extract image URLs from Bing Images results
        const imageMatches = html.match(/murl&quot;:&quot;([^&]+)&quot;/g);
        
        if (imageMatches && imageMatches.length > 0) {
          const imageUrls = imageMatches
            .slice(0, 8)
            .map(match => match.match(/murl&quot;:&quot;([^&]+)&quot;/)?.[1])
            .filter(Boolean)
            .map(url => decodeURIComponent(url || ''))
            .filter(url => {
              if (!url) return false;
              const lowercaseUrl = url.toLowerCase();
              return (
                (lowercaseUrl.includes('jpg') || 
                 lowercaseUrl.includes('jpeg') || 
                 lowercaseUrl.includes('png') ||
                 lowercaseUrl.includes('webp')) &&
                !lowercaseUrl.includes('favicon') &&
                url.length < 500
              );
            });

          if (imageUrls.length > 0) {
            return NextResponse.json({
              images: imageUrls.map((url, index) => ({
                id: index,
                url: url,
                thumbnail: url
              }))
            });
          }
        }
      }
    } catch (error) {
      console.error('Bing search failed:', error);
    }

    // Final fallback: return some placeholder suggestions
    return NextResponse.json({
      images: [
        {
          id: 0,
          url: `/api/placeholder/400/600?text=${encodeURIComponent(query)}`,
          thumbnail: `/api/placeholder/200/300?text=${encodeURIComponent(query)}`
        }
      ]
    });

  } catch (error) {
    console.error('Error searching images:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
