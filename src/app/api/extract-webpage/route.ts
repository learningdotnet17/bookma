import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BookmarkBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract metadata using simple regex patterns
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);

    // Extract images if no og:image found
    let image = ogImageMatch?.[1];
    if (!image) {
      const imgMatches = html.match(/<img[^>]*src="([^"]+)"/gi);
      if (imgMatches && imgMatches.length > 0) {
        // Get the first reasonable sized image
        for (const imgMatch of imgMatches) {
          const srcMatch = imgMatch.match(/src="([^"]+)"/i);
          if (srcMatch?.[1]) {
            const imgUrl = srcMatch[1];
            // Skip small icons and logos
            if (!imgUrl.includes('icon') && !imgUrl.includes('logo') && !imgUrl.includes('favicon')) {
              image = imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, url).href;
              break;
            }
          }
        }
      }
    } else {
      // Ensure og:image is absolute URL
      image = image.startsWith('http') ? image : new URL(image, url).href;
    }

    const title = ogTitleMatch?.[1] || titleMatch?.[1] || new URL(url).hostname;
    const description = ogDescMatch?.[1] || descMatch?.[1];

    return NextResponse.json({
      title: title.trim(),
      image: image || null,
      description: description?.trim()
    });

  } catch (error) {
    console.error('Error extracting webpage:', error);
    return NextResponse.json(
      { error: 'Failed to extract webpage information' },
      { status: 500 }
    );
  }
}
